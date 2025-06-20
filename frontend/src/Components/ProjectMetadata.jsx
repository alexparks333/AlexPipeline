import React, { useState, useEffect } from 'react';
import { Save, Calendar, User, FileText, Tag } from 'lucide-react';
import apiService from '../services/apiService';

const ProjectMetadata = ({ project, onProjectUpdate }) => {
  const [metadata, setMetadata] = useState({
    client: '',
    deliveryDate: '',
    description: '',
    notes: '',
    tags: [],
    status: 'in_progress',
    priority: 'medium',
    estimatedHours: '',
    actualHours: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (project) {
      loadProjectMetadata();
    }
  }, [project]);

  const loadProjectMetadata = async () => {
    if (!project) return;

    try {
      const projectMetadata = await apiService.getProjectMetadata(project.id);
      setMetadata(prev => ({ ...prev, ...projectMetadata }));
    } catch (error) {
      console.error('Failed to load project metadata:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    if (!project) return;

    setIsSaving(true);
    try {
      const updatedProject = await apiService.updateProjectMetadata(project.id, metadata);
      onProjectUpdate(updatedProject);
      console.log('Project metadata saved successfully');
    } catch (error) {
      console.error('Failed to save project metadata:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!project) {
    return (
      <div className="card p-6 text-center">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
        <p className="text-gray-400">
          Select a project from the Projects tab to view and edit its metadata.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Project Metadata</h2>
          <p className="text-gray-400">Managing: {project.name}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Metadata'}</span>
        </button>
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Basic Information</span>
            </h3>

            <div>
              <label className="block text-sm font-medium mb-2">Client</label>
              <input
                type="text"
                name="client"
                value={metadata.client}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="Client name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Delivery Date</label>
              <input
                type="date"
                name="deliveryDate"
                value={metadata.deliveryDate}
                onChange={handleInputChange}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                name="status"
                value={metadata.status}
                onChange={handleInputChange}
                className="input-field w-full"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                name="priority"
                value={metadata.priority}
                onChange={handleInputChange}
                className="input-field w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Project Details</span>
            </h3>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={metadata.description}
                onChange={handleInputChange}
                className="input-field w-full h-24 resize-none"
                placeholder="Project description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Estimated Hours</label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={metadata.estimatedHours}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Actual Hours</label>
                <input
                  type="number"
                  name="actualHours"
                  value={metadata.actualHours}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Tags</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {metadata.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-vfx-accent px-2 py-1 rounded-full text-xs flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-white hover:text-gray-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddTag} className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Add tag..."
                />
                <button type="submit" className="btn-secondary">Add</button>
              </form>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Notes</h3>
          <textarea
            name="notes"
            value={metadata.notes}
            onChange={handleInputChange}
            className="input-field w-full h-32 resize-none"
            placeholder="Project notes, progress updates, important information..."
          />
        </div>
      </div>

      {/* Project Statistics */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Project Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-vfx-blue">{project.type.replace('_', ' ')}</div>
            <div className="text-sm text-gray-400">Project Type</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-vfx-green">
              {new Date(project.created_at).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-400">Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-vfx-purple">
              {metadata.estimatedHours || '0'}h
            </div>
            <div className="text-sm text-gray-400">Estimated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-vfx-accent">
              {metadata.actualHours || '0'}h
            </div>
            <div className="text-sm text-gray-400">Actual</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectMetadata;