import React, { useState, useEffect } from 'react';
import { Folder, Plus, Settings, Play, Star, Clock, Search } from 'lucide-react';
import ProjectCard from './components/ProjectCard';
import ToolCard from './components/ToolCard';
import CreateProjectModal from './components/CreateProjectModal';
import SettingsModal from './components/SettingsModal';
import { projectService, toolService } from './services/api';

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
        projectService.getProjects(),
        toolService.getTools()
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
      await projectService.createProject(projectData);
      await loadData(); // Reload projects
      setShowCreateProject(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleLaunchTool = async (toolId) => {
    try {
      await toolService.launchTool(toolId);
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
            <Folder className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl font-bold">VFX Pipeline Companion</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="flex space-x-8 px-4">
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              activeTab === 'projects'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              activeTab === 'tools'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
            }`}
          >
            Tools
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="p-6">
        {activeTab === 'projects' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Projects</h2>
              <button
                onClick={() => setShowCreateProject(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </button>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-6">Create your first VFX project to get started</p>
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
                >
                  Create Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} onUpdate={loadData} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tools' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Tools</h2>
              <div className="flex space-x-2">
                <button className="text-sm text-gray-400 hover:text-white">All</button>
                <button className="text-sm text-gray-400 hover:text-white">Favorites</button>
                <button className="text-sm text-gray-400 hover:text-white">Recent</button>
              </div>
            </div>

            {filteredTools.length === 0 ? (
              <div className="text-center py-12">
                <Play className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No tools available</h3>
                <p className="text-gray-500">Add your VFX tools to launch them quickly</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onLaunch={() => handleLaunchTool(tool.id)}
                    onUpdate={loadData}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;