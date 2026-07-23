// babel.config.js
module.exports = function (api) {
  const isProduction = api.env('production');
  api.cache.using(() => process.env.NODE_ENV);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Prod build'de console.log/debug/info çağrılarını at (console.error/warn kalır)
      isProduction && [
        'babel-plugin-transform-remove-console',
        { exclude: ['error', 'warn'] },
      ],
      'react-native-reanimated/plugin',     // DAİMA en sonda olmalı
    ].filter(Boolean),
  };
};
