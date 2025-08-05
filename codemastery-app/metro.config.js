const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Configuración simplificada sin optimizaciones para Hermes
config.resolver.assetExts.push("lottie", "json");

// Configuración básica del transformer
config.transformer = {
  ...config.transformer,
  // Remover configuraciones específicas de Hermes por ahora
  minifierConfig: {
    // Configuración mínima para evitar problemas
  },
};

// Configuración básica del serializer
config.serializer = {
  ...config.serializer,
};

module.exports = config;
