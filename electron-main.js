/**
 * Momento desktop shell (Electron)
 * - Loads the UI via local HTTP server (satisfies YouTube requirement)
 * - Starts the music backend INSIDE this process (no extra terminal window)
 * - Network is only needed for music search / streaming
 */

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { startMusicServer } = require('./music-server/server'); // Import your server

let mainWindow = null;
let musicServer = null;
const MUSIC_PORT = 8787;

async function createWindow() {
  // Hidden backend — same process, no extra window
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
    show: false, // Starts hidden
  });

  // 1. REGISTER THIS LISTENER FIRST so it doesn't get missed
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Tell the renderer where the built-in API lives
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.executeJavaScript(`
      try {
        localStorage.setItem("MOMENTO_MUSIC_API", "http://127.0.0.1:${MUSIC_PORT}");
        window.__MOMENTO_DESKTOP__ = true;
      } catch (e) {}
    `).catch(() => {});
  });

  // Open external links in the real browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // 2. LOAD THE URL AFTER THE LISTENER IS SET UP
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