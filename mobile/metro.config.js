const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration with optimized file watching
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    __dirname + '/src',
  ],
  resolver: {
    alias: {
      '@': __dirname + '/src',
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  server: {
    port: 8081,
  },
  watcher: {
    healthCheck: {
      enabled: true,
    },
    watchman: false,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);