import React, { useState } from 'react';
import { Search, Play, Settings, Terminal, Zap } from 'lucide-react';
import apiService from '../services/apiService';

const ToolLauncher = ({ tools }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLaunching, setIsLaunching] = useState({});

  const categories = [
    { value: 'all', label: 'All Tools' },
    { value: 'tracking', label: 'Tracking' },
    { value: 'compositing', label: 'Compositing' },
    { value: 'modeling', label: 'Modeling' },
    { value: 'utility', label: 'Utilities' },
    { value: 'custom', label: 'Custom Scripts' }
  ];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLaunchTool = async (tool) => {
    setIsLaunching(prev => ({ ...prev, [tool.id]: true }));
    try {
      await apiService.launchTool(tool.id);
      console.log(`Launched tool: ${tool.name}`);
    } catch (error) {
      console.error(`Failed to launch tool ${tool.name}:`, error);
    } finally {
      setIsLaunching(prev => ({ ...prev, [tool.id]: false }));
    }
  };

  const getToolIcon = (category) => {
    switch (category) {
      case 'tracking': return '🎯';
      case 'compositing': return '🎬';
      case 'modeling': return '🎨';
      case 'utility': return '🔧';
      case 'custom': return '⚡';
      default: return '🛠️';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Tool Launcher</h2>
        <button className="btn-secondary flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>Manage Tools</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full pl-10"
              placeholder="Search tools..."
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field md:w-48"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTools.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            {tools.length === 0 ? (
              <div>
                <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tools configured yet.</p>
                <p className="text-sm">Add your custom tools and scripts to get started.</p>
              </div>
            ) : (
              <div>
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tools match your search criteria.</p>
                <p className="text-sm">Try adjusting your search or filter settings.</p>
              </div>
            )}
          </div>
        ) : (
          filteredTools.map(tool => (
            <div key={tool.id} className="card p-4 hover:bg-gray-800 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getToolIcon(tool.category)}</span>
                  <div>
                    <h3 className="font-medium">{tool.name}</h3>
                    <span className="text-xs text-gray-400 uppercase tracking-wide">
                      {tool.category}
                    </span>
                  </div>
                </div>
                {tool.isFavorite && (
                  <span className="text-yellow-400">⭐</span>
                )}
              </div>

              <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                {tool.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {tool.lastUsed ? `Last used: ${new Date(tool.lastUsed).toLocaleDateString()}` : 'Never used'}
                </span>
                <button
                  onClick={() => handleLaunchTool(tool)}
                  disabled={isLaunching[tool.id]}
                  className="btn-primary flex items-center space-x-1 text-sm px-3 py-1 disabled:opacity-50"
                >
                  {isLaunching[tool.id] ? (
                    <>
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      <span>Launching...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      <span>Launch</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary text-sm px-3 py-1">
            Open Tools Folder
          </button>
          <button className="btn-secondary text-sm px-3 py-1">
            Refresh Tools
          </button>
          <button className="btn-secondary text-sm px-3 py-1">
            Add New Tool
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolLauncher;