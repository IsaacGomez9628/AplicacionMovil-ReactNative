// ✅ CONFIGURACIÓN ACTUALIZADA PARA PUERTO 8001
// Archivo: src/services/api.js

import axios from "axios";
import { Platform, Alert } from "react-native";
import * as Device from "expo-device";
import * as Network from "expo-network";

// ✅ CONFIGURACIÓN MEJORADA DE URL BASE CON PUERTO 8001
const getBaseURL = () => {
  // ⚠️ ACTUALIZAR ESTA IP CON TU IP LOCAL
  const YOUR_COMPUTER_IP = "192.168.1.8"; // ← Tu IP detectada

  if (__DEV__) {
    if (Platform.OS === "android") {
      if (Device.isDevice) {
        // Dispositivo Android físico
        console.log(`🤖 Android Device URL: http://${YOUR_COMPUTER_IP}:8001`);
        return `http://${YOUR_COMPUTER_IP}:8001`;
      } else {
        // Emulador Android (necesita IP especial)
        console.log("🤖 Android Emulator URL: http://10.0.2.2:8001");
        return "http://10.0.2.2:8001";
      }
    } else if (Platform.OS === "ios") {
      if (Device.isDevice) {
        // Dispositivo iOS físico
        console.log(`📱 iOS Device URL: http://${YOUR_COMPUTER_IP}:8001`);
        return `http://${YOUR_COMPUTER_IP}:8001`;
      } else {
        // Simulador iOS
        console.log("📱 iOS Simulator URL: http://localhost:8001");
        return "http://localhost:8001";
      }
    } else {
      // Web
      console.log("🌐 Web URL: http://localhost:8001");
      return "http://localhost:8001";
    }
  } else {
    // Producción
    return "https://tu-api-produccion.com";
  }
};

const API_BASE_URL = getBaseURL();

// ✅ CONFIGURACIÓN AXIOS
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  },
});

// ✅ INTERCEPTORS (sin cambios, solo logging mejorado)
api.interceptors.request.use(
  (config) => {
    console.log("🚀 API Request:", {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? "[HIDDEN]" : "None",
      },
      data: config.data
        ? typeof config.data === "object"
          ? JSON.stringify(config.data)
          : config.data
        : "None",
    });

    if (
      config.method === "post" ||
      config.method === "put" ||
      config.method === "patch"
    ) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

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
  (error) => {
    console.error("❌ API Error Details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
    });

    if (error.code === "ECONNABORTED") {
      Alert.alert(
        "Timeout",
        "La solicitud tardó demasiado. Verifica tu conexión."
      );
    } else if (
      error.message === "Network Error" ||
      error.code === "NETWORK_ERROR"
    ) {
      Alert.alert(
        "Error de Conexión",
        `No se puede conectar al servidor.\n\n` +
          `URL: ${API_BASE_URL}\n\n` +
          `Pasos para solucionar:\n` +
          `1. Verificar que FastAPI esté corriendo:\n` +
          `   uvicorn main:app --host 0.0.0.0 --port 8001\n\n` +
          `2. Verificar firewall de Windows\n\n` +
          `3. Comprobar que ambos dispositivos estén en la misma red WiFi\n\n` +
          `4. IP configurada: ${API_BASE_URL.split("//")[1].split(":")[0]}`
      );
    } else if (error.response?.status === 401) {
      console.log("🔐 Token expired or invalid");
    } else if (error.response?.status === 422) {
      const details = error.response.data.detail;
      if (Array.isArray(details)) {
        const messages = details
          .map((d) => `${d.loc?.[1] || "field"}: ${d.msg}`)
          .join("\n");
        console.error("Validation errors:", messages);
      }
    }

    return Promise.reject(error);
  }
);

// ✅ FUNCIÓN DE TEST DE CONEXIÓN ACTUALIZADA
export const testConnection = async () => {
  try {
    console.log(`🔍 Testing connection to: ${API_BASE_URL}`);
    console.log(
      `🌐 Platform: ${Platform.OS}, Device: ${
        Device.isDevice ? "Physical" : "Simulator"
      }`
    );

    const response = await api.get("/health");

    console.log("✅ Connection test successful:", response.data);
    return {
      success: true,
      data: response.data,
      url: `${API_BASE_URL}/health`,
      status: response.status,
    };
  } catch (error) {
    console.error("❌ Connection test failed:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: `${API_BASE_URL}/health`,
    });

    return {
      success: false,
      error: error.response?.data?.detail || error.message,
      status: error.response?.status || "NETWORK_ERROR",
      url: `${API_BASE_URL}/health`,
    };
  }
};

// ✅ TESTS ESPECÍFICOS ACTUALIZADOS
export const testRegisterEndpoint = async () => {
  try {
    console.log("🧪 Testing register endpoint...");
    const testData = {
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "test123456",
    };

    console.log("📤 Test data:", {
      ...testData,
      password: "***hidden***",
    });

    const response = await api.post("/auth/register", testData);

    console.log("✅ Register test successful:", response.data);
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error("❌ Register test failed:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return {
      success: false,
      error: error.response?.data?.detail || error.message,
      status: error.response?.status || "UNKNOWN",
      details: error.response?.data,
    };
  }
};

export default api;
