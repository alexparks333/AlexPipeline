import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = window.electronAPI?.apiUrl || 'http://localhost:8000';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Project Management
  async getProjects() {
    try {
      const response = await this.api.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return [];
    }
  }

  async createProject(projectData) {
    const response = await this.api.post('/projects', projectData);
    return response.data;
  }

  async getProject(projectId) {
    const response = await this.api.get(`/projects/${projectId}`);
    return response.data;
  }

  async updateProject(projectId, projectData) {
    const response = await this.api.put(`/projects/${projectId}`, projectData);
    return response.data;
  }

  async deleteProject(projectId) {
    const response = await this.api.delete(`/projects/${projectId}`);
    return response.data;
  }

  // Project Metadata
  async getProjectMetadata(projectId) {
    try {
      const response = await this.api.get(`/projects/${projectId}/metadata`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch project metadata:', error);
      return {};
    }
  }

  async updateProjectMetadata(projectId, metadata) {
    const response = await this.api.put(`/projects/${projectId}/metadata`, metadata);
    return response.data;
  }

  // Tool Management
  async getTools() {
    try {
      const response = await this.api.get('/tools');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tools:', error);
      return [];
    }
  }

  async getTool(toolId) {
    const response = await this.api.get(`/tools/${toolId}`);
    return response.data;
  }

  async createTool(toolData) {
    const response = await this.api.post('/tools', toolData);
    return response.data;
  }

  async updateTool(toolId, toolData) {
    const response = await this.api.put(`/tools/${toolId}`, toolData);
    return response.data;
  }

  async deleteTool(toolId) {
    const response = await this.api.delete(`/tools/${toolId}`);
    return response.data;
  }

  async launchTool(toolId) {
    const response = await this.api.post(`/tools/${toolId}/launch`);
    return response.data;
  }

  // Folder Structure Templates
  async getFolderTemplates() {
    try {
      const response = await this.api.get('/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch folder templates:', error);
      return [];
    }
  }

  async createFolderStructure(projectId, templateType) {
    const response = await this.api.post(`/projects/${projectId}/folders`, {
      template_type: templateType
    });
    return response.data;
  }

  // Settings
  async getSettings() {
    try {
      const response = await this.api.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      return {};
    }
  }

  async updateSettings(settings) {
    const response = await this.api.put('/settings', settings);
    return response.data;
  }

  // Health Check
  async healthCheck() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      return { status: 'error', message: 'Backend unreachable' };
    }
  }
}

const apiService = new ApiService();
export default apiService;