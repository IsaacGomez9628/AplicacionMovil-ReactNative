// 🎨 Paleta de colores oscuros
export const darkColors = {
  // Backgrounds principales
  background: "#121212",
  surface: "#1e1e1e",
  surfaceVariant: "#2c2c2c",
  surfaceContainer: "#242424",

  // Backgrounds secundarios
  cardBackground: "#1e1e1e",
  inputBackground: "#2c2c2c",
  modalBackground: "#1a1a1a",

  // Textos
  onBackground: "#FFFFFF",
  onSurface: "#FFFFFF",
  onSurfaceVariant: "#E0E0E0",
  textSecondary: "#B0B0B0",
  textTertiary: "#808080",

  // Colores de acento
  primary: "#6366f1",
  primaryContainer: "#4f46e5",
  secondary: "#8b5cf6",
  tertiary: "#06b6d4",

  // Estados
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",

  // Bordes y divisores
  outline: "#404040",
  outlineVariant: "#2c2c2c",
  border: "#333333",

  // Overlays
  overlay: "rgba(0, 0, 0, 0.7)",
  backdrop: "rgba(0, 0, 0, 0.5)",

  // StatusBar
  statusBarBackground: "#121212",
  statusBarContent: "light-content",
}

// 🎨 Tema oscuro para React Native Paper
export const darkTheme = {
  colors: {
    ...darkColors,
    primary: darkColors.primary,
    secondary: darkColors.secondary,
    tertiary: darkColors.tertiary,
    surface: darkColors.surface,
    surfaceVariant: darkColors.surfaceVariant,
    background: darkColors.background,
    error: darkColors.error,
    onSurface: darkColors.onSurface,
    onBackground: darkColors.onBackground,
    outline: darkColors.outline,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
}

// 🎨 Estilos comunes para pantallas de autenticación
export const authScreenStyles = {
  // Container principal
  container: {
    flex: 1,
    backgroundColor: darkColors.background,
  },

  // ScrollView content
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    minHeight: "100%",
  },

  // Content wrapper
  content: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  // Títulos principales
  title: {
    color: darkColors.onBackground,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
  },

  // Subtítulos
  subtitle: {
    color: darkColors.textSecondary,
    textAlign: "center",
    opacity: 0.9,
  },

  // Cards/formularios
  card: {
    backgroundColor: darkColors.cardBackground,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  // Inputs
  input: {
    backgroundColor: darkColors.inputBackground,
    color: darkColors.onSurface,
  },

  // Botones principales
  primaryButton: {
    backgroundColor: darkColors.primary,
    borderRadius: 12,
    elevation: 2,
  },

  // Botones secundarios
  secondaryButton: {
    borderColor: darkColors.outline,
    borderWidth: 1,
    borderRadius: 12,
  },

  // Texto de error
  errorText: {
    color: darkColors.error,
  },

  // Divisores
  divider: {
    backgroundColor: darkColors.outline,
  },

  // Links/botones de texto
  linkButton: {
    color: darkColors.primary,
  },
}

// 🎨 Función para obtener estilos responsivos de auth
export const getAuthStyles = (responsive) => {
  const { spacing, fontSize, isTablet, utils } = responsive

  return {
    container: [authScreenStyles.container, utils.getSafeStyle("container")],

    scrollContent: [
      authScreenStyles.scrollContent,
      {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
      },
    ],

    content: [
      authScreenStyles.content,
      {
        maxWidth: isTablet ? 400 : "100%",
        width: "100%",
      },
    ],

    title: [
      authScreenStyles.title,
      {
        fontSize: utils.getFontSize(isTablet ? "xxl" : "xl"),
        marginBottom: utils.getSpacing("sm"),
      },
    ],

    subtitle: [
      authScreenStyles.subtitle,
      {
        fontSize: utils.getFontSize("md"),
        marginBottom: utils.getSpacing("xl"),
      },
    ],

    card: [
      authScreenStyles.card,
      utils.getShadow("cardShadow"),
      {
        padding: spacing.lg,
        marginBottom: spacing.md,
      },
    ],

    input: [
      authScreenStyles.input,
      {
        marginBottom: spacing.sm,
      },
    ],

    primaryButton: [
      authScreenStyles.primaryButton,
      {
        marginTop: spacing.md,
        paddingVertical: spacing.sm,
      },
    ],

    errorText: [
      authScreenStyles.errorText,
      {
        fontSize: utils.getFontSize("xs"),
        marginBottom: utils.getSpacing("sm"),
      },
    ],

    divider: [
      authScreenStyles.divider,
      {
        marginVertical: utils.getSpacing("lg"),
      },
    ],
  }
}
