// frontend/src/components/ToolLauncher.jsx
import React, { useState } from 'react'
import { Play, Star, Clock, Search, Plus } from 'lucide-react'

function ToolLauncher({ tools, onToolLaunch }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', ...new Set(tools.map(tool => tool.category))]

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatLastUsed = (lastUsed) => {
    if (!lastUsed) return 'Never'
    return new Date(lastUsed).toLocaleDateString()
  }

  const getCategoryIcon = (category) => {
    const icons = {
      '3d': '🎭',
      compositing: '🎬',
      tracking: '🎯',
      editing: '✂️',
      utility: '🔧'
    }
    return icons[category] || '📱'
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-12">
          <Play size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No tools found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getCategoryIcon(tool.category)}</span>
                  <h3 className="font-medium">{tool.name}</h3>
                </div>
                {tool.is_favorite && (
                  <Star size={16} className="text-yellow-400 fill-current" />
                )}
              </div>

              {tool.description && (
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {tool.description}
                </p>
              )}

              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-700 px-2 py-1 rounded">
                    {tool.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  <span>Last used: {formatLastUsed(tool.last_used)}</span>
                </div>
              </div>

              <button
                onClick={() => onToolLaunch(tool.id)}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Play size={16} />
                Launch
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ToolLauncher