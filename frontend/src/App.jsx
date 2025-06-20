import React, { useState, useEffect } from 'react';
import { Folder, Settings, Play, Plus, Search, FileText } from 'lucide-react';
import ProjectCreator from './components/ProjectCreator';
import ToolLauncher from './components/ToolLauncher';
import ProjectMetadata from './components/ProjectMetadata';
import apiService from './services/apiService';

function App() {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [tools, setTools] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [projectsData, toolsData] = await Promise.all([
        apiService.getProjects(),
        apiService.getTools()
      ]);
      setProjects(projectsData);
      setTools(toolsData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleProjectCreated = (newProject) => {
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
    setActiveTab('metadata');
  };

  const tabs = [
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'tools', label: 'Tools', icon: Play },
    { id: 'metadata', label: 'Metadata', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="h-screen flex flex-col bg-vfx-darker">
      {/* Header */}
      <header className="bg-vfx-dark border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-vfx-accent">VFX Pipeline Companion</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              {currentProject ? `Project: ${currentProject.name}` : 'No project selected'}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 bg-vfx-dark border-r border-gray-700 p-4">
          <div className="space-y-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-vfx-accent text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'projects' && (
            <ProjectCreator
              projects={projects}
              onProjectCreated={handleProjectCreated}
              onProjectSelected={setCurrentProject}
            />
          )}

          {activeTab === 'tools' && (
            <ToolLauncher tools={tools} />
          )}

          {activeTab === 'metadata' && (
            <ProjectMetadata
              project={currentProject}
              onProjectUpdate={setCurrentProject}
            />
          )}

          {activeTab === 'settings' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Default Workspace Path</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    placeholder="C:\VFX_Projects"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tools Directory</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    placeholder="C:\VFX_Tools"
                  />
                </div>
                <button className="btn-primary">Save Settings</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;