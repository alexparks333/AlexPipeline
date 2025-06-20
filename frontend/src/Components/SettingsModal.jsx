// frontend/src/components/SettingsModal.jsx
import React, { useState } from 'react'
import { X, Settings, Folder, Save } from 'lucide-react'

function SettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    defaultWorkspace: '',
    autoLaunchElectron: true,
    darkMode: true,
    enableNotifications: true
  })

  if (!isOpen) return null

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings)
    onClose()
  }

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings size={20} />
            Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              <Folder size={16} className="inline mr-2" />
              Default Workspace
            </label>
            <input
              type="text"
              value={settings.defaultWorkspace}
              onChange={(e) => handleChange('defaultWorkspace', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="~/VFX_Projects"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.autoLaunchElectron}
                onChange={(e) => handleChange('autoLaunchElectron', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-white">Auto-launch Electron app</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => handleChange('darkMode', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-white">Dark mode</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-white">Enable notifications</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-white"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
