// ✅ ARCHIVO CORREGIDO: src/services/authService.js
import api, { setAuthToken, clearAuthToken } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

class AuthService {
  constructor() {
    console.log("AuthService initialized");
    this.initializeAuthState();
  }

  // ✅ CORRECCIÓN: Sin 'async' antes del nombre del método
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

  // ✅ LOGIN CON REFRESH TOKEN
  // ✅ CORRECCIÓN ESPECÍFICA: src/services/authService.js
  // Solo la función login corregida

  async login(email, password) {
    console.log("🔐 Login attempt:", { email });

    try {
      const payload = {
        email: email.toLowerCase().trim(),
        password: password,
      };

      const response = await api.post("/auth/login", payload);

      // ✅ VALIDAR QUE LA RESPUESTA SEA EXITOSA
      if (response.status !== 200) {
        throw new Error(`Login failed with status: ${response.status}`);
      }

      // ✅ VALIDAR QUE TENGAMOS LOS TOKENS REQUERIDOS
      const responseData = response.data;
      if (!responseData) {
        throw new Error("No data received from login endpoint");
      }

      const { access_token, refresh_token, token_type, expires_in } =
        responseData;

      // ✅ VALIDAR QUE LOS TOKENS EXISTAN ANTES DE GUARDAR
      if (!access_token) {
        throw new Error("No access token received from server");
      }

      if (!refresh_token) {
        throw new Error("No refresh token received from server");
      }

      console.log("✅ Valid tokens received from server");
      console.log(`🔑 Access token length: ${access_token.length}`);
      console.log(`🔄 Refresh token length: ${refresh_token.length}`);

      // ✅ GUARDAR TOKENS SOLO SI SON VÁLIDOS
      await AsyncStorage.multiSet([
        ["access_token", access_token],
        ["refresh_token", refresh_token],
        ["token_type", token_type || "bearer"],
        ["token_expires_in", expires_in ? expires_in.toString() : "1800"], // 30 min default
        ["login_timestamp", Date.now().toString()],
      ]);

      // Configurar header por defecto
      setAuthToken(access_token);

      console.log("✅ Login successful with refresh token support");
      console.log("✅ Tokens saved to AsyncStorage");

      return responseData;
    } catch (error) {
      console.error("❌ Login error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      // ✅ MANEJO ESPECÍFICO DE ERRORES
      let errorMessage;

      if (error.response?.status === 401) {
        const detail = error.response.data?.detail;
        if (detail === "Incorrect email or password") {
          errorMessage = "Email o contraseña incorrectos";
        } else {
          errorMessage = "Credenciales inválidas";
        }
      } else if (error.response?.status === 422) {
        const details = error.response.data.detail;
        if (Array.isArray(details)) {
          const messages = details.map((d) => d.msg).join(", ");
          errorMessage = `Error de validación: ${messages}`;
        } else {
          errorMessage = "Datos de login inválidos";
        }
      } else if (error.response?.status === 404) {
        errorMessage = "Usuario no encontrado";
      } else if (error.response?.status >= 500) {
        errorMessage = "Error del servidor. Intenta más tarde.";
      } else if (error.message?.includes("AsyncStorage")) {
        // Este error ya no debería ocurrir, pero por seguridad
        errorMessage = "Error interno de la aplicación";
        console.error("❌ AsyncStorage error prevented:", error.message);
      } else if (error.message === "Network Error") {
        errorMessage = "Sin conexión al servidor";
      } else {
        errorMessage =
          error.response?.data?.detail ||
          error.message ||
          "Error de autenticación";
      }

      throw new Error(errorMessage);
    }
  }

  // ✅ REGISTER
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

      throw new Error(
        error.response?.data?.detail || error.message || "Error de registro"
      );
    }
  }

  // ✅ GET USER INFO
  async getMe() {
    console.log("👤 Getting user info...");

    try {
      const response = await api.get("/auth/me");
      console.log("✅ User info retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Get user error:", error);

      // Si es 401, probablemente el token expiró
      if (error.response?.status === 401) {
        throw new Error("Token expirado");
      }

      throw error;
    }
  }

  // ✅ REFRESH TOKEN MEJORADO
  async refreshToken() {
    console.log("🔄 Token refresh requested...");

    try {
      const refreshToken = await AsyncStorage.getItem("refresh_token");

      if (!refreshToken) {
        throw new Error("No refresh token disponible");
      }

      // Hacer la petición de refresh
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

      // Guardar nuevos tokens
      await AsyncStorage.multiSet([
        ["access_token", access_token],
        ["refresh_token", refresh_token],
        ["token_type", token_type || "bearer"],
        ["token_expires_in", expires_in ? expires_in.toString() : "1800"],
        ["login_timestamp", Date.now().toString()],
      ]);

      // Actualizar header por defecto
      setAuthToken(access_token);

      console.log("✅ Token refresh successful");

      return response.data;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);

      // Si el refresh token también expiró, limpiar todo
      if (error.response?.status === 401) {
        await this.clearTokens();
        throw new Error("Refresh token expirado, relogin requerido");
      }

      throw new Error(
        error.response?.data?.detail ||
          error.message ||
          "Error al refrescar token"
      );
    }
  }

  // ✅ LOGOUT MEJORADO
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
      await this.clearTokens();

      console.log("✅ Logout completed successfully");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Aún así limpiar los tokens localmente
      await this.clearTokens();
    }
  }

  // ✅ LIMPIAR TOKENS
  async clearTokens() {
    try {
      await AsyncStorage.multiRemove([
        "access_token",
        "refresh_token",
        "token_type",
        "token_expires_in",
        "login_timestamp",
        "user",
      ]);

      clearAuthToken();
      console.log("✅ Tokens cleared from storage");
    } catch (error) {
      console.error("❌ Error clearing tokens:", error);
    }
  }

  // ✅ VERIFICAR SI HAY TOKEN VÁLIDO
  async hasValidToken() {
    try {
      const tokens = await AsyncStorage.multiGet([
        "access_token",
        "refresh_token",
      ]);

      const accessToken = tokens[0][1];
      const refreshToken = tokens[1][1];

      return !!(accessToken && refreshToken);
    } catch (error) {
      console.error("Error checking token validity:", error);
      return false;
    }
  }

  // ✅ VERIFICAR SI EL TOKEN EXPIRA PRONTO
  async isTokenExpiringSoon() {
    try {
      const tokens = await AsyncStorage.multiGet([
        "token_expires_in",
        "login_timestamp",
      ]);

      const expiresIn = tokens[0][1];
      const loginTimestamp = tokens[1][1];

      if (!expiresIn || !loginTimestamp) {
        console.warn("⚠️ Missing token expiry info, assuming expired");
        return true; // Asumir que expira si no hay información
      }

      const expiryTime = parseInt(loginTimestamp) + parseInt(expiresIn) * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // Considerar que expira "pronto" si quedan menos de 5 minutos
      const isExpiring = timeUntilExpiry < 5 * 60 * 1000;

      if (isExpiring) {
        console.log(
          `⚠️ Token expiring in ${Math.floor(timeUntilExpiry / 1000)} seconds`
        );
      }

      return isExpiring;
    } catch (error) {
      console.error("Error checking token expiry:", error);
      return true;
    }
  }

  // ✅ OBTENER TIEMPO RESTANTE DEL TOKEN
  async getTokenTimeRemaining() {
    try {
      const tokens = await AsyncStorage.multiGet([
        "token_expires_in",
        "login_timestamp",
      ]);

      const expiresIn = tokens[0][1];
      const loginTimestamp = tokens[1][1];

      if (!expiresIn || !loginTimestamp) {
        return 0;
      }

      const expiryTime = parseInt(loginTimestamp) + parseInt(expiresIn) * 1000;
      const currentTime = Date.now();
      const timeRemaining = Math.max(0, expiryTime - currentTime);

      return Math.floor(timeRemaining / 1000); // En segundos
    } catch (error) {
      console.error("Error getting token time remaining:", error);
      return 0;
    }
  }

  // ✅ VALIDAR TOKEN ACTUAL
  async validateCurrentToken() {
    try {
      const response = await this.getMe();
      return { valid: true, user: response };
    } catch (error) {
      console.log("❌ Current token invalid:", error.message);
      return { valid: false, error: error.message };
    }
  }

  // ✅ FORZAR REFRESH SI ES NECESARIO
  async ensureValidToken() {
    try {
      // Primero verificar si el token actual es válido
      const validation = await this.validateCurrentToken();

      if (validation.valid) {
        console.log("✅ Current token is valid");
        return true;
      }

      // Si no es válido, intentar refresh
      console.log("🔄 Current token invalid, attempting refresh...");
      await this.refreshToken();

      // Verificar de nuevo
      const newValidation = await this.validateCurrentToken();
      return newValidation.valid;
    } catch (error) {
      console.error("❌ Failed to ensure valid token:", error);
      return false;
    }
  }

  // ✅ OBTENER INFORMACIÓN COMPLETA DEL TOKEN
  async getTokenInfo() {
    try {
      const tokens = await AsyncStorage.multiGet([
        "access_token",
        "refresh_token",
        "token_type",
        "token_expires_in",
        "login_timestamp",
      ]);

      const accessToken = tokens[0][1];
      const refreshToken = tokens[1][1];
      const tokenType = tokens[2][1];
      const expiresIn = tokens[3][1];
      const loginTimestamp = tokens[4][1];

      if (!accessToken || !refreshToken) {
        return null;
      }

      const expiryTime = loginTimestamp
        ? parseInt(loginTimestamp) + parseInt(expiresIn || "1800") * 1000
        : null;

      const timeRemaining = expiryTime
        ? Math.max(0, expiryTime - Date.now())
        : 0;

      return {
        hasTokens: !!(accessToken && refreshToken),
        accessToken: accessToken ? accessToken.substring(0, 20) + "..." : null,
        refreshToken: refreshToken
          ? refreshToken.substring(0, 20) + "..."
          : null,
        tokenType: tokenType || "bearer",
        expiresIn: parseInt(expiresIn || "1800"),
        loginTimestamp: loginTimestamp
          ? new Date(parseInt(loginTimestamp))
          : null,
        expiryTime: expiryTime ? new Date(expiryTime) : null,
        timeRemainingMs: timeRemaining,
        timeRemainingSec: Math.floor(timeRemaining / 1000),
        isExpiringSoon: timeRemaining < 5 * 60 * 1000,
        isExpired: timeRemaining <= 0,
      };
    } catch (error) {
      console.error("Error getting token info:", error);
      return null;
    }
  }

  // ✅ DIAGNOSTIC COMPLETO
  async diagnose() {
    console.log("🔍 === AUTH SERVICE DIAGNOSTIC ===");

    try {
      const tokenInfo = await this.getTokenInfo();

      if (!tokenInfo) {
        console.log("❌ No hay tokens disponibles");
        return { status: "no_tokens", recommendation: "Login requerido" };
      }

      console.log("📊 Token Info:", {
        hasTokens: tokenInfo.hasTokens,
        tokenType: tokenInfo.tokenType,
        expiresIn: `${tokenInfo.expiresIn}s`,
        timeRemaining: `${tokenInfo.timeRemainingSec}s`,
        isExpiringSoon: tokenInfo.isExpiringSoon,
        isExpired: tokenInfo.isExpired,
        loginTime: tokenInfo.loginTimestamp?.toISOString(),
        expiryTime: tokenInfo.expiryTime?.toISOString(),
      });

      if (tokenInfo.isExpired) {
        console.log("❌ Token expirado");
        return {
          status: "expired",
          recommendation: "Refresh automático o relogin",
          tokenInfo,
        };
      }

      if (tokenInfo.isExpiringSoon) {
        console.log("⚠️ Token próximo a expirar");
        return {
          status: "expiring_soon",
          recommendation: "Refresh preventivo recomendado",
          tokenInfo,
        };
      }

      // Validar token con el servidor
      const validation = await this.validateCurrentToken();

      if (!validation.valid) {
        console.log("❌ Token inválido en servidor");
        return {
          status: "invalid",
          recommendation: "Refresh requerido",
          error: validation.error,
          tokenInfo,
        };
      }

      console.log("✅ Token válido y saludable");
      return {
        status: "healthy",
        recommendation: "Todo OK",
        user: validation.user,
        tokenInfo,
      };
    } catch (error) {
      console.error("❌ Diagnostic error:", error);
      return {
        status: "error",
        recommendation: "Investigar error",
        error: error.message,
      };
    }
  }

  // ✅ MÉTODO DE EMERGENCIA PARA RESETEAR TODO
  async emergencyReset() {
    console.log("🚨 Emergency reset initiated...");

    try {
      // Limpiar todos los tokens
      await this.clearTokens();

      // Limpiar headers
      clearAuthToken();

      // Limpiar cualquier cache adicional
      await AsyncStorage.multiRemove([
        "user_preferences",
        "app_cache",
        "temp_data",
      ]);

      console.log("✅ Emergency reset completed");
      return { success: true, message: "Reset completo exitoso" };
    } catch (error) {
      console.error("❌ Emergency reset failed:", error);
      return { success: false, error: error.message };
    }
  }

  // ✅ HEALTH CHECK COMPLETO
  async healthCheck() {
    const start = Date.now();

    try {
      // Test 1: Verificar conectividad básica
      const connectionTest = await api.get("/health");
      const connectionTime = Date.now() - start;

      // Test 2: Verificar tokens locales
      const tokenInfo = await this.getTokenInfo();

      // Test 3: Test auth endpoint si hay token
      let authTest = null;
      if (tokenInfo?.hasTokens) {
        try {
          const authStart = Date.now();
          authTest = await this.getMe();
          authTest.responseTime = Date.now() - authStart;
        } catch (authError) {
          authTest = { error: authError.message, valid: false };
        }
      }

      return {
        status: "completed",
        connectionTest: {
          success: connectionTest.status === 200,
          responseTime: connectionTime,
          data: connectionTest.data,
        },
        tokenTest: tokenInfo,
        authTest,
        totalTime: Date.now() - start,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "failed",
        error: error.message,
        totalTime: Date.now() - start,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ✅ TEST DE CONEXIÓN AUTH
  async testAuthConnection() {
    console.log("🧪 Testing auth connection...");

    try {
      const response = await api.get("/auth/test");
      console.log("✅ Auth test successful:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ Auth test failed:", error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
      };
    }
  }
}

// ✅ EXPORTAR INSTANCIA ÚNICA
export const authService = new AuthService();
