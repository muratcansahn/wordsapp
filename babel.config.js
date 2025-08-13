// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      require.resolve('expo-router/babel'), // Expo Router için
      'react-native-reanimated/plugin',     // DAİMA en sonda olmalı
    ],
  };
};
