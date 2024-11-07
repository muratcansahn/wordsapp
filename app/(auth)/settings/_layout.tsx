import React from 'react';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import HeaderLeft from '@/components/navigation/header/HeaderBack';
import HeaderClose from '@/components/navigation/header/HeaderClose';

const SettingsLayout = () => {
  const { t } = useTranslation();

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerLeft: HeaderLeft,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('header.settings'),
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="language"
        options={{
          title: t('header.language'),
        }}
      />
      <Stack.Screen
        name="theme"
        options={{
          title: t('header.theme'),
        }}
      />

      <Stack.Screen
        name="help"
        options={{
          title: t('header.help'),
        }}
      />
      <Stack.Screen
        name="delete-account"
        options={{
          title: t('header.deleteAccount'),
          animation: 'slide_from_bottom',
          headerLeft: HeaderClose,
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: t('header.notifications'),
        }}
      />
    </Stack>
  );
};

export default SettingsLayout;
