import axios from "axios";

const API_BASE_URL = "http://localhost:8000"; // Cambia por tu URL de API

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      console.log("Token expired or invalid");
    }
    return Promise.reject(error);
  }
);
