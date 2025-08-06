// ✅ ARCHIVO CORREGIDO: src/services/api.js
import axios from "axios";
import { Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";

// ✅ CONFIGURACIÓN DE URL BASE CORREGIDA
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

// ✅ CONFIGURACIÓN AXIOS CON REFRESH TOKEN AUTOMÁTICO
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

// ✅ SISTEMA DE REFRESH TOKEN AUTOMÁTICO
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

// ✅ INTERCEPTOR DE REQUEST
api.interceptors.request.use(
  async (config) => {
    console.log("🚀 API Request:", {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? "[HIDDEN]" : "None",
      },
    });

    // Agregar token automáticamente si existe
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token from storage:", error);
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// ✅ INTERCEPTOR DE RESPONSE CON REFRESH AUTOMÁTICO
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error("❌ API Error Details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
    });

    // ✅ MANEJO AUTOMÁTICO DE TOKEN EXPIRADO
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya se está refrescando, poner en cola
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
        const refreshToken = await AsyncStorage.getItem("refresh_token");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        console.log("🔄 Attempting token refresh...");

        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        const { access_token, refresh_token } = refreshResponse.data;

        // Guardar nuevos tokens
        await AsyncStorage.setItem("access_token", access_token);
        await AsyncStorage.setItem("refresh_token", refresh_token);

        console.log("✅ Token refreshed successfully");

        // Actualizar header por defecto
        api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        processQueue(null, access_token);
        isRefreshing = false;

        // Reintentar la petición original
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);

        processQueue(refreshError, null);
        isRefreshing = false;

        // Limpiar tokens y notificar logout
        await AsyncStorage.multiRemove([
          "access_token",
          "refresh_token",
          "user",
        ]);

        // Emitir evento para que AuthContext maneje el logout
        if (global.authContext) {
          global.authContext.handleTokenExpired();
        }

        return Promise.reject(refreshError);
      }
    }

    // Otros errores de red
    if (error.code === "ECONNABORTED") {
      Alert.alert(
        "Timeout",
        "La solicitud tardó demasiado. Verifica tu conexión."
      );
    } else if (error.message === "Network Error") {
      Alert.alert(
        "Error de Conexión",
        `No se puede conectar al servidor.\n\nURL: ${API_BASE_URL}\n\nVerifica que el servidor esté corriendo y tu conexión sea estable.`
      );
    }

    return Promise.reject(error);
  }
);

// ✅ FUNCIONES DE UTILIDAD PARA TOKENS
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const clearAuthToken = () => {
  delete api.defaults.headers.common["Authorization"];
};

// ✅ TEST DE CONEXIÓN
export const testConnection = async () => {
  try {
    console.log(`🔍 Testing connection to: ${API_BASE_URL}`);
    const response = await api.get("/health");
    return {
      success: true,
      data: response.data,
      url: `${API_BASE_URL}/health`,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
      status: error.response?.status || "NETWORK_ERROR",
      url: `${API_BASE_URL}/health`,
    };
  }
};

export default api;
