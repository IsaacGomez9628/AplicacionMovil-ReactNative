const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Configuración optimizada para Hermes
config.resolver.assetExts.push(
  // Lottie animations
  "lottie",
  "json"
);

// Configuración para mejorar la estabilidad con Hermes
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_keys: true,
      wrap_iife: true,
    },
    sourceMap: {
      includeSources: false,
    },
    toplevel: false,
    compress: {
      reduce_funcs: false,
    },
  },
};

// Optimización de memoria para iOS
config.serializer = {
  ...config.serializer,
  customSerializer: null,
};

module.exports = config;
