// frontend/src/components/ToolCard.jsx
import React from 'react'
import { Play, Star, Clock } from 'lucide-react'

function ToolCard({ tool, onLaunch }) {
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
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getCategoryIcon(tool.category)}</span>
          <h3 className="font-medium text-white">{tool.name}</h3>
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
        onClick={() => onLaunch && onLaunch(tool.id)}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-white"
      >
        <Play size={16} />
        Launch
      </button>
    </div>
  )
}

export default ToolCard
