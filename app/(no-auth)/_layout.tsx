import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/theme/useTheme';
import { Colors } from '@/constants/Colors';

const Layout = () => {
  const { mode } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: Colors[mode].text,
      }}
      initialRouteName="onboarding"
    >
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="sign-up-with-email" />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack>
  );
};

export default Layout;
