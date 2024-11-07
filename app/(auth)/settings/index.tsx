import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import { useTranslation } from 'react-i18next';
import { Href, useRouter } from 'expo-router';
import { ThemedView } from '@/components/common/view';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '@/hooks/theme/useTheme';
import {
  BORDER_RADIUS,
  FLEX,
  FONT_SIZE,
  ICON_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';
import { useAuth } from '@/context/SupabaseProvider';

const SettingsScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { mode } = useTheme();
  const { signOut } = useAuth();

  const handleDeleteAccount = () => {
    router.push('/settings/delete-account');
  };

  const handlePrivacyPolicy = async () => {
    await WebBrowser.openBrowserAsync(
      'https://shipmobilefast.com/en/privacy-policy'
    );
  };

  const settings: {
    icon: string;
    title: string;
    onPress?: () => void;
    route?: Href;
    color?: string;
  }[] = [
    {
      icon: 'language',
      title: 'settings.titles.language',
      route: '/settings/language',
      color: '#007AFF',
    },
    {
      icon: 'sunny',
      title: 'settings.titles.theme',
      route: '/settings/theme',
      color: '#FF9500',
    },
    {
      icon: 'lock-closed',
      title: 'settings.titles.privacy',
      onPress: handlePrivacyPolicy,
      color: '#FF3B30',
    },
    {
      icon: 'help-circle',
      title: 'settings.titles.help',
      route: '/settings/help',
      color: '#34C759',
    },
    {
      icon: 'notifications',
      title: 'settings.titles.notifications',
      route: '/settings/notifications',
      color: '#5856D6',
    },
  ];

  const SettingItem = ({
    icon,
    title,
    onPress,
    color,
  }: {
    icon: string;
    title: string;
    onPress: () => void;
    color?: string;
  }) => (
    <PressableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={ICON_SIZE.xs}
          color={Colors.light.white}
        />
      </View>
      <ThemedText style={styles.settingText}>{title}</ThemedText>
      <Ionicons
        name="chevron-forward"
        size={ICON_SIZE.xs}
        color={Colors[mode].text}
        style={styles.chevron}
      />
    </PressableOpacity>
  );

  const SettingGroup = ({ children }: { children: React.ReactNode }) => (
    <ThemedView
      lightColor={Colors.light.white}
      darkColor={Colors.dark.background}
      style={styles.settingGroup}
    >
      {children}
    </ThemedView>
  );

  return (
    <ThemedView
      lightColor={Colors.light.backgroundSecondary}
      darkColor={Colors.dark.backgroundSecondary}
      style={[styles.container]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <SettingGroup>
          {settings.map((setting, index) => (
            <React.Fragment key={setting.title}>
              <SettingItem
                icon={setting.icon}
                title={t(setting.title)}
                onPress={
                  setting.onPress
                    ? setting.onPress
                    : () => router.push(setting.route as Href)
                }
                color={setting.color}
              />
              {index < settings.length - 1 && (
                <View
                  style={[
                    styles.separator,
                    { borderColor: Colors[mode].borderColor },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </SettingGroup>

        <SettingGroup>
          <SettingItem
            icon="log-out"
            title={t('settings.titles.logout')}
            onPress={signOut}
            color={Colors[mode].placeholderColor}
          />
          <View
            style={[
              styles.separator,
              { borderColor: Colors[mode].borderColor },
            ]}
          />
          <SettingItem
            icon="trash"
            title={t('settings.titles.deleteAccount')}
            onPress={handleDeleteAccount}
            color={Colors[mode].error}
          />
        </SettingGroup>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
  },
  iconContainer: {
    padding: PADDING.xs,
    borderRadius: BORDER_RADIUS.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingGroup: {
    marginTop: MARGIN.xl,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginHorizontal: MARGIN.xl,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: PADDING.sm,
    paddingHorizontal: PADDING.md,
  },

  settingText: {
    fontSize: FONT_SIZE.md,
    flex: FLEX.one,
    marginLeft: MARGIN.lg,
  },
  chevron: {
    opacity: 0.6,
  },
  separator: {
    left: PADDING.xxxl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default SettingsScreen;
