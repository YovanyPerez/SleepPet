const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Permite require.context (autodetección de imágenes de mascotas
// en assets/pets/). Flag experimental de Metro, funcional en 0.83.3.
config.transformer.unstable_allowRequireContext = true;

module.exports = config;