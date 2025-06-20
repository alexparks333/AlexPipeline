const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // Add more API methods as needed
  openPath: (path) => ipcRenderer.invoke('open-path', path),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),

  // Backend communication helpers
  apiUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'http://localhost:8000'
});