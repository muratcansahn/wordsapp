import React from 'react';
import { Stack } from 'expo-router';

const CallbackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: 'modal' }}>
      <Stack.Screen
        name="verify"
        options={{ headerShown: false, autoHideHomeIndicator: false }}
      />
      <Stack.Screen name="new-password" options={{ headerShown: false }} />
    </Stack>
  );
};

export default CallbackLayout;
