// frontend/src/services/api.js
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Settings API
export const settingsService = {
  async getSettings() {
    const response = await api.get('/settings')
    return response.data
  },

  async saveSettings(settings) {
    const response = await api.post('/settings', settings)
    return response.data
  },

  async validatePath(path) {
    const response = await api.post('/settings/validate-path', { path })
    return response.data
  }
}

// Project API
export const projectService = {
  async getProjects() {
    const response = await api.get('/projects')
    return response.data
  },

  async createProject(projectData) {
    const response = await api.post('/projects', projectData)
    return response.data
  },

  async getProject(projectId) {
    const response = await api.get(`/projects/${projectId}`)
    return response.data
  },

  async updateProject(projectId, projectData) {
    const response = await api.put(`/projects/${projectId}`, projectData)
    return response.data
  },

  async deleteProject(projectId) {
    const response = await api.delete(`/projects/${projectId}`)
    return response.data
  },

  async getProjectMetadata(projectId) {
    const response = await api.get(`/projects/${projectId}/metadata`)
    return response.data
  },

  async updateProjectMetadata(projectId, metadataData) {
    const response = await api.put(`/projects/${projectId}/metadata`, metadataData)
    return response.data
  }
}

// Tool API
export const toolService = {
  async getTools() {
    const response = await api.get('/tools')
    return response.data
  },

  async createTool(toolData) {
    const response = await api.post('/tools', toolData)
    return response.data
  },

  async updateTool(toolId, toolData) {
    const response = await api.put(`/tools/${toolId}`, toolData)
    return response.data
  },

  async deleteTool(toolId) {
    const response = await api.delete(`/tools/${toolId}`)
    return response.data
  },

  async launchTool(toolId) {
    const response = await api.post(`/tools/${toolId}/launch`)
    return response.data
  }
}

// Template API
export const templateService = {
  async getFolderTemplates() {
    const response = await api.get('/templates')
    return response.data
  }
}

// Library API
export const libraryService = {
  async getLibraries() {
    const response = await api.get('/libraries')
    return response.data
  },

  async getLibrary(libraryId) {
    const response = await api.get(`/libraries/${libraryId}`)
    return response.data
  },

  async createLibrary(libraryData) {
    const response = await api.post('/libraries', libraryData)
    return response.data
  },

  async addLibraryItem(libraryId, itemData) {
    const response = await api.post(`/libraries/${libraryId}/items`, itemData)
    return response.data
  },

  async updateLibraryItem(libraryId, itemId, itemData) {
    const response = await api.put(`/libraries/${libraryId}/items/${itemId}`, itemData)
    return response.data
  },

  async deleteLibraryItem(libraryId, itemId) {
    const response = await api.delete(`/libraries/${libraryId}/items/${itemId}`)
    return response.data
  }
}