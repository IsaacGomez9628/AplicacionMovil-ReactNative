import { useState, useEffect, useCallback } from "react";
import { Dimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const useResponsive = () => {
  const [screenData, setScreenData] = useState(() => {
    try {
      return Dimensions.get("window");
    } catch (error) {
      console.warn("Error getting initial dimensions:", error);
      return { width: 375, height: 667 };
    }
  });

  const [orientation, setOrientation] = useState(() =>
    screenData.width > screenData.height ? "landscape" : "portrait"
  );

  const insets = useSafeAreaInsets();

  const updateDimensions = useCallback((result) => {
    try {
      if (result?.window) {
        setScreenData(result.window);
        setOrientation(
          result.window.width > result.window.height ? "landscape" : "portrait"
        );
      }
    } catch (error) {
      console.warn("Error updating dimensions:", error);
    }
  }, []);

  useEffect(() => {
    let subscription = null;

    try {
      subscription = Dimensions.addEventListener("change", updateDimensions);
    } catch (error) {
      console.warn("Error setting up dimensions listener:", error);
    }

    return () => {
      try {
        if (subscription?.remove) {
          subscription.remove();
        }
      } catch (error) {
        console.warn("Error removing dimensions listener:", error);
      }
    };
  }, [updateDimensions]);

  // Safe calculations
  const isTablet = screenData.width >= 768;
  const isSmallScreen = screenData.width < 375;
  const isLargeScreen = screenData.width > 414;
  const isAndroid = Platform.OS === "android";
  const isIOS = Platform.OS === "ios";

  // Responsive values with error handling
  const getResponsiveValue = useCallback(
    (small, medium, large) => {
      try {
        if (isSmallScreen) return small;
        if (isLargeScreen || isTablet) return large;
        return medium;
      } catch (error) {
        console.warn("Error in getResponsiveValue:", error);
        return medium;
      }
    },
    [isSmallScreen, isLargeScreen, isTablet]
  );

  const spacing = {
    xs: getResponsiveValue(4, 6, 8),
    sm: getResponsiveValue(8, 12, 16),
    md: getResponsiveValue(12, 16, 20),
    lg: getResponsiveValue(16, 20, 24),
    xl: getResponsiveValue(20, 24, 32),
  };

  const fontSize = {
    xs: getResponsiveValue(10, 12, 14),
    sm: getResponsiveValue(12, 14, 16),
    md: getResponsiveValue(14, 16, 18),
    lg: getResponsiveValue(16, 18, 20),
    xl: getResponsiveValue(18, 20, 24),
    xxl: getResponsiveValue(20, 24, 28),
  };

  // Platform-specific styles with error handling
  const platformStyles = {
    shadow:
      Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        android: { elevation: 5 },
        default: {},
      }) || {},

    cardShadow:
      Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
        },
        android: { elevation: 3 },
        default: {},
      }) || {},

    lightShadow:
      Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.18,
          shadowRadius: 1.0,
        },
        android: { elevation: 1 },
        default: {},
      }) || {},
  };

  // Safe area styles with error handling
  const safeAreaStyles = {
    paddingTop: Platform.select({
      ios: Math.max(insets?.top || 0, 20),
      android: (insets?.top || 0) + spacing.sm,
      default: spacing.lg,
    }),

    paddingBottom: Platform.select({
      ios: Math.max(insets?.bottom || 0, spacing.sm),
      android: insets?.bottom || 0 || spacing.sm,
      default: spacing.sm,
    }),

    paddingHorizontal: Math.max(
      insets?.left || 0,
      insets?.right || 0,
      spacing.md
    ),

    safeContainer: {
      paddingTop: Platform.select({
        ios: Math.max(insets?.top || 0, 20),
        android: (insets?.top || 0) + spacing.sm,
        default: spacing.lg,
      }),
      paddingBottom: Platform.select({
        ios: Math.max(insets?.bottom || 0, spacing.sm),
        android: insets?.bottom || 0 || spacing.sm,
        default: spacing.sm,
      }),
      paddingHorizontal: Math.max(
        insets?.left || 0,
        insets?.right || 0,
        spacing.md
      ),
    },

    headerContainer: {
      paddingTop: Platform.select({
        ios: Math.max(insets?.top || 0, 20),
        android: (insets?.top || 0) + spacing.sm,
        default: spacing.lg,
      }),
      paddingHorizontal: Math.max(
        insets?.left || 0,
        insets?.right || 0,
        spacing.md
      ),
    },

    contentContainer: {
      paddingBottom: Platform.select({
        ios: Math.max(insets?.bottom || 0, spacing.sm),
        android: insets?.bottom || 0 || spacing.sm,
        default: spacing.sm,
      }),
      paddingHorizontal: Math.max(
        insets?.left || 0,
        insets?.right || 0,
        spacing.md
      ),
    },
  };

  const utils = {
    getSafeStyle: (type = "container") =>
      safeAreaStyles[type] || safeAreaStyles.safeContainer,
    getShadow: (type = "shadow") =>
      platformStyles[type] || platformStyles.shadow,
    getSpacing: (size) => spacing[size] || spacing.md,
    getFontSize: (size) => fontSize[size] || fontSize.md,
  };

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

    // Estilos de plataforma
    platformStyles,

    // Safe area integration
    safeAreaStyles,
    insets: insets || {},

    // Utilidades
    utils,
  };
};

export default useResponsive;
