import axios from "axios";
import { Platform, Alert } from "react-native";
import * as Device from "expo-device";
import * as Network from "expo-network";

// Función para obtener la IP de la red local
const getLocalIP = async () => {
  try {
    const ip = await Network.getIpAddressAsync();
    console.log("Device IP:", ip);
    return ip;
  } catch (error) {
    console.error("Error getting IP:", error);
    return null;
  }
};

// Detectar la URL correcta según el entorno
const getBaseURL = () => {
  // Si estás usando un dispositivo físico, cambia esta IP por la de tu computadora
  const YOUR_COMPUTER_IP = "192.168.56.1"; // ⚠️ CAMBIA ESTO POR TU IP LOCAL

  if (__DEV__) {
    if (Platform.OS === "android") {
      if (Device.isDevice) {
        // Dispositivo Android físico
        console.log(
          `Using Android Device URL: http://${YOUR_COMPUTER_IP}:8000`
        );
        return `http://${YOUR_COMPUTER_IP}:8000`;
      } else {
        // Emulador Android
        console.log("Using Android Emulator URL: http://10.0.2.2:8000");
        return "http://10.0.2.2:8000";
      }
    } else if (Platform.OS === "ios") {
      if (Device.isDevice) {
        // Dispositivo iOS físico
        console.log(`Using iOS Device URL: http://${YOUR_COMPUTER_IP}:8000`);
        return `http://${YOUR_COMPUTER_IP}:8000`;
      } else {
        // Simulador iOS
        console.log("Using iOS Simulator URL: http://localhost:8000");
        return "http://localhost:8000";
      }
    } else {
      // Web o otros
      console.log("Using Web URL: http://localhost:8000");
      return "http://localhost:8000";
    }
  } else {
    // Producción
    return "https://tu-api-produccion.com";
  }
};

const API_BASE_URL = getBaseURL();

// Crear instancia de axios con configuración completa
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor para logging de requests
api.interceptors.request.use(
  (config) => {
    console.log("🚀 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data,
    });

    // Asegurar que el Content-Type esté presente
    if (config.method === "post" || config.method === "put") {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor para logging de responses
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    // Manejo específico de errores
    if (error.code === "ECONNABORTED") {
      Alert.alert(
        "Timeout",
        "La solicitud tardó demasiado. Verifica tu conexión."
      );
    } else if (error.message === "Network Error") {
      Alert.alert(
        "Error de Conexión",
        `No se puede conectar al servidor.\nURL: ${API_BASE_URL}\n\nVerifica:\n1. Que el servidor esté corriendo\n2. Tu conexión a internet\n3. La IP configurada`
      );
    } else if (error.response?.status === 401) {
      console.log("Token expired or invalid");
      // Aquí podrías limpiar el token y redirigir al login
    } else if (error.response?.status === 422) {
      // Error de validación
      const details = error.response.data.detail;
      if (Array.isArray(details)) {
        const messages = details.map((d) => `${d.loc[1]}: ${d.msg}`).join("\n");
        Alert.alert("Error de Validación", messages);
      }
    }

    return Promise.reject(error);
  }
);

// Función de prueba de conexión
export const testConnection = async () => {
  try {
    console.log(`Testing connection to: ${API_BASE_URL}`);
    const response = await api.get("/health");
    console.log("Connection test successful:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Connection test failed:", error);
    return { success: false, error: error.message };
  }
};

// Función para probar el endpoint de registro directamente
export const testRegisterEndpoint = async () => {
  try {
    console.log("Testing register endpoint...");
    const testData = {
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "test123456",
    };

    const response = await api.post("/auth/register", testData);
    console.log("Register test successful:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      "Register test failed:",
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
};

export default api;
