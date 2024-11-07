import React from 'react';
import { Stack } from 'expo-router';
import HeaderClose from '@/components/navigation/header/HeaderClose';
import PaywallHeaderLeft from '@/components/navigation/header/PaywallHeaderLeft';

const ModalsLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="paywall"
        options={{
          title: '',
          headerTransparent: true,
          headerTitleAlign: 'center',
          headerLeft: PaywallHeaderLeft,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="share"
        options={{
          title: 'Share',
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
      <Stack.Screen
        name="kroko"
        options={{
          title: 'Kroko',
          presentation: 'modal',
          headerLeft: HeaderClose,
        }}
      />
    </Stack>
  );
};

export default ModalsLayout;
