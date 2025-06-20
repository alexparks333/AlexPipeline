// frontend/src/components/CreateProjectModal.jsx
import React, { useState } from 'react'
import { X, Folder } from 'lucide-react'

const PROJECT_TYPES = [
  {
    type: 'tracking',
    name: 'Motion Tracking',
    description: 'Camera tracking and object tracking projects',
    icon: '🎯'
  },
  {
    type: 'houdini_fx',
    name: 'Houdini FX',
    description: 'Houdini simulations and procedural effects',
    icon: '💨'
  },
  {
    type: 'compositing',
    name: 'Compositing',
    description: 'Nuke/After Effects compositing projects',
    icon: '🎬'
  },
  {
    type: 'general_vfx',
    name: 'General VFX',
    description: 'General purpose VFX project structure',
    icon: '⚡'
  }
]

function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'general_vfx',
    client: '',
    workspacePath: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Project name is required')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch('http://localhost:8000/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const project = await response.json()
      onProjectCreated(project)

      // Reset form
      setFormData({
        name: '',
        type: 'general_vfx',
        client: '',
        workspacePath: ''
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Create New Project</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project name"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Project Type</label>
            <div className="grid grid-cols-1 gap-2">
              {PROJECT_TYPES.map((type) => (
                <label
                  key={type.type}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.type === type.type
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.type}
                    checked={formData.type === type.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="sr-only"
                    disabled={loading}
                  />
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{type.icon}</span>
                    <div>
                      <div className="font-medium text-white">{type.name}</div>
                      <div className="text-sm text-gray-400">{type.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Workspace Path (Optional)
            </label>
            <input
              type="text"
              value={formData.workspacePath}
              onChange={(e) => handleChange('workspacePath', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Leave empty for default workspace"
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1">
              Default: ~/VFX_Projects
            </p>
          </div>

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
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Folder size={16} />
                  Create Project
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
