import { api } from "./api"

class LessonService {
  async getLesson(lessonId) {
    const response = await api.get(`/auth/${lessonId}`)
    return response.data
  }

  async submitCode(lessonId, codeSubmitted) {
    const response = await api.post(`/auth/${lessonId}/enviar`, {
      code_submitted: codeSubmitted,
    })
    return response.data
  }

  async getLastAttempt(lessonId, userId) {
    const response = await api.get(`/auth/${lessonId}/ultimo-intento?user_id=${userId}`)
    return response.data
  }

  async getUserAttempts(userId) {
    const response = await api.get(`/auth/intentos?user_id=${userId}`)
    return response.data
  }

  async deleteAttempt(attemptId) {
    const response = await api.delete(`/auth/intentos/${attemptId}`)
    return response.data
  }

  async createLesson(lessonData) {
    const response = await api.post("/auth/lecciones", lessonData)
    return response.data
  }

  async updateLesson(lessonId, lessonData) {
    const response = await api.put(`/auth/lecciones/${lessonId}`, lessonData)
    return response.data
  }

  async deleteLesson(lessonId) {
    const response = await api.delete(`/auth/lecciones/${lessonId}`)
    return response.data
  }
}

export const lessonService = new LessonService()
