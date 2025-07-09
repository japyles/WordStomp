// const { getDefaultConfig } = require('expo/metro-config');

// const config = getDefaultConfig(__dirname);

// config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];
// config.resolver.resolverMainFields = ['browser', 'module', 'main'];

// config.transformer.getTransformOptions = async () => ({
//   transform: {
//     experimentalImportSupport: false,
//     inlineRequires: false,
//   },
// });

// module.exports = config;

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add ts and tsx support
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

// ✅ Force safe-area-context to use built version, not src
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native-safe-area-context': path.resolve(
    __dirname,
    'node_modules/react-native-safe-area-context/lib'
  ),
};

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});

module.exports = config;
