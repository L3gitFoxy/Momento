const http = require("http");
const https = require("https");
const { URL } = require("url");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const DEFAULT_PORT = process.env.PORT || 8787;
const PROFILE_DIR =
  process.env.MOMENTO_DATA_DIR ||
  process.env.RAILWAY_VOLUME_MOUNT_PATH ||
  (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID ? path.join("/data") : __dirname);
const PROFILE_FILE = path.join(PROFILE_DIR, "momento-profiles.json");
// Store tokens in-memory AND persist to file for session recovery
const tokensMemory = new Map();
const tokenExpiry = new Map();

console.log("[Momento] Profile file:", PROFILE_FILE);

function loadProfiles() {
  try {
    const data = JSON.parse(fs.readFileSync(PROFILE_FILE, "utf8"));
    // Restore in-memory tokens from persistent storage on startup
    if (data.sessionTokens) {
      Object.entries(data.sessionTokens).forEach(([token, username]) => {
        tokensMemory.set(token, username);
        tokenExpiry.set(token, Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      });
    }
    return data;
  } catch {
    return { users: {}, sessionTokens: {} };
  }
}

function saveProfiles(db) {
  try {
    fs.mkdirSync(path.dirname(PROFILE_FILE), { recursive: true });
  } catch (e) {}
  // Persist active tokens to file for recovery after restart
  db.sessionTokens = Object.fromEntries(tokensMemory);
  fs.writeFileSync(PROFILE_FILE, JSON.stringify(db, null, 2), "utf8");
}

function hashPass(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
}

function makeToken() {
  return crypto.randomBytes(24).toString("hex");
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 2e6) {
        reject(new Error("body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(new Error("invalid json"));
      }
    });
    req.on("error", reject);
  });
}

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
  throw lastErr || new Error("Search services temporarily unavailable");
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
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function createHandler() {
  return async (req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      });
      res.end();
      return;
    }
    const u = new URL(req.url, "http://127.0.0.1");
    try {
      if (u.pathname === "/api/health") {
        sendJson(res, 200, { ok: true, service: "Momento Music", auth: true });
        return;
      }

      if (u.pathname === "/api/auth/signup" && req.method === "POST") {
        const body = await readBody(req);
        const username = String(body.username || "").trim().toLowerCase();
        const password = String(body.password || "");
        if (!/^[a-z0-9_]{3,24}$/.test(username)) {
          return sendJson(res, 400, { error: "Invalid username" });
        }
        if (password.length < 4) return sendJson(res, 400, { error: "Password too short" });
        const db = loadProfiles();
        if (db.users[username]) return sendJson(res, 409, { error: "Username already taken" });
        const salt = crypto.randomBytes(16).toString("hex");
        db.users[username] = {
          salt,
          passHash: hashPass(password, salt),
          data: null,
          created: Date.now()
        };
        saveProfiles(db);
        const token = makeToken();
        tokensMemory.set(token, username);
        tokenExpiry.set(token, Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        saveProfiles(db); // Persist token immediately
        return sendJson(res, 200, { token, username, data: null });
      }

      if (u.pathname === "/api/auth/login" && req.method === "POST") {
        const body = await readBody(req);
        const username = String(body.username || "").trim().toLowerCase();
        const password = String(body.password || "");
        const db = loadProfiles();
        const user = db.users[username];
        if (!user) return sendJson(res, 401, { error: "No account found" });
        if (hashPass(password, user.salt) !== user.passHash) {
          return sendJson(res, 401, { error: "Wrong password" });
        }
        const token = makeToken();
        tokensMemory.set(token, username);
        tokenExpiry.set(token, Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        const db2 = loadProfiles();
        db2.sessionTokens = Object.fromEntries(tokensMemory);
        saveProfiles(db2); // Persist token immediately
        return sendJson(res, 200, { token, username, data: user.data || null });
      }

      if (u.pathname === "/api/auth/data" && (req.method === "GET" || req.method === "PUT")) {
        const auth = String(req.headers.authorization || "");
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        const username = tokensMemory.get(token);
        if (!username) return sendJson(res, 401, { error: "Not logged in" });
        const db = loadProfiles();
        const user = db.users[username];
        if (!user) return sendJson(res, 401, { error: "User missing" });
        if (req.method === "GET") {
          return sendJson(res, 200, { data: user.data || null });
        }
        const body = await readBody(req);
        user.data = body.data || null;
        user.updated = Date.now();
        saveProfiles(db);
        return sendJson(res, 200, { ok: true });
      }

      if (u.pathname === "/api/search") {
        const rawQ = (u.searchParams.get("q") || "").trim();
        if (!rawQ) return sendJson(res, 400, { error: "Please enter a search term" });

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
            if (type && type !== "stream" && type !== "video") return false;
            return it.url || it.id || it.videoId;
          })
          .map((it) => {
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

            if (!id || id.startsWith("UC") || id.startsWith("PL") || id.startsWith("RD") || id.length < 5) {
              return null;
            }

            return {
              id: id.trim(),
              title: (it.title || "Untitled").trim(),
              artist: (it.uploaderName || it.uploader || it.author || "Unknown").toString().trim(),
              artwork: it.thumbnail || (it.thumbnails && it.thumbnails[0]) || null,
              duration: it.duration || it.lengthSeconds || null,
              source: "youtube",
            };
          })
          .filter((t) => t !== null && t.id && t.title)
          .slice(0, 15);

        sendJson(res, 200, { tracks });
        return;
      }
      if (u.pathname === "/api/play") {
        const id = (u.searchParams.get("id") || "").trim();
        if (!id) return sendJson(res, 400, { error: "Track ID required" });
        const { json } = await withInstances(`/streams/${encodeURIComponent(id)}`);
        const best = pickBestAudio(json.audioStreams || []);
        if (!best || !best.url) {
          sendJson(res, 404, { error: "Track unavailable" });
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

      const publicDir = path.join(__dirname, "..");
      let filePath = path.join(publicDir, u.pathname === "/" ? "index.html" : u.pathname);

      fs.readFile(filePath, (err, content) => {
        if (err) {
          fs.readFile(path.join(publicDir, "index.html"), (err2, indexContent) => {
            if (err2) {
              sendJson(res, 404, { error: "Page not found" });
            } else {
              res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
              res.end(indexContent);
            }
          });
          return;
        }

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
      sendJson(res, 502, { error: "Service temporarily unavailable", detail: String(e.message || e) });
    }
  };
}

function startMusicServer(port = DEFAULT_PORT, host = process.env.HOST || "0.0.0.0") {
  return new Promise((resolve, reject) => {
    const server = http.createServer(createHandler());
    server.once("error", reject);
    server.listen(port, host, () => {
      const addr = server.address();
      const p = typeof addr === "object" && addr ? addr.port : port;
      console.log("[Momento] Music service ready on http://" + host + ":" + p);
      resolve({ server, port: p, host });
    });
  });
}

module.exports = { startMusicServer, createHandler };

if (require.main === module) {
  const port = Number(process.env.PORT) || DEFAULT_PORT;
  const host = process.env.HOST || "0.0.0.0";
  startMusicServer(port, host).then(({ port, host }) => {
    console.log("\n🎵 Momento Music Backend");
    console.log("   listening on " + host + ":" + port + "\n");
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
