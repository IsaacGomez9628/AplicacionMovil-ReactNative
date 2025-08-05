import { api } from "./api"

class ProgressService {
  async getUserProgress(userId) {
    const response = await api.get(`/auth/${userId}`)
    return response.data
  }

  async updateProgress(progressData) {
    const response = await api.put("/auth/", progressData)
    return response.data
  }

  async getUserSummary(userId) {
    const response = await api.get(`/auth/resumen/${userId}`)
    return response.data
  }
}

export const progressService = new ProgressService()
