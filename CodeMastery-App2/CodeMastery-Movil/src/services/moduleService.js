import { api } from "./api"

class ModuleService {
  async getModule(moduleId) {
    const response = await api.get(`/auth/${moduleId}`)
    return response.data
  }

  async getModuleLessons(moduleId) {
    const response = await api.get(`/auth/modulos/${moduleId}/lecciones`)
    return response.data
  }

  async createModule(moduleData) {
    const response = await api.post("/auth/modulos", moduleData)
    return response.data
  }

  async updateModule(moduleId, moduleData) {
    const response = await api.put(`/auth/modulos/${moduleId}`, moduleData)
    return response.data
  }

  async deleteModule(moduleId) {
    const response = await api.delete(`/auth/modulos/${moduleId}`)
    return response.data
  }
}

export const moduleService = new ModuleService()
