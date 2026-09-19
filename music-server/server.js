const http = require("http");
const https = require("https");
const { URL } = require("url");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const os = require("os");

/** Load music-server/.env (and parent .env) into process.env without dotenv */
function loadMomentoEnv() {
  const candidates = [
    path.join(__dirname, ".env"),
    path.join(__dirname, "..", ".env"),
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "music-server", ".env"),
  ];
  for (const file of candidates) {
    try {
      if (!fs.existsSync(file)) continue;
      const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq <= 0) continue;
        let key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        // Allow "AI API KEY" style by normalizing spaces → underscores
        key = key.replace(/\s+/g, "_");
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (process.env[key] === undefined || process.env[key] === "") {
          process.env[key] = val;
        }
      }
    } catch (e) {}
  }
}
loadMomentoEnv();


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "YOUR_GOOGLE_CLIENT_SECRET";
const REDIRECT_URI = "http://127.0.0.1:8787/auth/google/callback";

const DEFAULT_PORT = process.env.PORT || 8787;

function resolveMomentoUserFile() {
  if (process.env.MOMENTO_USERS_FILE) return process.env.MOMENTO_USERS_FILE;
  if (process.env.MOMENTO_DATA_DIR) return path.join(process.env.MOMENTO_DATA_DIR, "users.json");
  if (process.env.RAILWAY_VOLUME_MOUNT_PATH) {
    return path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, "users.json");
  }
  if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID) {
    return path.join("/data", "users.json");
  }
  if (process.platform === "win32") {
    return path.join("C:\\", "Momento", "users.json");
  }
  return path.join(os.homedir(), "Momento", "users.json");
}

function resolveOfflineSyncFile() {
  if (process.env.MOMENTO_OFFLINE_SYNC) return process.env.MOMENTO_OFFLINE_SYNC;
  if (process.platform === "win32") {
    return path.join("C:\\", "Momento", "Offline-Sync.json");
  }
  return path.join(os.homedir(), "Momento", "Offline-Sync.json");
}
const OFFLINE_SYNC_FILE = resolveOfflineSyncFile();

function resolveDeviceConfigFile() {
  if (process.env.MOMENTO_DEVICE_CONFIG) return process.env.MOMENTO_DEVICE_CONFIG;
  if (process.env.MOMENTO_DATA_DIR) return path.join(process.env.MOMENTO_DATA_DIR, "deviceConfig.json");
  if (process.platform === "win32") {
    return path.join("C:\\", "Momento", "deviceConfig.json");
  }
  return path.join(os.homedir(), "Momento", "deviceConfig.json");
}
const DEVICE_CONFIG_FILE = resolveDeviceConfigFile();
const DEFAULT_DEVICE_CONFIG = {
  openedFirstTime: true,
  tutorialCompleted: false,
  tutorialStep: 0,
  showedCL6_2: false,
  changelogVersionShown: null
};

function readDeviceConfig() {
  try {
    const raw = JSON.parse(fs.readFileSync(DEVICE_CONFIG_FILE, "utf8"));
    return Object.assign({}, DEFAULT_DEVICE_CONFIG, raw && typeof raw === "object" ? raw : {});
  } catch {
    return Object.assign({}, DEFAULT_DEVICE_CONFIG);
  }
}
function writeDeviceConfig(cfg) {
  const merged = Object.assign({}, DEFAULT_DEVICE_CONFIG, cfg && typeof cfg === "object" ? cfg : {});
  fs.mkdirSync(path.dirname(DEVICE_CONFIG_FILE), { recursive: true });
  fs.writeFileSync(DEVICE_CONFIG_FILE, JSON.stringify(merged, null, 2), "utf8");
  return merged;
}


function readOfflineSync() {
  try {
    return JSON.parse(fs.readFileSync(OFFLINE_SYNC_FILE, "utf8"));
  } catch {
    return null;
  }
}
function writeOfflineSync(payload) {
  fs.mkdirSync(path.dirname(OFFLINE_SYNC_FILE), { recursive: true });
  fs.writeFileSync(OFFLINE_SYNC_FILE, JSON.stringify(payload, null, 2), "utf8");
  return OFFLINE_SYNC_FILE;
}

const PROFILE_FILE = resolveMomentoUserFile();
const PROFILE_DIR = path.dirname(PROFILE_FILE);

const tokensMemory = new Map();
const tokenExpiry = new Map();

console.log("[Momento] Profile file:", PROFILE_FILE);

function loadProfiles() {
  try {
    const data = JSON.parse(fs.readFileSync(PROFILE_FILE, "utf8"));
    if (data.sessionTokens) {
      Object.entries(data.sessionTokens).forEach(([token, username]) => {
        tokensMemory.set(token, username);
        tokenExpiry.set(token, Date.now() + 30 * 24 * 60 * 60 * 1000);
      });
    }
    return data;
  } catch {
    
    const legacyCandidates = [
      path.join(__dirname, "momento-profiles.json"),
      path.join(PROFILE_DIR, "momento-profiles.json"),
    ];
    for (const leg of legacyCandidates) {
      try {
        if (fs.existsSync(leg)) {
          const data = JSON.parse(fs.readFileSync(leg, "utf8"));
          if (data && data.users) {
            try { saveProfiles(data); } catch (e) {}
            if (data.sessionTokens) {
              Object.entries(data.sessionTokens).forEach(([token, username]) => {
                tokensMemory.set(token, username);
                tokenExpiry.set(token, Date.now() + 30 * 24 * 60 * 60 * 1000);
              });
            }
            
            try {
              const archived = leg + ".migrated.bak";
              if (fs.existsSync(archived)) fs.unlinkSync(archived);
              fs.renameSync(leg, archived);
              console.log("[Momento] Migrated accounts from", leg, "→", PROFILE_FILE, "(legacy renamed to .migrated.bak)");
            } catch (renErr) {
              try { fs.unlinkSync(leg); } catch (e2) {}
              console.log("[Momento] Migrated accounts from", leg, "→", PROFILE_FILE, "(legacy removed)");
            }
            return data;
          }
        }
      } catch (e) {}
    }
    return { users: {}, sessionTokens: {} };
  }
}

function saveProfiles(db) {
  try {
    fs.mkdirSync(path.dirname(PROFILE_FILE), { recursive: true });
  } catch (e) {}
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


/* ---- AI plan assistant (server-side key, rate limited) ---- */
const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || process.env.GROQ_KEY || "";
const AI_API_BASE = (process.env.AI_API_BASE || process.env.OPENAI_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/, "");
const AI_MODEL = process.env.AI_MODEL || process.env.GROQ_MODEL || "openai/gpt-oss-20b";
const AI_RPM_LIMIT = Math.max(5, parseInt(process.env.AI_RPM_LIMIT || "30", 10) || 30);
if (AI_API_KEY) {
  console.log("[Momento AI] configured, model=" + AI_MODEL + " base=" + AI_API_BASE);
} else {
  console.log("[Momento AI] not configured — set AI_API_KEY in music-server/.env");
}
const _aiHits = new Map(); // ip -> timestamps

function aiClientIp(req) {
  return (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "local").toString().split(",")[0].trim();
}

function aiRateOk(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  let arr = _aiHits.get(ip) || [];
  arr = arr.filter((t) => now - t < windowMs);
  if (arr.length >= AI_RPM_LIMIT) {
    _aiHits.set(ip, arr);
    return false;
  }
  arr.push(now);
  _aiHits.set(ip, arr);
  return true;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => { raw += c; if (raw.length > 1e6) reject(new Error("body too large")); });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

function openaiChat(messages, opts) {
  opts = opts || {};
  return new Promise((resolve, reject) => {
    if (!AI_API_KEY) {
      reject(new Error("AI_API_KEY not configured on server"));
      return;
    }
    const url = new URL(AI_API_BASE + "/chat/completions");
    const body = {
      model: opts.modelOverride || AI_MODEL,
      temperature: opts.temperature != null ? opts.temperature : 0.3,
      messages
    };
    // Prefer max_completion_tokens (Groq newer API); keep max_tokens as fallback field name some proxies expect
    const mt = opts.max_tokens || 2500;
    body.max_completion_tokens = mt;
    body.max_tokens = mt;
    const payload = JSON.stringify(body);
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname + url.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + AI_API_KEY,
        "Content-Length": Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = "";
      res.on("data", (c) => { data += c; });
      res.on("end", () => {
        try {
          const j = JSON.parse(data);
          if (j.error) {
            // Groq nests failed_generation in a few shapes — surface all of it
            const err = j.error;
            const failed =
              err.failed_generation ||
              (err.error && err.error.failed_generation) ||
              err.failedGeneration ||
              (typeof err === "object" && err.details && err.details.failed_generation) ||
              null;
            const msg = err.message || err.code || JSON.stringify(err);
            console.error("[Momento AI] Groq error full payload:", data.slice(0, 4000));
            if (failed) console.error("[Momento AI] failed_generation:", String(failed).slice(0, 4000));
            const errObj = new Error(msg);
            errObj.failed_generation = failed ? String(failed) : null;
            errObj.raw = data.slice(0, 4000);
            errObj.status = res.statusCode;
            return reject(errObj);
          }
          const text = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
          if (!text) return reject(new Error("Empty model response: " + data.slice(0, 300)));
          resolve(text);
        } catch (e) {
          console.error("[Momento AI] non-JSON response:", data.slice(0, 2000));
          reject(new Error("Bad AI response: " + data.slice(0, 500)));
        }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function extractJsonObject(text) {
  if (!text || typeof text !== "string") return null;
  const cleaned = text.replace(/```json\s*/gi, "```").replace(/```/g, "").trim();
  try { return JSON.parse(cleaned); } catch (e) {}
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch (e) {}
  }
  return null;
}

const AI_PLAN_SYSTEM = `You maintain schedules for Momento.

COLLECTING fixed commitments:
- Only lock what the user stated (school, classes, sports, work).
- week arrays = fixed blocks only. Empty [] for days with none.
- Never invent Study/Homework/Leisure filler while collecting.

When user says no / nothing else / done:
- JSON only: {"reply":"...","done":true,"week":{...}} with fixed blocks only for Mon-Sun.

EDIT MODE (user is fixing a full week):
- You receive the current FULL week JSON and a change request.
- Apply their changes precisely (times, remove, add, rename, which days).
- Return the FULL updated week for all 7 days (not fixed-only).
- Do NOT spam duplicate Study or Homework blocks. Keep schedules clean.
- If a time is missing, ask for it in reply and set done:false.
- After changes, still done:false until they say nothing else.

Always prefer correct days: "mon-sat" / "every day except Sunday" = Monday through Saturday.`;


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

    if (u.pathname === "/api/device-config" && req.method === "GET") {
      const cfg = readDeviceConfig();
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify(cfg));
      return;
    }
    if (u.pathname === "/api/device-config" && req.method === "POST") {
      readBody(req).then((body) => {
        const current = readDeviceConfig();
        const next = Object.assign({}, current, body && typeof body === "object" ? body : {});
        const saved = writeDeviceConfig(next);
        res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify(saved));
      }).catch((e) => {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: String(e.message || e) }));
      });
      return;
    }
    if (u.pathname === "/api/device-config" && req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      res.end();
      return;
    }

    try {
      
      if (u.pathname === "/api/offline-sync" && req.method === "PUT") {
        const body = await readBody(req);
        const file = writeOfflineSync({
          updatedAt: Date.now(),
          userId: body.userId || null,
          email: body.email || null,
          data: body.data || body,
        });
        return sendJson(res, 200, { ok: true, file });
      }
      if (u.pathname === "/api/offline-sync" && req.method === "GET") {
        const stored = readOfflineSync();
        if (!stored) return sendJson(res, 404, { error: "No offline sync file" });
        return sendJson(res, 200, stored);
      }
      if (u.pathname === "/api/offline-sync" && req.method === "DELETE") {
        try { fs.unlinkSync(OFFLINE_SYNC_FILE); } catch (e) {}
        return sendJson(res, 200, { ok: true });
      }


      if (u.pathname === "/api/ai/status" && req.method === "GET") {
        return sendJson(res, 200, {
          ok: true,
          configured: !!AI_API_KEY,
          model: AI_MODEL,
          base: AI_API_BASE,
          rpmLimit: AI_RPM_LIMIT
        });
      }

      if (u.pathname === "/api/ai/plan" && req.method === "POST") {
        try {
          const ip = aiClientIp(req);
          if (!aiRateOk(ip)) {
            return sendJson(res, 429, { error: "Rate limit, try again in a minute." });
          }
          if (!AI_API_KEY) {
            return sendJson(res, 503, { error: "AI not configured. Set AI_API_KEY on the server." });
          }
          const body = await readJsonBody(req);
          const history = Array.isArray(body.history) ? body.history.slice(-16) : [];
          const userMessage = String(body.message || "").slice(0, 4000);
          const context = body.context && typeof body.context === "object" ? body.context : {};
          const messages = [
            { role: "system", content: AI_PLAN_SYSTEM + "\nApp context: " + JSON.stringify(context).slice(0, 1500) },
            ...history.map((h) => ({
              role: h.role === "assistant" ? "assistant" : "user",
              content: String(h.content || "").slice(0, 2000)
            })),
            { role: "user", content: userMessage || "Help me plan my week." }
          ];
          let raw = null;
          let lastErr = null;
          const modelsTry = [AI_MODEL, "openai/gpt-oss-20b", "openai/gpt-oss-120b"].filter((v, i, a) => v && a.indexOf(v) === i);
          for (const model of modelsTry) {
            try {
              const saved = AI_MODEL;
              // temporarily override via message-level by mutating body in a local call
              raw = await openaiChat(messages, { temperature: 0.2, max_tokens: 2500, modelOverride: model });
              lastErr = null;
              break;
            } catch (e1) {
              lastErr = e1;
              console.warn("[Momento AI] model failed", model, e1.message || e1);
            }
          }
          if (raw == null) {
            const fg = lastErr && lastErr.failed_generation ? String(lastErr.failed_generation) : null;
            console.error("[Momento AI] all models failed:", lastErr && lastErr.message, fg ? ("\nfailed_generation:\n" + fg) : "");
            return sendJson(res, 200, {
              reply: "I had trouble reaching the model (" + String(lastErr && lastErr.message || lastErr) + ")." +
                (fg ? ("\n\n**failed_generation:**\n```\n" + fg.slice(0, 1500) + "\n```") : "") +
                "\n\nSay your fixed times again, or say **no** to use a local build.",
              done: false,
              askAnythingElse: true,
              week: null,
              error: String(lastErr && lastErr.message || lastErr || "unknown"),
              failed_generation: fg
            });
          }
          let parsed = extractJsonObject(raw);
          if (!parsed) {
            // plain-text intermediate turn
            parsed = { reply: String(raw).trim().slice(0, 1000), done: false, askAnythingElse: true, week: null };
          }
          if (parsed.week && typeof parsed.week === "object") {
            const map = {
              mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
              fri: "Friday", sat: "Saturday", sun: "Sunday",
              monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
              thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday"
            };
            const norm = {};
            for (const [k, v] of Object.entries(parsed.week)) {
              const key = map[String(k).toLowerCase()] || k;
              norm[key] = v;
            }
            parsed.week = norm;
          }
          return sendJson(res, 200, {
            reply: parsed.reply || String(raw).trim().slice(0, 500) || "Got it.",
            done: !!parsed.done,
            askAnythingElse: parsed.askAnythingElse !== false,
            week: parsed.week || null
          });
        } catch (e) {
          const fg = e && e.failed_generation ? String(e.failed_generation) : null;
          console.error("[Momento AI] plan error:", e && e.message, fg || "", e && e.raw || "");
          return sendJson(res, 200, {
            reply: "Planning hiccup: " + String(e.message || e) +
              (fg ? ("\n\n**failed_generation:**\n```\n" + fg.slice(0, 1500) + "\n```") : "") +
              ". Tell me your fixed times again, or say **no**.",
            done: false,
            askAnythingElse: true,
            week: null,
            error: String(e.message || e),
            failed_generation: fg
          });
        }
      }

      if (u.pathname === "/api/health") {
        sendJson(res, 200, { ok: true, service: "Momento Music", auth: true });
        return;
      }

      
      
      
      if (u.pathname === "/auth/google") {
        const supabaseUrl = "https://zfvaylgvhgmwmlpiwjzw.supabase.co";
        const redirectUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent("http://127.0.0.1:8787/")}`;
        res.writeHead(302, { Location: redirectUrl });
        res.end();
        return;
      }

      if (u.pathname === "/auth/google/callback") {
        res.writeHead(302, { Location: "/" });
        res.end();
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
        tokenExpiry.set(token, Date.now() + 30 * 24 * 60 * 60 * 1000);
        saveProfiles(db);
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
        tokenExpiry.set(token, Date.now() + 30 * 24 * 60 * 60 * 1000);
        const db2 = loadProfiles();
        db2.sessionTokens = Object.fromEntries(tokensMemory);
        saveProfiles(db2);
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