const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration with optimized file watching
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [],
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
    port: 8082,
  },
  watcher: {
    healthCheck: {
      enabled: true,
    },
    // Reduce file watching to avoid EMFILE errors
    watchman: false,
    ignore: [
      '**/node_modules/**/*',
      '**/.git/**/*',
      '**/android/**/*',
      '**/ios/**/*',
      '**/__tests__/**/*',
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);