"use client"

import { createContext, useContext, useEffect, useState } from "react"
import * as SecureStore from "expo-secure-store"
import { authService } from "../services/authService"

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStoredAuth()
  }, [])

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("access_token")
      if (storedToken) {
        setToken(storedToken)
        authService.setAuthToken(storedToken)
        await loadUser()
      }
    } catch (error) {
      console.error("Error loading stored auth:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUser = async () => {
    try {
      const userData = await authService.getMe()
      setUser(userData)
    } catch (error) {
      console.error("Error loading user:", error)
      await logout()
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      const { access_token } = response

      await SecureStore.setItemAsync("access_token", access_token)
      setToken(access_token)
      authService.setAuthToken(access_token)

      await loadUser()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Error al iniciar sesión",
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      await authService.register(name, email, password)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Error al registrarse",
      }
    }
  }

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("access_token")
      setToken(null)
      setUser(null)
      authService.setAuthToken(null)
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
