import React from 'react'
import { Folder, Calendar, User, ExternalLink } from 'lucide-react'

function ProjectList({ projects, onProjectSelect }) {
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

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Folder size={48} className="mx-auto text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-2">No projects yet</h3>
        <p className="text-gray-500">Create your first VFX project to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
          onClick={() => onProjectSelect(project)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{getProjectTypeIcon(project.type)}</span>
              <h3 className="font-medium truncate">{project.name}</h3>
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
      ))}
    </div>
  )
}

export default ProjectList
