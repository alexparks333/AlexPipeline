// frontend/src/components/ToolCard.jsx
import React from 'react';
import { Play, Star, Clock, Settings } from 'lucide-react';

const CATEGORY_ICONS = {
  '3d': '🎭',
  compositing: '🎬',
  tracking: '🎯',
  utility: '🔧',
  rendering: '💎',
  simulation: '💨'
};

function ToolCard({ tool, onLaunch, onUpdate }) {
  const formatLastUsed = (dateString) => {
    if (!dateString) return 'Never used';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
      } else if (diffInHours < 168) {
        return `${Math.floor(diffInHours / 24)} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return 'Unknown';
    }
  };

  const categoryIcon = CATEGORY_ICONS[tool.category] || '🔧';

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{categoryIcon}</span>
          <div>
            <h3 className="font-semibold text-white text-sm">{tool.name}</h3>
            <p className="text-xs text-gray-400 capitalize">{tool.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {tool.is_favorite && (
            <Star size={14} className="text-yellow-400 fill-current" />
          )}
          <button className="text-gray-400 hover:text-white p-1">
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Description */}
      {tool.description && (
        <p className="text-xs text-gray-300 mb-3 line-clamp-2">
          {tool.description}
        </p>
      )}

      {/* Last Used */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <Clock size={12} />
        <span>Last used: {formatLastUsed(tool.last_used)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onLaunch}
          className="flex-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
          disabled={!tool.executable_path}
        >
          <Play size={12} />
          Launch
        </button>
      </div>

      {!tool.executable_path && (
        <p className="text-xs text-red-400 mt-2 text-center">
          No executable path set
        </p>
      )}
    </div>
  );
}

export default ToolCard;