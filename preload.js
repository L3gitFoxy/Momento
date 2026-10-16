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
  isDesktop: true
});
