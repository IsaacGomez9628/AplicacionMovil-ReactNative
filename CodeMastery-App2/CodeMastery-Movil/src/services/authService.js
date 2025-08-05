import { api } from "./api"

class AuthService {
  setAuthToken(token) {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common["Authorization"]
    }
  }

  async login(email, password) {
    const response = await api.post("/auth/login", { email, password })
    return response.data
  }

  async register(name, email, password) {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    })
    return response.data
  }

  async getMe() {
    const response = await api.get("/auth/me")
    return response.data
  }
}

export const authService = new AuthService()
