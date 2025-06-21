import React, { useState } from 'react'
import { X, Upload, Image, Tag, Save, FolderOpen } from 'lucide-react'
import { libraryService } from '../services/api'

function AddHDRIModal({ isOpen, onClose, libraryId, onHDRIAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    path: '',
    preview_path: '',
    category: 'hdri',
    tags: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newTag, setNewTag] = useState('')

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('HDRI name is required')
      return
    }
    
    if (!formData.path.trim()) {
      setError('HDRI file path is required')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      await libraryService.addLibraryItem(libraryId, formData)
      
      // Reset form
      setFormData({
        name: '',
        path: '',
        preview_path: '',
        category: 'hdri',
        tags: []
      })
      
      onHDRIAdded()
      onClose()
    } catch (error) {
      console.error('Failed to add HDRI:', error)
      setError('Failed to add HDRI: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  const selectFile = async (type) => {
    try {
      console.log('selectFile called for type:', type);
      console.log('window.electronAPI available:', !!window.electronAPI);
      
      // Use Electron's file dialog if available
      if (window.electronAPI && window.electronAPI.showOpenDialog) {
        console.log('Using Electron file dialog...');
        const filters = type === 'hdri' 
          ? [
              { name: 'HDRI Files', extensions: ['hdr', 'exr', 'tiff', 'tif'] },
              { name: 'All Files', extensions: ['*'] }
            ]
          : [
              { name: 'Image Files', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'tif'] },
              { name: 'All Files', extensions: ['*'] }
            ];
        
        const result = await window.electronAPI.showOpenDialog({
          title: `Select ${type === 'hdri' ? 'HDRI' : 'Preview Image'} File`,
          filters: filters,
          properties: ['openFile']
        });
        
        console.log('File dialog result:', result);
        
        if (!result.canceled && result.filePaths.length > 0) {
          const path = result.filePaths[0];
          if (type === 'hdri') {
            handleChange('path', path)
          } else {
            handleChange('preview_path', path)
          }
        }
      } else {
        console.log('Electron API not available, using fallback...');
        // Fallback to prompt for web version
        const path = prompt(`Enter the ${type === 'hdri' ? 'HDRI' : 'preview image'} file path:`, 
          type === 'hdri' ? 'C:\\path\\to\\your\\hdri.hdr' : 'C:\\path\\to\\your\\preview.jpg')
        
        if (path !== null) {
          if (type === 'hdri') {
            handleChange('path', path)
          } else {
            handleChange('preview_path', path)
          }
        }
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      // Fallback to prompt
      const path = prompt(`Enter the ${type === 'hdri' ? 'HDRI' : 'preview image'} file path:`, 
        type === 'hdri' ? 'C:\\path\\to\\your\\hdri.hdr' : 'C:\\path\\to\\your\\preview.jpg')
      
      if (path !== null) {
        if (type === 'hdri') {
          handleChange('path', path)
        } else {
          handleChange('preview_path', path)
        }
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Image size={20} />
            Add New HDRI
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* HDRI Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              HDRI Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Studio HDRI 01"
              disabled={loading}
            />
          </div>

          {/* HDRI File Path */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              HDRI File Path *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.path}
                onChange={(e) => handleChange('path', e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="C:\path\to\your\hdri.hdr"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => selectFile('hdri')}
                className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg flex items-center gap-1 text-white transition-colors"
                disabled={loading}
              >
                <FolderOpen size={16} />
                Browse
              </button>
            </div>
          </div>

          {/* Preview Image Path */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Preview Image Path (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.preview_path}
                onChange={(e) => handleChange('preview_path', e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="C:\path\to\your\preview.jpg"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => selectFile('preview')}
                className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg flex items-center gap-1 text-white transition-colors"
                disabled={loading}
              >
                <FolderOpen size={16} />
                Browse
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              JPG or PNG recommended for preview images
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a tag..."
                disabled={loading}
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-white transition-colors"
                disabled={loading || !newTag.trim()}
              >
                <Tag size={16} />
              </button>
            </div>
            
            {/* Display Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 text-sm rounded"
                  >
                    <Tag size={12} />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-400"
                      disabled={loading}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Buttons */}
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
                  Adding...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Add HDRI
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddHDRIModal 