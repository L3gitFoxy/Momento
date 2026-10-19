const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setRunInBackground: (enabled) => {
    try { ipcRenderer.send('momento-set-run-in-background', !!enabled); } catch (e) {}
  },
  setOpenAtLogin: (enabled) => {
    try { ipcRenderer.send('momento-set-open-at-login', !!enabled); } catch (e) {}
  },
  getOpenAtLogin: async () => {
    try { return await ipcRenderer.invoke('momento-get-open-at-login'); } catch (e) { return false; }
  },
  applyStartupPrefs: (prefs) => {
    try { ipcRenderer.send('momento-apply-startup-prefs', prefs || {}); } catch (e) {}
  },
  checkForUpdates: async () => {
    try { return await ipcRenderer.invoke('momento-check-for-updates'); } catch (e) { return { ok: false }; }
  },
  quitAndInstallUpdate: async () => {
    try { return await ipcRenderer.invoke('momento-quit-and-install'); } catch (e) { return false; }
  },
  downloadUpdate: async () => {
    try { return await ipcRenderer.invoke('momento-download-update'); } catch (e) { return { ok: false }; }
  },
  clearUpdateCache: async () => {
    try { return await ipcRenderer.invoke('momento-clear-update-cache'); } catch (e) { return false; }
  },
  getAppVersion: async () => {
    try { return await ipcRenderer.invoke('momento-get-app-version'); } catch (e) { return null; }
  },
  onUpdateStatus: (handler) => {
    try {
      const fn = (_evt, payload) => { try { handler(payload); } catch (e) {} };
      ipcRenderer.on('momento-update-status', fn);
      return () => { try { ipcRenderer.removeListener('momento-update-status', fn); } catch (e) {} };
    } catch (e) { return () => {}; }
  },
  isDesktop: true
});
