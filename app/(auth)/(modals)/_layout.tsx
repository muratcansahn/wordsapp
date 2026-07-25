import React from 'react';
import { Stack } from 'expo-router';
import HeaderClose from '@/components/navigation/header/header-close';
import PaywallHeader from '@/components/navigation/header/paywall-header';

const ModalsLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="paywall-double"
        options={{
          title: '',
          headerTitleAlign: 'center',
          headerRight: PaywallHeader,
          presentation: 'fullScreenModal',
          headerShadowVisible: false,
          headerBackVisible: false,
          headerTransparent: true,
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="spotify"
        options={{
          title: 'Spotify',
          presentation: 'modal',
          headerLeft: HeaderClose,
        }}
      />
      <Stack.Screen
        name="cuul"
        options={{
          title: 'Cuul',
          presentation: 'modal',
          headerLeft: HeaderClose,
        }}
      />
    </Stack>
  );
};

export default ModalsLayout;
