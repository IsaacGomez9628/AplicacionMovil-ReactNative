import api from "./api";

class ProgressService {
  async getUserProgress(userId) {
    const response = await api.get(`/progress/${userId}`);
    return response.data;
  }

  async updateProgress(userId, moduleId, progressData) {
    const response = await api.put(
      `/progress/?user_id=${userId}&module_id=${moduleId}`,
      progressData
    );
    return response.data;
  }

  async getUserSummary(userId) {
    const response = await api.get(`/progress/resumen/${userId}`);
    return response.data;
  }
}

export const progressService = new ProgressService();
