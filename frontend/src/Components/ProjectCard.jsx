// frontend/src/components/ProjectCard.jsx
import React from 'react'
import { Folder, Calendar, User, ExternalLink } from 'lucide-react'

function ProjectCard({ project, onClick }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getProjectTypeIcon = (type) => {
    const icons = {
      tracking: '🎯',
      houdini_fx: '💨',
      compositing: '🎬',
      general_vfx: '⚡'
    }
    return icons[type] || '📁'
  }

  const getProjectTypeName = (type) => {
    const names = {
      tracking: 'Motion Tracking',
      houdini_fx: 'Houdini FX',
      compositing: 'Compositing',
      general_vfx: 'General VFX'
    }
    return names[type] || type
  }

  return (
    <div
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
      onClick={() => onClick && onClick(project)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getProjectTypeIcon(project.type)}</span>
          <h3 className="font-medium truncate text-white">{project.name}</h3>
        </div>
        <ExternalLink size={16} className="text-gray-400 flex-shrink-0" />
      </div>

      <div className="space-y-2 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-gray-700 px-2 py-1 rounded">
            {getProjectTypeName(project.type)}
          </span>
        </div>

        {project.client && (
          <div className="flex items-center gap-2">
            <User size={14} />
            <span>{project.client}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span>Created {formatDate(project.created_at)}</span>
        </div>

        <div className="text-xs text-gray-500 font-mono truncate">
          {project.workspace_path}
        </div>
      </div>
    </div>
  )
}

export default ProjectCard