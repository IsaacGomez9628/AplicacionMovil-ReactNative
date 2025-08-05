"use client"

import { useState, useEffect } from "react"
import { Dimensions, Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const useResponsive = () => {
  const [screenData, setScreenData] = useState(Dimensions.get("window"))
  const [orientation, setOrientation] = useState(screenData.width > screenData.height ? "landscape" : "portrait")
  const insets = useSafeAreaInsets()

  useEffect(() => {
    const onChange = (result) => {
      setScreenData(result.window)
      setOrientation(result.window.width > result.window.height ? "landscape" : "portrait")
    }

    const subscription = Dimensions.addEventListener("change", onChange)
    return () => subscription?.remove()
  }, [])

  const isTablet = screenData.width >= 768
  const isSmallScreen = screenData.width < 375
  const isLargeScreen = screenData.width > 414
  const isAndroid = Platform.OS === "android"
  const isIOS = Platform.OS === "ios"

  // Responsive values
  const getResponsiveValue = (small, medium, large) => {
    if (isSmallScreen) return small
    if (isLargeScreen || isTablet) return large
    return medium
  }

  const spacing = {
    xs: getResponsiveValue(4, 6, 8),
    sm: getResponsiveValue(8, 12, 16),
    md: getResponsiveValue(12, 16, 20),
    lg: getResponsiveValue(16, 20, 24),
    xl: getResponsiveValue(20, 24, 32),
  }

  const fontSize = {
    xs: getResponsiveValue(10, 12, 14),
    sm: getResponsiveValue(12, 14, 16),
    md: getResponsiveValue(14, 16, 18),
    lg: getResponsiveValue(16, 18, 20),
    xl: getResponsiveValue(18, 20, 24),
    xxl: getResponsiveValue(20, 24, 28),
  }

  // ✅ SOLUCIÓN 1: Platform-specific styles siempre definidos
  const platformStyles = {
    shadow: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      default: {}, // ✅ Fallback para evitar undefined
    }),

    cardShadow: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),

    lightShadow: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  }

  // ✅ SOLUCIÓN 2: Safe area integration directa
  const safeAreaStyles = {
    // Padding top que respeta StatusBar y notch
    paddingTop: Platform.select({
      ios: Math.max(insets.top, 20), // Mínimo 20 para pantallas sin notch
      android: insets.top + spacing.sm, // StatusBar + spacing extra
      default: spacing.lg,
    }),

    // Padding bottom que respeta home indicator
    paddingBottom: Platform.select({
      ios: Math.max(insets.bottom, spacing.sm),
      android: insets.bottom || spacing.sm,
      default: spacing.sm,
    }),

    // Márgenes laterales seguros
    paddingHorizontal: Math.max(insets.left, insets.right, spacing.md),

    // Container principal seguro
    safeContainer: {
      paddingTop: Platform.select({
        ios: Math.max(insets.top, 20),
        android: insets.top + spacing.sm,
        default: spacing.lg,
      }),
      paddingBottom: Platform.select({
        ios: Math.max(insets.bottom, spacing.sm),
        android: insets.bottom || spacing.sm,
        default: spacing.sm,
      }),
      paddingHorizontal: Math.max(insets.left, insets.right, spacing.md),
    },

    // Solo top para headers
    headerContainer: {
      paddingTop: Platform.select({
        ios: Math.max(insets.top, 20),
        android: insets.top + spacing.sm,
        default: spacing.lg,
      }),
      paddingHorizontal: Math.max(insets.left, insets.right, spacing.md),
    },

    // Solo content sin top
    contentContainer: {
      paddingBottom: Platform.select({
        ios: Math.max(insets.bottom, spacing.sm),
        android: insets.bottom || spacing.sm,
        default: spacing.sm,
      }),
      paddingHorizontal: Math.max(insets.left, insets.right, spacing.md),
    },
  }

  // ✅ SOLUCIÓN 3: Breakpoints y utilidades
  const breakpoints = {
    small: 375,
    medium: 768,
    large: 1024,
  }

  const utils = {
    // Función para obtener estilos seguros
    getSafeStyle: (type = "container") => safeAreaStyles[type] || safeAreaStyles.safeContainer,

    // Función para obtener sombras
    getShadow: (type = "shadow") => platformStyles[type] || platformStyles.shadow,

    // Función para spacing responsivo
    getSpacing: (size) => spacing[size] || spacing.md,

    // Función para fontSize responsivo
    getFontSize: (size) => fontSize[size] || fontSize.md,
  }

  return {
    // Dimensiones y estado
    ...screenData,
    orientation,
    isTablet,
    isSmallScreen,
    isLargeScreen,
    isAndroid,
    isIOS,

    // Valores responsivos
    spacing,
    fontSize,
    getResponsiveValue,

    // Estilos de plataforma (siempre definidos)
    platformStyles,

    // Safe area integration
    safeAreaStyles,
    insets,

    // Utilidades
    breakpoints,
    utils,
  }
}

export default useResponsive
