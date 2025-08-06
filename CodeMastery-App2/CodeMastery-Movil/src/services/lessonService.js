// src/services/lessonService.js
import api from "./api";

export const lessonService = {
  // Obtener una lección específica
  getLesson: async (lessonId) => {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data;
  },

  // Enviar código de ejercicio
  submitCode: async (lessonId, codeSubmitted) => {
    const response = await api.post(`/lessons/${lessonId}/enviar`, {
      code_submitted: codeSubmitted,
    });
    return response.data;
  },

  // Obtener último intento de una lección específica
  getLastAttempt: async (lessonId) => {
    try {
      const response = await api.get(`/lessons/${lessonId}/ultimo-intento`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No hay intentos previos
      }
      throw error;
    }
  },

  // ✅ CORREGIDO: Obtener todos los intentos del usuario (sin pasar user_id)
  getUserAttempts: async () => {
    try {
      // El backend obtiene el user_id del token JWT, no necesitamos pasarlo
      const response = await api.get("/lessons/intentos");
      return response.data;
    } catch (error) {
      console.error(
        "Error getting user attempts:",
        error.response?.data || error
      );
      // Si hay error, retornamos un array vacío para evitar crashes
      return [];
    }
  },

  // Eliminar un intento
  deleteAttempt: async (attemptId) => {
    const response = await api.delete(`/lessons/intentos/${attemptId}`);
    return response.data;
  },
};
