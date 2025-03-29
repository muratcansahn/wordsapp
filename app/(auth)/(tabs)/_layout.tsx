import { Tabs } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/theme/useTheme';
import ProfileHeader from '@/components/navigation/header/profile-header';

const TabLayout = () => {
  const { mode } = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: Colors[mode].primary || Colors[mode].button,
        headerShown: false
      }}
      initialRouteName="index"
    >
   
      <Tabs.Screen
        name="index"
        options={{
          title: t('header.home'),
          tabBarIcon: ({ color }) => <TabBarIcon name={'home'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: t('header.learn'),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name={'book-open'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('header.profile'),
          headerShown: false,
          headerRight: ProfileHeader,
          tabBarIcon: ({ color }) => <TabBarIcon name={'user'} color={color} />,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
