const { app, BrowserWindow, shell, Tray, Menu, ipcMain, nativeImage } = require('electron');
const path = require('path');
const { startMusicServer } = require('./music-server/server');

let mainWindow = null;
let musicServer = null;
let tray = null;
let runInBackground = false;
const MUSIC_PORT = process.env.PORT || 8787;

function resolveAppIcon() {
  const candidates = [
    path.join(__dirname, 'assets', 'icon.ico'),
    path.join(__dirname, 'assets', 'icon.png'),
    path.join(__dirname, 'assets', 'logo.png'),
    path.join(__dirname, 'build', 'icon.ico'),
    path.join(__dirname, 'build', 'icon.png'),
    path.join(__dirname, 'icon.ico'),
    path.join(__dirname, 'icon.png'),
  ];
  for (const p of candidates) {
    try {
      const img = nativeImage.createFromPath(p);
      if (img && !img.isEmpty()) return img;
    } catch (e) {}
  }
  return nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAnUlEQVRYR+2W0Q3AIAhE3X8f3cAd3MARukJX6ApdoVvoBr1JJcaWGqDxJ/dD8g4QEEIIIebBJSJvZnYHcANwV3V7A/AE8ADwYGbHPbPaATgBuALYATiq+v5XgIjczOzFzJ7M7KGqT2Y2/1eAiDyJ6ADg8gfA2cxu/wQQkY+q7kTkYmYXVX1s7f8DIISQ/5E3gBBCCCGEEEIIIYQQQv4NXjYdHykJbqGMAAAAAElFSuQmCC'
  );
}

function createTray() {
  if (tray) return;
  try {
    const img = resolveAppIcon();
    tray = new Tray(img.isEmpty() ? nativeImage.createEmpty() : img);
    tray.setToolTip('Momento');
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show Momento', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } } },
      { label: 'Quit', click: () => { runInBackground = false; app.isQuitting = true; app.quit(); } }
    ]);
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } });
  } catch (e) {
    console.warn('[Momento] tray failed', e);
  }
}

function destroyTray() {
  if (tray) {
    try { tray.destroy(); } catch (e) {}
    tray = null;
  }
}

async function createWindow() {
  try {
    const started = await startMusicServer(MUSIC_PORT);
    musicServer = started.server;
  } catch (e) {
    console.warn("[Momento] Music server:", e.message || e);
  }

  const appIcon = resolveAppIcon();
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 720,
    minHeight: 560,
    title: "Momento",
    icon: appIcon,
    backgroundColor: "#120f1d",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'),
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

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const u = new URL(url);
      const host = (u.hostname || "").toLowerCase();
      const isOAuth =
        host.includes("accounts.google.com") ||
        host.includes("google.com") ||
        host.includes("supabase.co") ||
        host === "discord.com" ||
        host.endsWith(".discord.com") ||
        host === "discordapp.com" ||
        host.endsWith(".discordapp.com") ||
        host === "cdn.discordapp.com" ||
        host === "127.0.0.1" ||
        host === "localhost";
      if (isOAuth) return { action: "allow" };
    } catch (e) {}
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    try {
      const u = new URL(url);
      const host = (u.hostname || "").toLowerCase();
      const isOAuthRelated =
        host.includes("accounts.google.com") ||
        host.includes("google.com") ||
        host.includes("supabase.co") ||
        host === "discord.com" ||
        host.endsWith(".discord.com") ||
        host === "discordapp.com" ||
        host.endsWith(".discordapp.com") ||
        host === "cdn.discordapp.com" ||
        host === "127.0.0.1" ||
        host === "localhost";
      if (isOAuthRelated) return;
    } catch (e) {}
    if (!url.startsWith(`http://127.0.0.1:${MUSIC_PORT}`) &&
        !url.startsWith(`http://localhost:${MUSIC_PORT}`)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on("close", (e) => {
    if (runInBackground && !app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
      createTray();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  await mainWindow.loadURL(`http://127.0.0.1:${MUSIC_PORT}`);
}

ipcMain.on("momento-set-run-in-background", (_evt, enabled) => {
  runInBackground = !!enabled;
  if (runInBackground) createTray();
  else destroyTray();
});

ipcMain.handle("momento-get-open-at-login", () => {
  try {
    const s = app.getLoginItemSettings();
    return !!(s && s.openAtLogin);
  } catch (e) {
    return false;
  }
});

ipcMain.on("momento-set-open-at-login", (_evt, enabled) => {
  try {
    app.setLoginItemSettings({
      openAtLogin: !!enabled,
      openAsHidden: false,
      path: process.execPath,
      args: []
    });
  } catch (e) {
    console.warn("[Momento] openAtLogin failed", e);
  }
});

// Renderer can ask main to apply tray on startup once settings are known
ipcMain.on("momento-apply-startup-prefs", (_evt, prefs) => {
  try {
    if (prefs && prefs.runInBackground) {
      runInBackground = true;
      createTray();
    }
    if (prefs && typeof prefs.openAtLogin === "boolean") {
      app.setLoginItemSettings({
        openAtLogin: !!prefs.openAtLogin,
        openAsHidden: false,
        path: process.execPath,
        args: []
      });
    }
  } catch (e) {
    console.warn("[Momento] apply-startup-prefs", e);
  }
});

app.whenReady().then(createWindow);

app.on("before-quit", () => {
  app.isQuitting = true;
});

app.on("window-all-closed", () => {
  if (runInBackground && !app.isQuitting) return;
  if (musicServer) {
    try { musicServer.close(); } catch (e) {}
    musicServer = null;
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else if (mainWindow) mainWindow.show();
});
