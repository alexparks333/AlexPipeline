// frontend/src/components/CreateProjectModal.jsx - Simplified with Shot Management
import React, { useState, useEffect } from 'react'
import { X, Folder, AlertCircle, Plus, Trash2 } from 'lucide-react'

function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    shots: ['shot01'] // Default first shot
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState({ rootPath: '' })
  const [previewPath, setPreviewPath] = useState('')
  const [nextProjectNumber, setNextProjectNumber] = useState('250001')

  // Load settings and calculate next project number when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSettingsAndCalculateProjectNumber()
    }
  }, [isOpen])

  // Update preview path when name or settings change
  useEffect(() => {
    if (settings.rootPath && formData.name) {
      const projectFolderName = `${nextProjectNumber}_${formData.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}`
      setPreviewPath(`${settings.rootPath}\\Projects\\${projectFolderName}`)
    } else {
      setPreviewPath('')
    }
  }, [formData.name, settings.rootPath, nextProjectNumber])

  const loadSettingsAndCalculateProjectNumber = async () => {
    try {
      // Load settings
      const settingsResponse = await fetch('http://localhost:8000/settings')
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        setSettings(settingsData)
      }

      // Calculate next project number
      const projectsResponse = await fetch('http://localhost:8000/projects/next-number')
      if (projectsResponse.ok) {
        const data = await projectsResponse.json()
        setNextProjectNumber(data.next_number)
      }
    } catch (error) {
      console.error('Failed to load settings or project number:', error)
      // Set defaults
      setSettings({ rootPath: 'C:\\Users\\alexh\\Desktop\\AlexParksCreative' })
      setNextProjectNumber('250001')
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Project name is required')
      return
    }

    if (!settings.rootPath) {
      setError('Root project path is not set. Please configure it in Settings.')
      return
    }

    if (formData.shots.length === 0) {
      setError('At least one shot is required')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Clean project name for folder creation
      const cleanName = formData.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
      const projectFolderName = `${nextProjectNumber}_${cleanName}`

      const projectData = {
        ...formData,
        type: 'general_vfx', // Always General VFX
        folderName: projectFolderName,
        rootPath: settings.rootPath
      }

      const response = await fetch('http://localhost:8000/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create project')
      }

      const project = await response.json()
      onProjectCreated(project)

      // Reset form
      setFormData({
        name: '',
        client: '',
        shots: ['shot01']
      })
      onClose()
    } catch (error) {
      setError(error.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const addShot = () => {
    const nextShotNumber = formData.shots.length + 1
    const shotName = `shot${nextShotNumber.toString().padStart(2, '0')}`
    setFormData(prev => ({
      ...prev,
      shots: [...prev.shots, shotName]
    }))
  }

  const removeShot = (index) => {
    if (formData.shots.length > 1) {
      setFormData(prev => ({
        ...prev,
        shots: prev.shots.filter((_, i) => i !== index)
      }))
    }
  }

  const updateShotName = (index, newName) => {
    const cleanName = newName.replace(/[^a-zA-Z0-9_]/g, '')
    setFormData(prev => ({
      ...prev,
      shots: prev.shots.map((shot, i) => i === index ? cleanName : shot)
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Create New VFX Project</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Golden Bottle"
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1">
              Project #{nextProjectNumber} • General VFX
            </p>
          </div>

          {/* Preview Path */}
          {previewPath && (
            <div className="bg-gray-700/50 rounded-lg p-3">
              <label className="block text-xs font-medium mb-1 text-gray-300">Project will be created at:</label>
              <code className="text-sm text-green-400 break-all">{previewPath}</code>
            </div>
          )}

          {/* Client */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Client (Optional)</label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => handleChange('client', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Client name"
              disabled={loading}
            />
          </div>

          {/* Shots Management */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white">VFX Shots</label>
              <button
                type="button"
                onClick={addShot}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                disabled={loading}
              >
                <Plus size={12} />
                Add Shot
              </button>
            </div>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {formData.shots.map((shot, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shot}
                    onChange={(e) => updateShotName(index, e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`shot${(index + 1).toString().padStart(2, '0')}`}
                    disabled={loading}
                  />
                  {formData.shots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeShot(index)}
                      className="text-red-400 hover:text-red-300 p-1"
                      disabled={loading}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-2">
              Each shot will get the full VFX folder structure (modeling, texturing, fx, lighting, compositing)
            </p>
          </div>

          {/* Folder Structure Preview */}
          <div className="bg-gray-700/30 rounded-lg p-3">
            <h4 className="text-sm font-medium text-white mb-2">Folder Structure Preview:</h4>
            <div className="text-xs text-gray-300 font-mono">
              <div>📁 {nextProjectNumber}_{formData.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'ProjectName'}</div>
              <div>├── 📁 in/ (tracking, reference, models)</div>
              <div>├── 📁 vfx/</div>
              {formData.shots.map((shot, index) => (
                <div key={index}>
                  <div>│   ├── 📁 {shot}/ (artwork, modeling, texturing, fx, lighting, compositing)</div>
                </div>
              ))}
              <div>└── 📁 out/ (postings)</div>
            </div>
          </div>

          {/* Root path warning */}
          {!settings.rootPath && (
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertCircle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-200 text-sm">
                <div className="font-medium">Root project path not configured</div>
                <div>Please set your root project path in Settings before creating a project.</div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-white"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-white"
              disabled={loading || !settings.rootPath}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Folder size={16} />
                  Create VFX Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProjectModal