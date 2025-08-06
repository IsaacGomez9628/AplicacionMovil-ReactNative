import { api } from "./api";

// ✅ CORRECCIÓN: lessonService.js corregido
class LessonService {
  async getLesson(lessonId) {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data;
  }

  async submitCode(lessonId, codeSubmitted) {
    const response = await api.post(`/lessons/${lessonId}/enviar`, {
      code_submitted: codeSubmitted,
    });
    return response.data;
  }

  async getLastAttempt(lessonId, userId) {
    const response = await api.get(
      `/lessons/${lessonId}/ultimo-intento?user_id=${userId}`
    );
    return response.data;
  }

  async getUserAttempts(userId) {
    const response = await api.get(`/lessons/intentos?user_id=${userId}`);
    return response.data;
  }

  async deleteAttempt(attemptId) {
    const response = await api.delete(`/lessons/intentos/${attemptId}`);
    return response.data;
  }
}

// ✅ CORRECCIÓN: moduleService.js corregido
class ModuleService {
  async getModule(moduleId) {
    const response = await api.get(`/modules/${moduleId}`);
    return response.data;
  }

  async getModuleLessons(moduleId) {
    const response = await api.get(`/modules/${moduleId}/lessons`);
    return response.data;
  }
}

// ✅ CORRECCIÓN: progressService.js corregido
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

export const lessonService = new LessonService();
