// ✅ ARCHIVO MEJORADO: src/services/api.js
import axios from "axios";
import { Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";

// ✅ CONFIGURACIÓN DE URL BASE
const getBaseURL = () => {
  const YOUR_COMPUTER_IP = "172.20.10.3"; // ← Tu IP detectada

  if (__DEV__) {
    if (Platform.OS === "android") {
      if (Device.isDevice) {
        console.log(`🤖 Android Device URL: http://${YOUR_COMPUTER_IP}:8001`);
        return `http://${YOUR_COMPUTER_IP}:8001`;
      } else {
        console.log("🤖 Android Emulator URL: http://10.0.2.2:8001");
        return "http://10.0.2.2:8001";
      }
    } else if (Platform.OS === "ios") {
      if (Device.isDevice) {
        console.log(`📱 iOS Device URL: http://${YOUR_COMPUTER_IP}:8001`);
        return `http://${YOUR_COMPUTER_IP}:8001`;
      } else {
        console.log("📱 iOS Simulator URL: http://localhost:8001");
        return "http://localhost:8001";
      }
    } else {
      console.log("🌐 Web URL: http://localhost:8001");
      return "http://localhost:8001";
    }
  } else {
    return "https://tu-api-produccion.com";
  }
};

const API_BASE_URL = getBaseURL();

// ✅ CONFIGURACIÓN AXIOS MEJORADA
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  },
});

// ✅ SISTEMA DE REFRESH TOKEN MEJORADO
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// ✅ FUNCIÓN PARA OBTENER TOKENS DEL STORAGE CON MEJOR MANEJO DE ERRORES
const getTokensFromStorage = async () => {
  try {
    const tokens = await AsyncStorage.multiGet([
      "access_token",
      "refresh_token",
      "token_expires_in",
      "login_timestamp",
    ]);

    return {
      accessToken: tokens[0][1],
      refreshToken: tokens[1][1],
      expiresIn: tokens[2][1],
      loginTimestamp: tokens[3][1],
    };
  } catch (error) {
    console.error("❌ Error getting tokens from storage:", error);
    return {};
  }
};

// ✅ FUNCIÓN MEJORADA PARA VERIFICAR SI EL TOKEN ESTÁ PRÓXIMO A EXPIRAR
const isTokenExpiringSoon = async (bufferMinutes = 5) => {
  try {
    const { expiresIn, loginTimestamp } = await getTokensFromStorage();

    if (!expiresIn || !loginTimestamp) {
      console.log("⚠️ Missing token expiry info, assuming expired");
      return true;
    }

    const expiryTime = parseInt(loginTimestamp) + parseInt(expiresIn) * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;
    const bufferTime = bufferMinutes * 60 * 1000;

    const isExpiring = timeUntilExpiry < bufferTime;

    if (isExpiring) {
      console.log(
        `⚠️ Token expiring in ${Math.floor(timeUntilExpiry / 1000)}s`
      );
    } else {
      console.log(`✅ Token valid for ${Math.floor(timeUntilExpiry / 1000)}s`);
    }

    return isExpiring;
  } catch (error) {
    console.error("❌ Error checking token expiry:", error);
    return true;
  }
};

// ✅ FUNCIÓN DE REFRESH MEJORADA CON MEJOR LOGGING
const performTokenRefresh = async () => {
  const { refreshToken } = await getTokensFromStorage();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  console.log("🔄 Performing token refresh...");

  const refreshResponse = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  if (refreshResponse.status !== 200) {
    throw new Error(`Refresh failed with status: ${refreshResponse.status}`);
  }

  const { access_token, refresh_token, token_type, expires_in } =
    refreshResponse.data;

  // Guardar nuevos tokens
  await AsyncStorage.multiSet([
    ["access_token", access_token],
    ["refresh_token", refresh_token],
    ["token_type", token_type || "bearer"],
    ["token_expires_in", (expires_in || 1800).toString()],
    ["login_timestamp", Date.now().toString()],
  ]);

  // Actualizar header por defecto
  api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

  console.log("✅ Token refresh completed successfully");

  return access_token;
};

// ✅ INTERCEPTOR DE REQUEST SUPER MEJORADO
api.interceptors.request.use(
  async (config) => {
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );

    // Skip auth for certain endpoints
    const skipAuthEndpoints = ["/health", "/auth/login", "/auth/register"];
    const shouldSkipAuth = skipAuthEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (shouldSkipAuth) {
      console.log("⏩ Skipping auth for public endpoint");
      return config;
    }

    try {
      // Verificar si necesitamos refresh
      const needsRefresh = await isTokenExpiringSoon(5); // 5 minutos buffer

      if (needsRefresh && !isRefreshing) {
        console.log("🔄 Preemptive token refresh needed");

        isRefreshing = true;
        try {
          const newToken = await performTokenRefresh();
          config.headers.Authorization = `Bearer ${newToken}`;
          console.log("✅ Preemptive refresh successful");
        } catch (refreshError) {
          console.error("❌ Preemptive refresh failed:", refreshError);
          // Continue with existing token
        } finally {
          isRefreshing = false;
        }
      } else {
        // Usar token existente
        const { accessToken } = await getTokensFromStorage();
        if (accessToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${accessToken}`;
          console.log("🔑 Using existing access token");
        }
      }
    } catch (error) {
      console.error("❌ Error in request interceptor:", error);
    }

    // Log final headers (sin mostrar token completo)
    const authHeader = config.headers.Authorization;
    console.log(
      `📋 Auth Header: ${
        authHeader ? authHeader.substring(0, 20) + "..." : "None"
      }`
    );

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// ✅ INTERCEPTOR DE RESPONSE SUPER MEJORADO
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ API Response: ${
        response.status
      } ${response.config.method?.toUpperCase()} ${response.config.url}`
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error(
      `❌ API Error: ${
        error.response?.status
      } ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`
    );
    console.error(`❌ Error details:`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // ✅ MANEJO ROBUSTO DE TOKEN EXPIRADO (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Evitar loops infinitos en endpoints de auth
      const isAuthEndpoint = originalRequest.url?.includes("/auth/");
      const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh");

      if (isRefreshEndpoint) {
        console.log("❌ Refresh endpoint failed, user needs to re-login");

        // Limpiar tokens y notificar logout
        await AsyncStorage.multiRemove([
          "access_token",
          "refresh_token",
          "token_type",
          "token_expires_in",
          "login_timestamp",
          "user",
        ]);

        // Emitir evento para que AuthContext maneje el logout
        if (global.authContext?.handleTokenExpired) {
          global.authContext.handleTokenExpired();
        }

        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Si ya se está refrescando, poner en cola
        console.log("🔄 Request queued while refreshing token...");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🔄 Attempting token refresh due to 401...");
        const newToken = await performTokenRefresh();

        // Procesar cola de peticiones pendientes
        processQueue(null, newToken);
        isRefreshing = false;

        // Reintentar la petición original
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        console.log("🔄 Retrying original request with new token");
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);

        processQueue(refreshError, null);
        isRefreshing = false;

        // Limpiar tokens y notificar logout
        await AsyncStorage.multiRemove([
          "access_token",
          "refresh_token",
          "token_type",
          "token_expires_in",
          "login_timestamp",
          "user",
        ]);

        // Emitir evento para que AuthContext maneje el logout
        if (global.authContext?.handleTokenExpired) {
          global.authContext.handleTokenExpired();
        }

        return Promise.reject(refreshError);
      }
    }

    // ✅ MANEJO DE OTROS ERRORES
    if (error.response?.status === 403) {
      console.error("❌ Forbidden - User might not have permission");
      Alert.alert(
        "Acceso Denegado",
        "No tienes permisos para acceder a este recurso."
      );
    } else if (error.code === "ECONNABORTED") {
      console.error("❌ Request timeout");
      Alert.alert(
        "Timeout",
        "La solicitud tardó demasiado. Verifica tu conexión."
      );
    } else if (error.message === "Network Error") {
      console.error("❌ Network error");
      Alert.alert(
        "Error de Conexión",
        `No se puede conectar al servidor.\n\nURL: ${API_BASE_URL}\n\nVerifica que el servidor esté corriendo.`
      );
    } else if (error.response?.status >= 500) {
      console.error("❌ Server error");
      Alert.alert(
        "Error del Servidor",
        "Hay un problema en el servidor. Intenta de nuevo más tarde."
      );
    }

    return Promise.reject(error);
  }
);

// ✅ FUNCIONES DE UTILIDAD MEJORADAS
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("🔑 Auth token set in axios defaults");
  } else {
    delete api.defaults.headers.common["Authorization"];
    console.log("🔑 Auth token removed from axios defaults");
  }
};

export const clearAuthToken = () => {
  delete api.defaults.headers.common["Authorization"];
  console.log("🔑 Auth token cleared from axios defaults");
};

// ✅ TEST DE CONEXIÓN MEJORADO
export const testConnection = async () => {
  try {
    console.log(`🔍 Testing connection to: ${API_BASE_URL}/health`);
    const response = await api.get("/health");

    console.log("✅ Connection test successful");
    return {
      success: true,
      data: response.data,
      url: `${API_BASE_URL}/health`,
      status: response.status,
    };
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
      status: error.response?.status || "NETWORK_ERROR",
      url: `${API_BASE_URL}/health`,
    };
  }
};

// ✅ TEST DE REGISTRO DIRECTO MEJORADO
export const testRegisterEndpoint = async () => {
  try {
    const testData = {
      name: "Test User Direct",
      email: `test_direct_${Date.now()}@example.com`,
      password: "test123456",
    };

    console.log("🧪 Testing register endpoint with:", testData.email);
    const response = await api.post("/auth/register", testData);

    console.log("✅ Register test successful");
    return {
      success: true,
      data: response.data,
      message: "Registro directo exitoso",
    };
  } catch (error) {
    console.error("❌ Register test failed:", error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
      status: error.response?.status,
    };
  }
};

// ✅ TEST DE AUTENTICACIÓN COMPLETA
export const testCompleteAuthFlow = async () => {
  console.log("🧪 Starting complete auth flow test...");

  const results = {
    connection: false,
    register: false,
    login: false,
    protected: false,
    refresh: false,
  };

  try {
    // 1. Test conexión
    const connectionTest = await testConnection();
    results.connection = connectionTest.success;

    if (!results.connection) {
      throw new Error("Connection test failed");
    }

    // 2. Test registro
    const registerTest = await testRegisterEndpoint();
    results.register = registerTest.success;

    if (!results.register) {
      throw new Error("Register test failed");
    }

    // 3. Test login
    const loginData = {
      email: registerTest.data?.email || "test@example.com",
      password: "test123456",
    };

    console.log("🔐 Testing login...");
    const loginResponse = await api.post("/auth/login", loginData);
    results.login = loginResponse.status === 200;

    if (!results.login) {
      throw new Error("Login test failed");
    }

    const tokens = loginResponse.data;
    console.log("✅ Login successful, tokens obtained");

    // 4. Test endpoint protegido
    console.log("🛡️ Testing protected endpoint...");
    const meResponse = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });
    results.protected = meResponse.status === 200;

    // 5. Test refresh token
    console.log("🔄 Testing refresh token...");
    const refreshResponse = await api.post(
      "/auth/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${tokens.refresh_token}`,
        },
      }
    );
    results.refresh = refreshResponse.status === 200;

    console.log("✅ Complete auth flow test finished");
    console.log("📊 Results:", results);

    return {
      success: Object.values(results).every(Boolean),
      results,
      message: "Auth flow test completed",
    };
  } catch (error) {
    console.error("❌ Auth flow test failed:", error);
    return {
      success: false,
      results,
      error: error.message,
    };
  }
};

// ✅ FUNCIÓN PARA OBTENER ESTADO DE TOKENS
export const getTokenStatus = async () => {
  try {
    const tokens = await getTokensFromStorage();
    const isExpiring = await isTokenExpiringSoon();

    return {
      hasTokens: !!(tokens.accessToken && tokens.refreshToken),
      accessToken: tokens.accessToken
        ? `${tokens.accessToken.substring(0, 20)}...`
        : null,
      refreshToken: tokens.refreshToken
        ? `${tokens.refreshToken.substring(0, 20)}...`
        : null,
      isExpiring,
      expiresIn: tokens.expiresIn,
      loginTimestamp: tokens.loginTimestamp,
    };
  } catch (error) {
    console.error("Error getting token status:", error);
    return {
      hasTokens: false,
      error: error.message,
    };
  }
};

export default api;
