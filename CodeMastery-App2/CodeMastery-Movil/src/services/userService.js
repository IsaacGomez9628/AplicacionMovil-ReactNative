import { api } from "./api"

class UserService {
  async getUsers() {
    const response = await api.get("/usuarios/")
    return response.data
  }

  async getUser(userId) {
    const response = await api.get(`/usuarios/${userId}`)
    return response.data
  }

  async updateUser(userId, userData) {
    const response = await api.put(`/usuarios/${userId}`, userData)
    return response.data
  }

  async deleteUser(userId) {
    const response = await api.delete(`/usuarios/${userId}`)
    return response.data
  }
}

export const userService = new UserService()
