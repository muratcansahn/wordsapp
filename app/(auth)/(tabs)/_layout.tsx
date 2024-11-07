import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/theme/useTheme';
import {
  BORDER_RADIUS,
  BUTTON_HEIGHT,
  ICON_SIZE,
  MARGIN,
} from '@/constants/AppConstants';
import Button from '@/components/common/buttons/button';

const TabLayout = () => {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: Colors[mode].tint || '#000',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('header.home'),
          headerTitle: t('appName'),
          // Uncomment this if you want to build like a swipe up video app
          // headerTransparent: true,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={'home'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('header.search'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={'search'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t('header.profile'),
          headerRight: () => (
            <Button
              onPress={() => {
                router.push('/settings');
              }}
              style={styles.settings}
              height={BUTTON_HEIGHT.sm}
            >
              <Ionicons
                name="settings-outline"
                size={ICON_SIZE.xs}
                color={Colors[mode].text}
              />
            </Button>
          ),
          tabBarIcon: ({ color }) => <TabBarIcon name={'user'} color={color} />,
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  settings: {
    marginRight: MARGIN.lg,
    width: ICON_SIZE.sm,
    height: ICON_SIZE.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
});

export default TabLayout;
