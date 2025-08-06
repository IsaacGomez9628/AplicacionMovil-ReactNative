// ✅ ARCHIVO CORREGIDO: src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services/authService"; // ✅ IMPORT CORREGIDO
import { Alert } from "react-native";

// Estado inicial
const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  tokenExpiring: false, // ✅ NUEVO: Flag para token próximo a expirar
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_ERROR: "LOGIN_ERROR",
  LOGOUT: "LOGOUT",
  SET_USER: "SET_USER",
  CLEAR_ERROR: "CLEAR_ERROR",
  TOKEN_REFRESH_SUCCESS: "TOKEN_REFRESH_SUCCESS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_EXPIRING_SOON: "TOKEN_EXPIRING_SOON", // ✅ NUEVO
  RESET_STATE: "RESET_STATE", // ✅ NUEVO
};

// ✅ REDUCER MEJORADO
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        loading: false,
        error: null,
        tokenExpiring: false,
      };

    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
        tokenExpiring: false,
      };

    case AUTH_ACTIONS.LOGOUT:
    case AUTH_ACTIONS.RESET_STATE:
      return {
        ...initialState,
        loading: false,
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.TOKEN_REFRESH_SUCCESS:
      return {
        ...state,
        error: null,
        tokenExpiring: false,
      };

    case AUTH_ACTIONS.TOKEN_EXPIRED:
      return {
        ...initialState,
        loading: false,
        error: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      };

    case AUTH_ACTIONS.TOKEN_EXPIRING_SOON:
      return {
        ...state,
        tokenExpiring: true,
      };

    default:
      return state;
  }
}

// Context
const AuthContext = createContext();

// ✅ PROVIDER MEJORADO CON REFRESH AUTOMÁTICO
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ✅ Manejar token expirado desde el interceptor
  const handleTokenExpired = async () => {
    console.log("🔐 Token expired, logging out user");

    try {
      // Limpiar almacenamiento
      await AsyncStorage.multiRemove([
        "access_token",
        "refresh_token",
        "token_type",
        "token_expires_in",
        "login_timestamp",
        "user",
      ]);
    } catch (error) {
      console.error("Error clearing storage on token expiry:", error);
    }

    dispatch({ type: AUTH_ACTIONS.TOKEN_EXPIRED });

    Alert.alert(
      "Sesión Expirada",
      "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      [
        {
          text: "OK",
          onPress: () => dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR }),
        },
      ]
    );
  };

  // ✅ Registrar el contexto globalmente para el interceptor
  useEffect(() => {
    global.authContext = { handleTokenExpired };

    return () => {
      delete global.authContext;
    };
  }, []);

  // ✅ VERIFICAR AUTENTICACIÓN AL INICIAR - MEJORADO
  useEffect(() => {
    checkAuthState();
  }, []);

  // ✅ MONITOREO AUTOMÁTICO DE EXPIRACIÓN DE TOKEN
  useEffect(() => {
    let intervalId;

    if (state.isAuthenticated) {
      // Verificar cada minuto si el token está próximo a expirar
      intervalId = setInterval(async () => {
        try {
          const isExpiring = await authService.isTokenExpiringSoon();

          if (isExpiring && !state.tokenExpiring) {
            console.log(
              "⚠️ Token expiring soon, attempting automatic refresh..."
            );
            dispatch({ type: AUTH_ACTIONS.TOKEN_EXPIRING_SOON });

            try {
              await authService.refreshToken();
              dispatch({ type: AUTH_ACTIONS.TOKEN_REFRESH_SUCCESS });
              console.log("✅ Automatic token refresh successful");
            } catch (refreshError) {
              console.error("❌ Automatic token refresh failed:", refreshError);
              handleTokenExpired();
            }
          }
        } catch (error) {
          console.error("Error checking token expiry:", error);
        }
      }, 60000); // Verificar cada minuto
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.isAuthenticated, state.tokenExpiring]);

  const checkAuthState = async () => {
    console.log("🔍 Checking auth state...");
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

    try {
      // Verificar si hay tokens válidos
      const hasToken = await authService.hasValidToken();

      if (!hasToken) {
        console.log("❌ No valid tokens found");
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        return;
      }

      // ✅ MEJORADO: Verificar si el token está próximo a expirar
      const isExpiring = await authService.isTokenExpiringSoon();

      if (isExpiring) {
        console.log("🔄 Token expiring soon, attempting refresh...");
        try {
          await authService.refreshToken();
          console.log("✅ Token refreshed successfully");
        } catch (refreshError) {
          console.error(
            "❌ Token refresh failed during startup:",
            refreshError
          );
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
          return;
        }
      }

      // Intentar obtener información del usuario
      const userData = await authService.getMe();

      // Guardar usuario en AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      dispatch({
        type: AUTH_ACTIONS.SET_USER,
        payload: userData,
      });

      console.log("✅ Auth state restored:", userData.email);
    } catch (error) {
      console.error("❌ Auth check failed:", error);

      // Si falla, intentar refresh una vez más
      try {
        console.log("🔄 Attempting emergency token refresh...");
        await authService.refreshToken();

        // Reintentar obtener usuario
        const userData = await authService.getMe();
        await AsyncStorage.setItem("user", JSON.stringify(userData));

        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: userData,
        });

        console.log("✅ Emergency token refresh successful");
      } catch (emergencyError) {
        console.error("❌ Emergency token refresh failed:", emergencyError);
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    }
  };

  // ✅ LOGIN MEJORADO
  const login = async (email, password) => {
    console.log("🔐 Login attempt:", email);
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

    try {
      // Llamar al servicio de autenticación
      const authData = await authService.login(email, password);

      // Obtener información del usuario
      const userData = await authService.getMe();

      // Guardar usuario en AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: userData, tokens: authData },
      });

      console.log("✅ Login successful");
      return { success: true };
    } catch (error) {
      console.error("❌ Login failed:", error);

      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Error de autenticación";

      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  // ✅ REGISTER
  const register = async (name, email, password) => {
    console.log("📝 Register attempt:", email);
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

    try {
      const userData = await authService.register(name, email, password);

      console.log("✅ Registration successful");
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });

      return { success: true, user: userData };
    } catch (error) {
      console.error("❌ Registration failed:", error);

      const errorMessage = error.message || "Error de registro";

      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  // ✅ LOGOUT MEJORADO
  const logout = async () => {
    console.log("🔓 Logout attempt");
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

    try {
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.RESET_STATE });
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Aún así hacer logout local
      dispatch({ type: AUTH_ACTIONS.RESET_STATE });
    }
  };

  // ✅ REFRESH MANUAL
  const refreshTokens = async () => {
    console.log("🔄 Manual token refresh requested");

    try {
      await authService.refreshToken();
      dispatch({ type: AUTH_ACTIONS.TOKEN_REFRESH_SUCCESS });
      console.log("✅ Manual token refresh successful");
      return { success: true };
    } catch (error) {
      console.error("❌ Manual token refresh failed:", error);
      handleTokenExpired();
      return { success: false, error: error.message };
    }
  };

  // ✅ CLEAR ERROR
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // ✅ VERIFICAR SI EL TOKEN EXPIRA PRONTO
  const checkTokenExpiry = async () => {
    try {
      const isExpiring = await authService.isTokenExpiringSoon();
      return isExpiring;
    } catch (error) {
      console.error("Error checking token expiry:", error);
      return true;
    }
  };

  const contextValue = {
    // Estado
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    loading: state.loading,
    error: state.error,
    tokenExpiring: state.tokenExpiring, // ✅ NUEVO

    // Métodos
    login,
    register,
    logout,
    clearError,
    refreshTokens,
    checkTokenExpiry,
    handleTokenExpired,
    checkAuthState, // Para refresh manual del estado
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}

export default AuthContext;
