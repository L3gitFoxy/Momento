const { app, BrowserWindow, shell, Tray, Menu, ipcMain, nativeImage } = require('electron');
const path = require('path');
const { startMusicServer } = require('./music-server/server');

let autoUpdater = null;
try {
  autoUpdater = require('electron-updater').autoUpdater;
} catch (err) {
  console.warn('[Momento] electron-updater not installed yet:', err && err.message);
}


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


function isElectronDevBinary(exePath) {
  const p = String(exePath || "").toLowerCase().replace(/\\/g, "/");
  return p.endsWith("/electron.exe") || p.endsWith("/electron") || p.includes("/node_modules/electron/");
}

function clearStaleLoginItems() {
  // Remove leftover dev "Electron" startup entries so only Momento opens
  const candidates = [];
  try { candidates.push(process.execPath); } catch (e) {}
  // Common places Electron ends up when registered from npm start
  if (process.platform === "win32") {
    const local = process.env.LOCALAPPDATA || "";
    const appdata = process.env.APPDATA || "";
    if (local) {
      candidates.push(path.join(local, "Programs", "electron", "Electron.exe"));
    }
    // node_modules electron binary from a previous project path cannot be fully enumerated;
    // disabling by current execPath when it is electron still helps.
  }
  candidates.forEach((exe) => {
    if (!exe) return;
    try {
      if (isElectronDevBinary(exe) || !app.isPackaged) {
        app.setLoginItemSettings({
          openAtLogin: false,
          path: exe,
          args: []
        });
        // also clear any entry that included the project dir as arg
        try {
          app.setLoginItemSettings({
            openAtLogin: false,
            path: exe,
            args: [path.resolve(__dirname)]
          });
        } catch (e2) {}
      }
    } catch (e) {}
  });
}

function setOpenAtLoginEnabled(enabled) {
  enabled = !!enabled;
  try {
    // Always try to drop stale Electron startup rows first
    clearStaleLoginItems();

    if (!app.isPackaged) {
      // Never register bare Electron for OS startup in dev — that opens the empty Electron shell
      app.setLoginItemSettings({ openAtLogin: false });
      console.log("[Momento] openAtLogin ignored in dev (not packaged). Use the installed Momento build.");
      return;
    }

    // Packaged Momento only
    app.setLoginItemSettings({ openAtLogin: false, path: process.execPath, args: [] });
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: false,
      path: process.execPath,
      args: []
    });
    console.log("[Momento] openAtLogin=", enabled, "exe=", process.execPath);
  } catch (err) {
    console.warn("[Momento] openAtLogin failed", err);
  }
}

ipcMain.handle("momento-get-open-at-login", () => {
  try {
    const s = app.getLoginItemSettings();
    return !!(s && s.openAtLogin);
  } catch (e) {
    return false;
  }
});

ipcMain.on("momento-set-open-at-login", (_evt, enabled) => {
  setOpenAtLoginEnabled(!!enabled);
});

// Renderer can ask main to apply tray on startup once settings are known
ipcMain.on("momento-apply-startup-prefs", (_evt, prefs) => {
  try {
    if (prefs && prefs.runInBackground) {
      runInBackground = true;
      createTray();
    }
    if (prefs && typeof prefs.openAtLogin === "boolean") {
      setOpenAtLoginEnabled(!!prefs.openAtLogin);
    }
  } catch (e) {
    console.warn("[Momento] apply-startup-prefs", e);
  }
});


function sendToRenderer(channel, payload) {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, payload);
    }
  } catch (e) {}
}

function setupAutoUpdater() {
  if (!autoUpdater || !app.isPackaged) {
    console.log('[Momento] Auto-update skipped (dev or updater missing)');
    return;
  }
  try {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
      sendToRenderer('momento-update-status', { status: 'checking' });
    });
    autoUpdater.on('update-available', (info) => {
      sendToRenderer('momento-update-status', {
        status: 'available',
        version: info && info.version
      });
    });
    autoUpdater.on('update-not-available', (info) => {
      sendToRenderer('momento-update-status', {
        status: 'none',
        version: info && info.version
      });
    });
    autoUpdater.on('download-progress', (p) => {
      sendToRenderer('momento-update-status', {
        status: 'downloading',
        percent: p && p.percent,
        transferred: p && p.transferred,
        total: p && p.total
      });
    });
    autoUpdater.on('update-downloaded', (info) => {
      sendToRenderer('momento-update-status', {
        status: 'ready',
        version: info && info.version
      });
    });
    autoUpdater.on('error', (err) => {
      console.warn('[Momento] updater error', err && err.message);
      sendToRenderer('momento-update-status', {
        status: 'error',
        message: (err && err.message) || String(err)
      });
    });

    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((e) => console.warn('[Momento] checkForUpdates', e && e.message));
    }, 8000);
    setInterval(() => {
      autoUpdater.checkForUpdates().catch(() => {});
    }, 4 * 60 * 60 * 1000);
  } catch (e) {
    console.warn('[Momento] setupAutoUpdater failed', e);
  }
}

ipcMain.handle('momento-check-for-updates', async () => {
  if (!autoUpdater || !app.isPackaged) {
    return { ok: false, reason: 'dev-or-missing' };
  }
  try {
    const r = await autoUpdater.checkForUpdates();
    return { ok: true, version: r && r.updateInfo && r.updateInfo.version };
  } catch (e) {
    return { ok: false, reason: (e && e.message) || String(e) };
  }
});

ipcMain.handle('momento-quit-and-install', () => {
  if (!autoUpdater || !app.isPackaged) return false;
  try {
    autoUpdater.quitAndInstall(false, true);
    return true;
  } catch (e) {
    console.warn('[Momento] quitAndInstall', e);
    return false;
  }
});

ipcMain.handle('momento-get-app-version', () => {
  try { return app.getVersion(); } catch (e) { return null; }
});

app.whenReady().then(async () => {
  await createWindow();
  setupAutoUpdater();
});


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
