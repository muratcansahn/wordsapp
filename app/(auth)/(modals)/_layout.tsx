import React from 'react';
import { Stack } from 'expo-router';
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
    </Stack>
  );
};

export default ModalsLayout;
