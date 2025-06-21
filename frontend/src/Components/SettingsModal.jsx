// frontend/src/components/SettingsModal.jsx - Enhanced Version
import React, { useState, useEffect } from 'react'
import { X, Settings, Folder, Save, FolderOpen, AlertCircle, CheckCircle } from 'lucide-react'
import { settingsService } from '../services/api'

function SettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    rootPath: '',
    autoLaunchElectron: true,
    darkMode: true,
    enableNotifications: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pathValidation, setPathValidation] = useState({ isValid: false, message: '' })

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  useEffect(() => {
    if (settings.rootPath) {
      validatePath(settings.rootPath)
    } else {
      setPathValidation({ isValid: false, message: '' })
    }
  }, [settings.rootPath])

  const loadSettings = async () => {
    try {
      console.log('Loading settings...')
      const data = await settingsService.getSettings()
      console.log('Settings loaded:', data)
      setSettings(data)
    } catch (error) {
      console.error('Failed to load settings:', error)
      setError('Failed to load settings: ' + error.message)
      // Set default settings if none exist
      setSettings({
        rootPath: '',
        autoLaunchElectron: true,
        darkMode: true,
        enableNotifications: true
      })
    }
  }

  const validatePath = async (path) => {
    if (!path.trim()) {
      setPathValidation({ isValid: false, message: '' })
      return
    }

    try {
      console.log('Validating path:', path)
      const data = await settingsService.validatePath(path)
      console.log('Path validation result:', data)
      setPathValidation(data)
    } catch (error) {
      console.error('Path validation error:', error)
      setPathValidation({
        isValid: false,
        message: 'Failed to validate path: ' + error.message
      })
    }
  }

  const handleSave = async () => {
    if (!settings.rootPath.trim()) {
      setError('Root project path is required')
      return
    }

    if (!pathValidation.isValid) {
      setError('Please enter a valid root project path')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      console.log('Saving settings:', settings)
      const result = await settingsService.saveSettings(settings)
      console.log('Settings saved successfully:', result)

      setSuccess('Settings saved successfully!')
      setTimeout(() => {
        setSuccess('')
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setError('Failed to save settings: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
    if (success) setSuccess('')
  }

  const selectFolder = async () => {
    try {
      // Use Electron's file dialog if available
      if (window.electronAPI) {
        const result = await window.electronAPI.showOpenDialog({
          title: 'Select Root Project Path',
          properties: ['openDirectory']
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
          const path = result.filePaths[0];
          handleChange('rootPath', path);
        }
      } else {
        // Fallback to prompt for web version
        const path = prompt('Enter the root project path:', settings.rootPath);
        if (path !== null) {
          handleChange('rootPath', path);
        }
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
      // Fallback to prompt
      const path = prompt('Enter the root project path:', settings.rootPath);
      if (path !== null) {
        handleChange('rootPath', path);
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings size={20} />
            Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Root Project Path */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              <Folder size={16} className="inline mr-2" />
              Root Project Library Path
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.rootPath}
                onChange={(e) => handleChange('rootPath', e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="C:\Users\alexh\Desktop\AlexParksCreative"
                disabled={loading}
              />
              <button
                type="button"
                onClick={selectFolder}
                className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg flex items-center gap-1 text-white transition-colors"
                disabled={loading}
              >
                <FolderOpen size={16} />
                Browse
              </button>
            </div>

            {/* Path validation feedback */}
            {settings.rootPath && (
              <div className="mt-2">
                {pathValidation.isValid ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle size={14} />
                    <span>{pathValidation.message}</span>
                  </div>
                ) : pathValidation.message ? (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={14} />
                    <span>{pathValidation.message}</span>
                  </div>
                ) : null}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-1">
              This should contain your "Projects" and "Tools" folders
            </p>
          </div>

          {/* Application Settings */}
          <div>
            <h4 className="text-sm font-medium text-white mb-3">Application Settings</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.autoLaunchElectron}
                  onChange={(e) => handleChange('autoLaunchElectron', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="text-white">Auto-launch Electron app</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => handleChange('darkMode', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="text-white">Dark mode</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="text-white">Enable notifications</span>
              </label>
            </div>
          </div>

          {/* Current Project Structure Info */}
          {pathValidation.isValid && (
            <div className="bg-gray-700/50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-white mb-2">Expected Structure:</h4>
              <div className="text-xs text-gray-300 font-mono">
                <div>{settings.rootPath}</div>
                <div>├── Projects/</div>
                <div>│   └── (new projects will be created here)</div>
                <div>└── Tools/</div>
                <div>    └── (your tools and scripts)</div>
              </div>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
              {success}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-white"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-white"
            disabled={loading || !pathValidation.isValid}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal