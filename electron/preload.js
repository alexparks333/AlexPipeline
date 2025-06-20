const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // File system dialogs
  showFolderDialog: () => ipcRenderer.invoke('show-folder-dialog'),
  showFileDialog: (options) => ipcRenderer.invoke('show-file-dialog', options),
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),

  // Platform info
  platform: process.platform,

  // Environment
  isDev: process.env.NODE_ENV === 'development'
})

// ===================================================================
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#0a0a0a',
        }
      }
    },
  },
  plugins: [],
}
