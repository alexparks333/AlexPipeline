const { contextBridge, ipcRenderer } = require('electron')

console.log('Preload script loading...')

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
  isDev: process.env.NODE_ENV === 'development',

  // File dialog API
  showOpenDialog: (options) => {
    console.log('showOpenDialog called with options:', options)
    return ipcRenderer.invoke('show-open-dialog', options)
  },
  
  // Settings API
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Project API
  createProject: (projectData) => ipcRenderer.invoke('create-project', projectData),
  getProjects: () => ipcRenderer.invoke('get-projects'),
  
  // Library API
  getLibraries: () => ipcRenderer.invoke('get-libraries'),
  addLibraryItem: (libraryId, itemData) => ipcRenderer.invoke('add-library-item', libraryId, itemData),
  updateLibraryItem: (libraryId, itemId, itemData) => ipcRenderer.invoke('update-library-item', libraryId, itemId, itemData),
  deleteLibraryItem: (libraryId, itemId) => ipcRenderer.invoke('delete-library-item', libraryId, itemId)
})

console.log('Preload script loaded, electronAPI exposed') 