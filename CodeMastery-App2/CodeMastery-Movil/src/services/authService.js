// ✅ ARCHIVO CORREGIDO: src/services/authService.js
import api, { setAuthToken, clearAuthToken } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

class AuthService {
  constructor() {
    console.log("AuthService initialized");
    this.initializeAuthState();
  }

  // ✅ NUEVO: Inicializar estado de autenticación al cargar la app
  async initializeAuthState() {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        setAuthToken(token);
        console.log("🔑 Auth token restored from storage");
      }
    } catch (error) {
      console.error("Error initializing auth state:", error);
    }
  }

  async login(email, password) {
    console.log("🔐 Login attempt:", { email });

    try {
      const payload = {
        email: email.toLowerCase().trim(),
        password: password,
      };

      const response = await api.post("/auth/login", payload);

      // ✅ NUEVO: Guardar ambos tokens
      const { access_token, refresh_token, token_type, expires_in } =
        response.data;

      await AsyncStorage.multiSet([
        ["access_token", access_token],
        ["refresh_token", refresh_token],
        ["token_type", token_type],
        ["token_expires_in", expires_in.toString()],
        ["login_timestamp", Date.now().toString()],
      ]);

      // Configurar header por defecto
      setAuthToken(access_token);

      console.log("✅ Login successful with refresh token support");

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

      const response = await api.post("/auth/register", payload);

      console.log("✅ Register successful:", response.data);

      return response.data;
    } catch (error) {
      console.error("❌ Register error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

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
        const message = error.response.data.detail || "Email ya registrado";
        throw new Error(message);
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

  // ✅ NUEVO: Refresh manual de token
  async refreshToken() {
    console.log("🔄 Manual token refresh...");

    try {
      const refreshToken = await AsyncStorage.getItem("refresh_token");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await api.post(
        "/auth/refresh",
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      const { access_token, refresh_token, token_type, expires_in } =
        response.data;

      await AsyncStorage.multiSet([
        ["access_token", access_token],
        ["refresh_token", refresh_token],
        ["token_type", token_type],
        ["token_expires_in", expires_in.toString()],
        ["login_timestamp", Date.now().toString()],
      ]);

      setAuthToken(access_token);

      console.log("✅ Manual token refresh successful");

      return response.data;
    } catch (error) {
      console.error("❌ Manual token refresh failed:", error);
      throw error;
    }
  }

  // ✅ NUEVO: Logout mejorado
  async logout() {
    console.log("🔓 Logging out...");

    try {
      // Intentar logout del servidor (opcional)
      try {
        await api.post("/auth/logout");
        console.log("✅ Server logout successful");
      } catch (error) {
        console.warn(
          "Server logout failed, continuing with local logout:",
          error.message
        );
      }

      // Limpiar almacenamiento local
      await AsyncStorage.multiRemove([
        "access_token",
        "refresh_token",
        "token_type",
        "token_expires_in",
        "login_timestamp",
        "user",
      ]);

      // Limpiar headers
      clearAuthToken();

      console.log("✅ Local logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Aún así limpiar los tokens localmente
      await AsyncStorage.multiRemove(["access_token", "refresh_token", "user"]);
      clearAuthToken();
    }
  }

  // ✅ NUEVO: Verificar si hay token válido
  async hasValidToken() {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const refreshToken = await AsyncStorage.getItem("refresh_token");

      return !!(token && refreshToken);
    } catch (error) {
      console.error("Error checking token validity:", error);
      return false;
    }
  }

  // ✅ NUEVO: Verificar tiempo de expiración
  async isTokenExpiringSoon() {
    try {
      const expiresIn = await AsyncStorage.getItem("token_expires_in");
      const loginTimestamp = await AsyncStorage.getItem("login_timestamp");

      if (!expiresIn || !loginTimestamp) {
        return true; // Asumir que expira si no hay información
      }

      const expiryTime = parseInt(loginTimestamp) + parseInt(expiresIn) * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // Considerar que expira "pronto" si quedan menos de 5 minutos
      return timeUntilExpiry < 5 * 60 * 1000;
    } catch (error) {
      console.error("Error checking token expiry:", error);
      return true;
    }
  }

  // Test de conexión de autenticación
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
