// electron/main.js - Clean working version
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

let mainWindow = null
let backendProcess = null
const isDev = process.env.NODE_ENV === 'development'

// Backend server management
function startBackendServer() {
  if (isDev) {
    // In development, backend is started separately via npm run dev
    console.log('Development mode: Backend should be started separately')
    return
  }

  // In production, start the Python backend
  const backendPath = path.join(__dirname, '..', 'backend', 'main.py')
  backendProcess = spawn('python', ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000'], {
    cwd: path.join(__dirname, '..', 'backend'),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    windowsHide: true
  })

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`)
  })

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`)
  })

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`)
    backendProcess = null
  })

  backendProcess.on('error', (error) => {
    console.error('Backend process error:', error)
    backendProcess = null
  })

  return backendProcess
}

function createWindow() {
  console.log('Creating main window...')

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    titleBarStyle: 'default'
  })

  // Load the app - try multiple ports for development
  let url
  if (isDev) {
    // Try multiple ports in order
    const ports = [3000, 3001, 3002]
    let currentPortIndex = 0
    
    const tryLoadPort = () => {
      if (currentPortIndex >= ports.length) {
        console.error('All ports failed to load')
        return
      }
      
      const port = ports[currentPortIndex]
      url = `http://localhost:${port}`
      console.log(`Loading URL: ${url}`)
      
      mainWindow.loadURL(url).then(() => {
        // Open DevTools in development
        mainWindow.webContents.openDevTools()
      }).catch((error) => {
        console.log(`Port ${port} failed, trying next port...`)
        currentPortIndex++
        tryLoadPort()
      })
    }
    
    tryLoadPort()
  } else {
    url = path.join(__dirname, '..', 'frontend', 'dist', 'index.html')
    console.log(`Loading URL: ${url}`)
    mainWindow.loadFile(url)
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    console.log('Main window ready - showing window')
    mainWindow.show()
    mainWindow.focus()
  })

  // Handle failed loads
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`)
    if (isDev && validatedURL.includes('localhost')) {
      console.log('Page failed to load, this is handled by the port detection logic')
    }
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    console.log('Main window closed')
    mainWindow = null
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  return mainWindow
}

// App event handlers
app.whenReady().then(() => {
  console.log('Electron app ready')

  // Start backend if not in development
  if (!isDev) {
    startBackendServer()
  }

  // Create main window
  createWindow()
})

app.on('window-all-closed', () => {
  console.log('All windows closed')

  // Kill backend process if running
  if (backendProcess) {
    console.log('Killing backend process')
    backendProcess.kill()
    backendProcess = null
  }

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  console.log('App about to quit')
  if (backendProcess) {
    backendProcess.kill()
    backendProcess = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('show-folder-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Workspace Folder'
  })
  return result
})

ipcMain.handle('show-file-dialog', async (event, options = {}) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    title: options.title || 'Select File',
    filters: options.filters || []
  })
  return result
})

ipcMain.handle('open-folder', async (event, folderPath) => {
  shell.openPath(folderPath)
})

// File dialog handler
ipcMain.handle('show-open-dialog', async (event, options) => {
  try {
    console.log('File dialog requested with options:', options)
    const result = await dialog.showOpenDialog(mainWindow, options)
    console.log('File dialog result:', result)
    return result
  } catch (error) {
    console.error('Error showing open dialog:', error)
    return { canceled: true, filePaths: [] }
  }
})

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

console.log('Electron main process started')