const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setRunInBackground: (enabled) => {
    try { ipcRenderer.send('momento-set-run-in-background', !!enabled); } catch (e) {}
  },
  isDesktop: true
});
