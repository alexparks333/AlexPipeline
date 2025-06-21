import React, { useState, useEffect } from 'react'
import { Copy, Image, Folder, Plus, Search, Tag, Edit } from 'lucide-react'
import { libraryService } from '../services/api'
import AddHDRIModal from './AddHDRIModal'
import EditHDRIModal from './EditHDRIModal'

function Library() {
  const [libraries, setLibraries] = useState([])
  const [selectedLibrary, setSelectedLibrary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedPath, setCopiedPath] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedHDRI, setSelectedHDRI] = useState(null)

  useEffect(() => {
    loadLibraries()
  }, [])

  const loadLibraries = async () => {
    try {
      setLoading(true)
      const data = await libraryService.getLibraries()
      setLibraries(data)
      if (data.length > 0) {
        setSelectedLibrary(data[0])
      }
    } catch (error) {
      console.error('Failed to load libraries:', error)
      setError('Failed to load libraries')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPath(text)
      setTimeout(() => setCopiedPath(''), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const handleEditHDRI = (hdri) => {
    setSelectedHDRI(hdri)
    setShowEditModal(true)
  }

  const handleHDRIAdded = () => {
    loadLibraries()
  }

  const handleHDRIUpdated = () => {
    loadLibraries()
  }

  const handleHDRIDeleted = () => {
    loadLibraries()
  }

  const filteredItems = selectedLibrary?.items?.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-400 text-center p-4">
        {error}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Folder size={20} className="text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Library</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-white text-sm flex items-center gap-1 transition-colors">
            <Plus size={16} />
            Add Library
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar - Library List */}
        <div className="w-64 border-r border-gray-700 bg-gray-800">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Libraries</h3>
            <div className="space-y-1">
              {libraries.map((library) => (
                <button
                  key={library.id}
                  onClick={() => setSelectedLibrary(library)}
                  className={`w-full text-left p-2 rounded-lg transition-colors ${
                    selectedLibrary?.id === library.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Image size={16} />
                    <span className="font-medium">{library.name}</span>
                  </div>
                  {library.description && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {library.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {library.items?.length || 0} items
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedLibrary ? (
            <>
              {/* Library Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {selectedLibrary.name}
                    </h3>
                    {selectedLibrary.description && (
                      <p className="text-gray-400 text-sm mt-1">
                        {selectedLibrary.description}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg text-white text-sm flex items-center gap-1 transition-colors"
                  >
                    <Plus size={16} />
                    Add HDRI
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-gray-700">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search HDRIs by name or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* HDRI Grid */}
              <div className="flex-1 p-4 overflow-auto">
                {filteredItems.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    {searchTerm ? 'No HDRIs found matching your search.' : 'No HDRIs in this library yet.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors group"
                      >
                        {/* Preview Image */}
                        <div className="aspect-video bg-gray-700 relative">
                          {item.preview_path ? (
                            <img
                              src={`file://${item.preview_path}`}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                            <Image size={32} className="text-gray-500" />
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditHDRI(item)}
                              className="bg-black/50 hover:bg-black/70 p-1 rounded transition-colors"
                              title="Edit HDRI"
                            >
                              <Edit size={14} className="text-white" />
                            </button>
                            <button
                              onClick={() => copyToClipboard(item.path)}
                              className="bg-black/50 hover:bg-black/70 p-1 rounded transition-colors"
                              title="Copy file path"
                            >
                              <Copy size={14} className="text-white" />
                            </button>
                          </div>
                        </div>

                        {/* Item Info */}
                        <div className="p-3">
                          <h4 className="font-medium text-white mb-1 truncate">
                            {item.name}
                          </h4>
                          
                          {/* Tags */}
                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {item.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded"
                                >
                                  <Tag size={10} />
                                  {tag}
                                </span>
                              ))}
                              {item.tags.length > 3 && (
                                <span className="text-gray-400 text-xs">
                                  +{item.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* File Path */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(item.path)}
                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                              title="Copy file path"
                            >
                              <Copy size={12} />
                              Copy Path
                            </button>
                            {copiedPath === item.path && (
                              <span className="text-green-400 text-xs">Copied!</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a library to view its contents
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddHDRIModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        libraryId={selectedLibrary?.id}
        onHDRIAdded={handleHDRIAdded}
      />

      <EditHDRIModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        libraryId={selectedLibrary?.id}
        hdri={selectedHDRI}
        onHDRIUpdated={handleHDRIUpdated}
        onHDRIDeleted={handleHDRIDeleted}
      />
    </div>
  )
}

export default Library 