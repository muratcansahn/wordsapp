import React from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

const SettingsScreen = () => {
  const router = useRouter();

  const handlePrivacyPolicy = async () => {
    await WebBrowser.openBrowserAsync(
      'https://shipmobilefast.com/privacy-policy'
    );
  };

  const settings = [
    {
      icon: 'translate',
      title: 'Dil Ayarları',
      route: '/settings/language',
      color: '#007AFF',
    },

    {
      icon: 'shield-lock',
      title: 'Gizlilik',
      onPress: handlePrivacyPolicy,
      color: '#FF3B30',
    },
    {
      icon: 'help-circle',
      title: 'Yardım',
      route: '/settings/help',
      color: '#34C759',
    },
    {
      icon: 'bell',
      title: 'Bildirimler',
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
    <View style={styles.settingItem}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <MaterialCommunityIcons
          name={icon as any}
          size={24}
          color="#FFFFFF"
        />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingText}>{title}</Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color="#666"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.settingGroup}>
          {settings.map((setting, index) => (
            <React.Fragment key={setting.title}>
              <SettingItem
                icon={setting.icon}
                title={setting.title}
                onPress={
                  setting.onPress
                    ? setting.onPress
                    : () => router.push(setting.route)
                }
                color={setting.color}
              />
              {index < settings.length - 1 && (
                <View style={styles.separator} />
              )}
            </React.Fragment>
          ))}
        </View>

        <View style={[styles.settingGroup, styles.dangerZone]}>
          <SettingItem
            icon="logout"
            title="Çıkış Yap"
            onPress={() => {}}
            color="#666"
          />
          <View style={styles.separator} />
          <SettingItem
            icon="delete"
            title="Hesabı Sil"
            onPress={() => router.push('/settings/delete-account')}
            color="#FF3B30"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  settingGroup: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
  },
  dangerZone: {
    marginTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 15,
  },
});

export default SettingsScreen;
