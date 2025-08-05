import { MD3LightTheme } from "react-native-paper"
import { Platform } from "react-native"

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#6366f1",
    secondary: "#8b5cf6",
    tertiary: "#06b6d4",
    surface: "#ffffff",
    surfaceVariant: "#f8fafc",
    background: "#f8fafc",
    error: "#ef4444",
    success: "#10b981",
    onSurface: "#1f2937",
    onBackground: "#1f2937",
  },
  // Responsive spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  // Platform-specific adjustments
  elevation:
    Platform.OS === "android"
      ? {
          level0: 0,
          level1: 1,
          level2: 3,
          level3: 6,
          level4: 8,
          level5: 12,
        }
      : {},
  // Typography adjustments
  fonts: {
    ...MD3LightTheme.fonts,
    bodySmall: {
      ...MD3LightTheme.fonts.bodySmall,
      lineHeight: 16,
    },
    bodyMedium: {
      ...MD3LightTheme.fonts.bodyMedium,
      lineHeight: 20,
    },
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      lineHeight: 24,
    },
  },
}

// Responsive breakpoints
export const breakpoints = {
  small: 375,
  medium: 768,
  large: 1024,
}

// Platform-specific styles
export const platformStyles = {
  shadow:
    Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }
      : {
          elevation: 5,
        },

  cardShadow:
    Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
        }
      : {
          elevation: 3,
        },
}
