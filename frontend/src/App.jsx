// frontend/src/App.jsx - Simplified for VFX Projects
import React, { useState, useEffect } from 'react';
import { Folder, Plus, Settings, Play, Star, Clock, Search, ExternalLink, Film, Image } from 'lucide-react';
import CreateProjectModal from './Components/CreateProjectModal';
import SettingsModal from './Components/SettingsModal';
import Library from './Components/Library';

// Enhanced ProjectCard component for VFX projects
const ProjectCard = ({ project }) => {
  const handleOpenFolder = () => {
    if (project.workspace_path) {
      console.log('Opening folder:', project.workspace_path);
      navigator.clipboard.writeText(project.workspace_path);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  // Extract display name from folder name (remove prefix)
  const getDisplayName = (projectName) => {
    const match = projectName.match(/^\d{6}_(.+)$/);
    return match ? match[1].replace(/_/g, ' ') : projectName;
  };

  // Get shots from project info (if available)
  const getShotCount = () => {
    // This would ideally come from the project metadata
    // For now, we'll estimate based on the project structure
    return "Multiple shots";
  };

  const displayName = getDisplayName(project.name);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎬</span>
          <div>
            <h3 className="font-semibold text-white text-sm">{displayName}</h3>
            <p className="text-xs text-gray-400">{project.name}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs">
          <Film size={12} className="text-gray-400" />
          <span className="text-gray-300">VFX Project</span>
        </div>

        {project.client && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Client:</span>
            <span className="text-gray-300">{project.client}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs">
          <Clock size={12} className="text-gray-400" />
          <span className="text-gray-300">Created {formatDate(project.created_at)}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Folder size={12} className="text-gray-400" />
          <span className="text-gray-300">in/ • vfx/ • out/</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleOpenFolder}
          className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
        >
          <ExternalLink size={12} />
          Open Project
        </button>
      </div>
    </div>
  );
};

// Simple ToolCard component for displaying tools
const ToolCard = ({ tool, onLaunch }) => {
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
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return 'Unknown';
    }
  };

  const categoryIcon = tool.category === '3d' ? '🎭' :
                      tool.category === 'compositing' ? '🎬' :
                      tool.category === 'tracking' ? '🎯' : '🔧';

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{categoryIcon}</span>
          <div>
            <h3 className="font-semibold text-white text-sm">{tool.name}</h3>
            <p className="text-xs text-gray-400 capitalize">{tool.category}</p>
          </div>
        </div>
        {tool.is_favorite && (
          <Star size={14} className="text-yellow-400 fill-current" />
        )}
      </div>

      {tool.description && (
        <p className="text-xs text-gray-300 mb-3 line-clamp-2">{tool.description}</p>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <Clock size={12} />
        <span>Last used: {formatLastUsed(tool.last_used)}</span>
      </div>

      <button
        onClick={onLaunch}
        className="w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
        disabled={!tool.executable_path}
      >
        <Play size={12} />
        Launch
      </button>

      {!tool.executable_path && (
        <p className="text-xs text-red-400 mt-2 text-center">
          No executable path set
        </p>
      )}
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, toolsData] = await Promise.all([
        fetch('http://localhost:8000/projects').then(res => res.json()),
        fetch('http://localhost:8000/tools').then(res => res.json())
      ]);
      setProjects(projectsData);
      setTools(toolsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      await loadData(); // Reload projects after creation
      setShowCreateProject(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleLaunchTool = async (toolId) => {
    try {
      await fetch(`http://localhost:8000/tools/${toolId}/launch`, {
        method: 'POST'
      });
      await loadData(); // Reload to update last_used timestamp
    } catch (error) {
      console.error('Failed to launch tool:', error);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading VFX Pipeline Companion...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Folder className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold">VFX Pipeline Companion</h1>
              <p className="text-sm text-gray-400">Professional VFX Project Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects or tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Create Project Button */}
            <button
              onClick={() => setShowCreateProject(true)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              New VFX Project
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
              }`}
            >
              <Film className="inline w-4 h-4 mr-2" />
              VFX Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'tools'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
              }`}
            >
              <Play className="inline w-4 h-4 mr-2" />
              Tools ({tools.length})
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'library'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
              }`}
            >
              <Image className="inline w-4 h-4 mr-2" />
              Library
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'projects' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">VFX Projects</h2>
                <p className="text-gray-400 text-sm">Organized pipeline structure for professional VFX work</p>
              </div>
            </div>

            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Film className="mx-auto h-12 w-12 text-gray-600" />
                <h3 className="mt-2 text-sm font-medium text-gray-300">No VFX projects found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first VFX project.'}
                </p>
                {!searchTerm && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreateProject(true)}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                    >
                      <Plus size={16} />
                      Create VFX Project
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tools' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">VFX Tools</h2>
                <p className="text-gray-400 text-sm">Quick access to your VFX applications and utilities</p>
              </div>
            </div>

            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onLaunch={() => handleLaunchTool(tool.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Play className="mx-auto h-12 w-12 text-gray-600" />
                <h3 className="mt-2 text-sm font-medium text-gray-300">No tools found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Add your VFX tools and applications to get started.'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'library' && (
          <div className="h-[calc(100vh-200px)]">
            <Library />
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onProjectCreated={handleCreateProject}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

export default App;