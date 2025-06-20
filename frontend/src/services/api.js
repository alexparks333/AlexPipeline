// frontend/src/services/api.js
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

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