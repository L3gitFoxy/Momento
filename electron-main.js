const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { startMusicServer } = require('./music-server/server');

let mainWindow = null;
let musicServer = null;
const MUSIC_PORT = process.env.PORT || 8787;

async function createWindow() {
  try {
    const started = await startMusicServer(MUSIC_PORT);
    musicServer = started.server;
  } catch (e) {
    console.warn("[Momento] Music server:", e.message || e);
  }

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 720,
    minHeight: 560,
    title: "Momento",
    backgroundColor: "#120f1d",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    show: false,
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.executeJavaScript(`
      try {
        localStorage.setItem("MOMENTO_MUSIC_API", "http://127.0.0.1:${MUSIC_PORT}");
        window.__MOMENTO_DESKTOP__ = true;
      } catch (e) {}
    `).catch(() => {});
  });

  // Allow Google / Supabase OAuth to stay inside the app window.
  // Opening them externally breaks the redirect back to localhost:8787.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const u = new URL(url);
      const isOAuth =
        u.hostname.includes("accounts.google.com") ||
        u.hostname.includes("google.com") ||
        u.hostname.includes("supabase.co") ||
        u.hostname === "127.0.0.1" ||
        u.hostname === "localhost";
      if (isOAuth) {
        return { action: "allow" };
      }
    } catch (e) {}
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Do NOT intercept navigation to Google / Supabase – the OAuth flow must
  // complete inside this window so the final redirect lands on localhost.
  mainWindow.webContents.on("will-navigate", (event, url) => {
    try {
      const u = new URL(url);
      const isOAuthRelated =
        u.hostname.includes("accounts.google.com") ||
        u.hostname.includes("google.com") ||
        u.hostname.includes("supabase.co") ||
        u.hostname === "127.0.0.1" ||
        u.hostname === "localhost";
      if (isOAuthRelated) {
        return; // allow navigation inside the app
      }
    } catch (e) {}
    // Block navigation away from the app for unrelated sites
    if (!url.startsWith(`http://127.0.0.1:${MUSIC_PORT}`) &&
        !url.startsWith(`http://localhost:${MUSIC_PORT}`)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  await mainWindow.loadURL(`http://127.0.0.1:${MUSIC_PORT}`);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (musicServer) {
    try { musicServer.close(); } catch (e) {}
    musicServer = null;
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
