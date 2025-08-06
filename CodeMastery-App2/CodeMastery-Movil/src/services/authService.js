import api from "./api";
import { Alert } from "react-native";

class AuthService {
  constructor() {
    console.log("AuthService initialized");
  }

  async login(email, password) {
    console.log("🔐 Login attempt:", { email });

    try {
      const payload = {
        email: email.toLowerCase().trim(),
        password: password,
      };

      console.log("Sending login request with payload:", payload);

      const response = await api.post("/auth/login", payload);

      console.log("✅ Login successful:", response.data);

      return response.data;
    } catch (error) {
      console.error("❌ Login error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 422) {
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
    console.log("📝 Register attempt:", { name, email });

    try {
      // Validaciones del lado del cliente
      if (!name || name.trim().length < 2) {
        throw new Error("El nombre debe tener al menos 2 caracteres");
      }

      if (!email || !email.includes("@")) {
        throw new Error("Email inválido");
      }

      if (!password || password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
      }

      const payload = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
      };

      console.log("Sending register request:", {
        ...payload,
        password: "***hidden***",
      });

      const response = await api.post("/auth/register", payload);

      console.log("✅ Register successful:", response.data);

      return response.data;
    } catch (error) {
      console.error("❌ Register error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        stack: error.stack,
      });

      // Manejo detallado de errores
      if (error.response?.status === 422) {
        const details = error.response.data.detail;
        if (Array.isArray(details)) {
          const messages = details
            .map((d) => `${d.loc[1]}: ${d.msg}`)
            .join("\n");
          Alert.alert("Error de Validación", messages);
          throw new Error(messages);
        }
      }

      if (error.response?.status === 400) {
        const message = error.response.data.detail || "Email ya registrado";
        Alert.alert("Error", message);
        throw new Error(message);
      }

      if (error.message === "Network Error") {
        Alert.alert(
          "Error de Conexión",
          "No se puede conectar al servidor. Verifica tu conexión."
        );
        throw new Error("No se puede conectar al servidor");
      }

      throw error;
    }
  }

  async getMe() {
    console.log("👤 Getting user info...");

    try {
      const response = await api.get("/auth/me");
      console.log("✅ User info retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Get user error:", error);
      throw error;
    }
  }

  setAuthToken(token) {
    if (token) {
      console.log("🔑 Setting auth token");
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      console.log("🔓 Removing auth token");
      delete api.defaults.headers.common["Authorization"];
    }
  }

  // Método de prueba para verificar la conexión
  async testAuthConnection() {
    console.log("🧪 Testing auth connection...");

    try {
      const response = await api.get("/auth/test");
      console.log("✅ Auth test successful:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ Auth test failed:", error);
      return { success: false, error: error.message };
    }
  }
}

export const authService = new AuthService();
