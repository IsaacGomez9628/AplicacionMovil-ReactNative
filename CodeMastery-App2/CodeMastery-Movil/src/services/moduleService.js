import api from "./api";

class ModuleService {
  async getModule(moduleId) {
    const response = await api.get(`/modules/${moduleId}`);
    return response.data;
  }

  async getModuleLessons(moduleId) {
    const response = await api.get(`/modules/${moduleId}/lessons`);
    return response.data;
  }

  async createModule(moduleData) {
    const response = await api.post("/modules/", moduleData);
    return response.data;
  }

  async updateModule(moduleId, moduleData) {
    const response = await api.put(`/modules/${moduleId}`, moduleData);
    return response.data;
  }

  async deleteModule(moduleId) {
    const response = await api.delete(`/modules/${moduleId}`);
    return response.data;
  }
}

export const moduleService = new ModuleService();
