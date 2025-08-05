module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "react" }]],
    plugins: [
      // Plugin para react-native-reanimated DEBE IR AL FINAL
      "react-native-reanimated/plugin",
    ],
    env: {
      production: {
        plugins: [
          // Optimizaciones para producción
          "transform-remove-console",
          "react-native-reanimated/plugin",
        ],
      },
    },
  };
};
