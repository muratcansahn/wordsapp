import React from 'react';
import { Stack } from 'expo-router';
import HeaderLeft from '@/components/navigation/header/HeaderBack';

const Layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="onboarding">
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="sign-up-with-email" />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: true,
          headerLeft: HeaderLeft,
          headerTransparent: true,
          headerTitle: '',
        }}
      />
    </Stack>
  );
};

export default Layout;
