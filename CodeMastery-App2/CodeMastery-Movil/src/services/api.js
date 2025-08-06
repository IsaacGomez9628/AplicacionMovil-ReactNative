import { Platform } from "react-native";

// Detectar si estamos en desarrollo o producción
const getDevelopmentUrl = () => {
  if (Platform.OS === "android") {
    // Para Android Emulator
    return "http://10.0.2.2:8000";
  } else if (Platform.OS === "ios") {
    // Para iOS Simulator
    return "http://localhost:8000";
  } else {
    // Para dispositivos físicos, usa tu IP local
    // Ejecuta: ipconfig (Windows) o ifconfig (Mac/Linux) para obtener tu IP
    return "http://192.168.1.100:8000"; // Reemplaza con tu IP local
  }
};

const API_BASE_URL = __DEV__
  ? getDevelopmentUrl()
  : "https://tu-api-produccion.com"; // URL de producción

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Timeout de 10 segundos
});

// Interceptor mejorado para manejar errores de red
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
      console.error("Error de conexión:", API_BASE_URL);
      return Promise.reject(
        new Error("No se puede conectar al servidor. Verifica tu conexión.")
      );
    }

    if (error.response?.status === 401) {
      console.log("Token expired or invalid");
      // Aquí podrías redirigir al login o renovar el token
    }

    return Promise.reject(error);
  }
);
