import { useState, useEffect } from "react";
import { Dimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const useResponsive = () => {
  // Valores por defecto seguros
  const [screenData, setScreenData] = useState({
    width: 375,
    height: 667,
  });

  const insets = useSafeAreaInsets() || {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };

  useEffect(() => {
    const updateDimensions = (result) => {
      if (result?.window) {
        setScreenData(result.window);
      }
    };

    // Obtener dimensiones iniciales de forma segura
    try {
      const initial = Dimensions.get("window");
      setScreenData(initial);
    } catch (error) {
      console.warn("Error getting dimensions:", error);
    }

    // Listener para cambios
    const subscription = Dimensions.addEventListener(
      "change",
      updateDimensions
    );

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);

  // Cálculos simples y seguros
  const isTablet = screenData.width >= 768;
  const isAndroid = Platform.OS === "android";
  const orientation =
    screenData.width > screenData.height ? "landscape" : "portrait";

  // Spacing fijo y simple
  const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  };

  const fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  };

  // Sombras simplificadas y siempre definidas
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

  // Safe area simplificado
  const safeAreaStyles = {
    safeContainer: {
      paddingTop: Math.max(insets.top || 0, 20),
      paddingBottom: Math.max(insets.bottom || 0, 8),
      paddingHorizontal: Math.max(insets.left || 0, insets.right || 0, 16),
    },
  };

  // Utils seguros que siempre retornan valores válidos
  const utils = {
    getSafeStyle: (type = "safeContainer") => {
      return safeAreaStyles[type] || safeAreaStyles.safeContainer;
    },
    getShadow: (type = "shadow") => {
      return platformStyles[type] || platformStyles.shadow;
    },
    getSpacing: (size) => spacing[size] || spacing.md,
    getFontSize: (size) => fontSize[size] || fontSize.md,
  };

  return {
    // Dimensiones básicas
    width: screenData.width,
    height: screenData.height,
    orientation,
    isTablet,
    isAndroid,
    isIOS: Platform.OS === "ios",

    // Valores responsivos
    spacing,
    fontSize,

    // Estilos seguros
    platformStyles,
    safeAreaStyles,
    insets,

    // Utilidades seguras
    utils,
  };
};

export default useResponsive;
