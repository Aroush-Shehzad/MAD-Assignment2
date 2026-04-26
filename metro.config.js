// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for react-navigation assets
config.resolver.assetExts.push(
  // Add any custom asset extensions here
);

module.exports = config;