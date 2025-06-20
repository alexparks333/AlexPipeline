import React, { useState } from 'react';
import { Plus, Folder, Calendar, User } from 'lucide-react';
import apiService from '../services/apiService';

const ProjectCreator = ({ projects, onProjectCreated, onProjectSelected }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'tracking',
    client: '',
    workspacePath: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const projectTypes = [
    { value: 'tracking', label: 'Motion Tracking', description: 'Camera/object tracking projects' },
    { value: 'houdini_fx', label: 'Houdini FX', description: 'Simulation and procedural effects' },
    { value: 'compositing', label: 'Compositing', description: 'Nuke/After Effects compositing' },
    { value: 'modeling', label: '3D Modeling', description: 'Asset creation and modeling' },
    { value: 'animation', label: 'Animation', description: 'Character and object animation' },
    { value: 'general', label: 'General VFX', description: 'Mixed VFX workflow' }
  ];

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsCreating(true);
    try {
      const newProject = await apiService.createProject(formData);
      onProjectCreated(newProject);
      setFormData({ name: '', type: 'tracking', client: '', workspacePath: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Project Manager</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Client</label>
                <input
                  type="text"
                  name="client"
                  value={formData.client}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="Client name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Project Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="input-field w-full"
              >
                {projectTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Workspace Path</label>
              <input
                type="text"
                name="workspacePath"
                value={formData.workspacePath}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="Leave empty for default workspace"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isCreating}
                className="btn-primary disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Project'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Projects */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Projects</h3>
        {projects.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No projects yet. Create your first project to get started!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => onProjectSelected(project)}
                className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Folder className="w-5 h-5 text-vfx-blue" />
                  <h4 className="font-medium truncate">{project.name}</h4>
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <div className="flex items-center space-x-2">
                    <User className="w-3 h-3" />
                    <span>{project.client || 'No client'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-vfx-accent text-xs uppercase tracking-wide">
                    {project.type.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCreator;