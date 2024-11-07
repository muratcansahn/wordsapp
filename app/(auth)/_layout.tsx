import React from 'react';
import { Stack } from 'expo-router';

const AuthLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings" />
      <Stack.Screen
        name="(modals)"
        options={{ presentation: 'fullScreenModal' }}
      />
      {/* You can pick one or how many you want and delete this code 👇 */}
      <Stack.Screen name="(features)" />
    </Stack>
  );
};

export default AuthLayout;
