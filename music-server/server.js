/**
 * Momento Music Backend
 * Standalone:  node server.js
 * Electron:    require("./music-server/server").startMusicServer(port)
 */
const http = require("http");
const https = require("https");
const { URL } = require("url");
const path = require("path");
const fs = require("fs");

const DEFAULT_PORT = process.env.PORT || 8787;

const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de",
  "https://api.piped.private.coffee",
  "https://pipedapi.projekt.net.in",
  "https://pipedapi.syncpundit.io",
];

function fetchJson(url, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === "https:" ? https : http;
    const req = lib.get(
      url,
      {
        headers: { "User-Agent": "MomentoMusic/1.0", Accept: "application/json" },
        timeout: timeoutMs,
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchJson(res.headers.location, timeoutMs).then(resolve).catch(reject);
          return;
        }
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error("HTTP " + res.statusCode));
            return;
          }
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error("Invalid JSON")); }
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

async function withInstances(pathAndQuery) {
  let lastErr;
  for (const base of PIPED_INSTANCES) {
    try {
      const json = await fetchJson(base + pathAndQuery);
      return { json, base };
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("All Piped instances failed");
}

function pickBestAudio(audioStreams) {
  if (!Array.isArray(audioStreams) || !audioStreams.length) return null;
  const scored = audioStreams
    .filter((s) => s.url)
    .map((s) => {
      const mime = (s.mimeType || s.format || "").toLowerCase();
      let score = s.bitrate || s.quality || 0;
      if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")) score += 50000;
      if (mime.includes("opus")) score += 20000;
      return { s, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored[0] ? scored[0].s : null;
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function createHandler() {
  return async (req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      return;
    }
    const u = new URL(req.url, "http://127.0.0.1");
    try {
      if (u.pathname === "/api/health") {
        sendJson(res, 200, { ok: true, service: "Momento Music Backend" });
        return;
      }
      if (u.pathname === "/api/search") {
        const rawQ = (u.searchParams.get("q") || "").trim();
        if (!rawQ) return sendJson(res, 400, { error: "Missing q" });

        let json;
        try {
          ({ json } = await withInstances(`/search?q=${encodeURIComponent(rawQ)}&filter=music_songs`));
        } catch {
          try {
            ({ json } = await withInstances(`/search?q=${encodeURIComponent(rawQ)}&filter=videos`));
          } catch {
            ({ json } = await withInstances(`/search?q=${encodeURIComponent(rawQ + " official")}&filter=videos`));
          }
        }
        
        const items = (json.items || json) || [];
        const tracks = (Array.isArray(items) ? items : [])
          .filter((it) => {
            const type = (it.type || "").toLowerCase();
            // Strictly allow only video/stream types
            if (type && type !== "stream" && type !== "video") return false;
            return it.url || it.id || it.videoId;
          })
          .map((it) => {
            // Extract clean YouTube ID safely
            let id = it.id || it.videoId || "";
            const rawUrl = it.url || "";
            
            if (!id && rawUrl) {
              if (rawUrl.includes("v=")) {
                const match = rawUrl.match(/[?&]v=([^&]+)/);
                if (match) id = match[1];
              } else {
                id = rawUrl.split("/").pop();
              }
            }

            // Drop bad IDs (channels, playlists)
            if (!id || id.startsWith("UC") || id.startsWith("PL") || id.startsWith("RD") || id.length < 5) {
              return null;
            }

            return {
              id: id.trim(),
              title: (it.title || "Untitled").trim(),
              artist: (it.uploaderName || it.uploader || it.author || "YouTube").toString().trim(),
              artwork: it.thumbnail || (it.thumbnails && it.thumbnails[0]) || null,
              duration: it.duration || it.lengthSeconds || null,
              source: "youtube",
            };
          })
          .filter((t) => t !== null && t.id && t.title)
          .slice(0, 15); // Limit to top 15 clean results to avoid random clutter

        sendJson(res, 200, { tracks });
        return;
      }
      if (u.pathname === "/api/play") {
        const id = (u.searchParams.get("id") || "").trim();
        if (!id) return sendJson(res, 400, { error: "Missing id" });
        const { json } = await withInstances(`/streams/${encodeURIComponent(id)}`);
        const best = pickBestAudio(json.audioStreams || []);
        if (!best || !best.url) {
          sendJson(res, 404, { error: "No audio stream found" });
          return;
        }
        sendJson(res, 200, {
          id,
          title: json.title || null,
          artist: json.uploader || json.uploaderName || null,
          duration: json.duration || null,
          streamUrl: best.url,
          mimeType: best.mimeType || null,
          bitrate: best.bitrate || null,
        });
        return;
      }
      // If it's not an API route, serve the frontend files statically
      const publicDir = path.join(__dirname, "..");
      let filePath = path.join(publicDir, u.pathname === "/" ? "index.html" : u.pathname);

      fs.readFile(filePath, (err, content) => {
        if (err) {
          // Fallback to index.html for Single Page Applications (SPA support)
          fs.readFile(path.join(publicDir, "index.html"), (err2, indexContent) => {
            if (err2) {
              sendJson(res, 404, { error: "Not found" });
            } else {
              res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
              res.end(indexContent);
            }
          });
          return;
        }

        // Map file extensions to correct MIME types
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          ".html": "text/html",
          ".css": "text/css",
          ".js": "application/javascript",
          ".json": "application/json",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".svg": "image/svg+xml",
          ".ico": "image/x-icon",
        };
        const contentType = mimeTypes[ext] || "application/octet-stream";

        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      });
      return;
    } catch (e) {
      console.error(e);
      sendJson(res, 502, { error: "Upstream failed", detail: String(e.message || e) });
    }
  };
}

function startMusicServer(port = DEFAULT_PORT) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(createHandler());
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      const addr = server.address();
      const p = typeof addr === "object" && addr ? addr.port : port;
      console.log("[Momento] Music API on http://127.0.0.1:" + p);
      resolve({ server, port: p });
    });
  });
}

module.exports = { startMusicServer, createHandler };

if (require.main === module) {
  startMusicServer(DEFAULT_PORT).then(({ port }) => {
    console.log("\n🎵 Momento Music Backend");
    console.log("   http://127.0.0.1:" + port + "\n");
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
