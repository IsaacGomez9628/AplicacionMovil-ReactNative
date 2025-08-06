import { api } from "./api";

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    } catch (error) {
      if (error.response?.status === 422) {
        // Error de validación
        const details = error.response.data.detail;
        if (Array.isArray(details)) {
          const messages = details.map((d) => d.msg).join(", ");
          throw new Error(`Validation error: ${messages}`);
        }
      }
      throw error;
    }
  }

  async register(name, email, password) {
    try {
      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 422) {
        const details = error.response.data.detail;
        if (Array.isArray(details)) {
          const messages = details
            .map((d) => `${d.loc[1]}: ${d.msg}`)
            .join("\n");
          throw new Error(messages);
        }
      }
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data.detail || "Email already registered"
        );
      }
      throw error;
    }
  }

  async getMe() {
    const response = await api.get("/auth/me");
    return response.data;
  }

  setAuthToken(token) {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }
}

export const authService = new AuthService();
