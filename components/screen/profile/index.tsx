import React, { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/common/view';
import { ThemedText } from '@/components/common/typography';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import { Href, useRouter } from 'expo-router';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/theme/useTheme';
import {
  ANIMATION_DURATION,
  AVATAR_SIZE,
  BORDER_RADIUS,
  FLEX,
  FONT_SIZE,
  ICON_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';
import { useAuth } from '@/context/SupabaseProvider';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { menuItems } from '@/data/ProfileButtons'; // Profil menüsü
// Ayarlar menüsü aşağıda tekrar tanımlanıyor.
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

// Lucide ikonlarını React Element'e çeviren yardımcı fonksiyon
const convertLucideIconToElement = (IconComponent: LucideIcon, color: string, size: number) => (
  <IconComponent size={size} color={color} />
);

// Menü tipi: Lucide veya Ionicons olabilir
interface MergedMenuItem {
  icon: LucideIcon | string;
  title: string;
  route?: string;
  color?: string;
  onPress?: () => void;
  isLucide: boolean;
}


const ProfileScreen = () => {
  const { mode } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const placeholder =
    'https://ui-avatars.com/api/?name=Ship+Mobile+Fast?size=150';
  const userProfilePhoto = user?.user_metadata?.avatar_url;
  const name = user?.user_metadata?.full_name ?? user?.name;
  const email = user?.email;


  // Privacy Policy açma fonksiyonu
  const handlePrivacyPolicy = () => {
    // Dynamic import types uyumlu şekilde
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const WebBrowser = require('expo-web-browser');
    WebBrowser.openBrowserAsync('https://shipmobilefast.com/privacy-policy');
  };

  // Ayarlar menüsündeki öğeler (her biri isLucide: false)
  const settings: MergedMenuItem[] = [
    {
      icon: 'language',
      title: 'settings.titles.language',
      route: '/settings/language',
      color: '#007AFF',
      isLucide: false,
    },
    {
      icon: 'sunny',
      title: 'profile.theme',
      route: '/settings/theme',
      color: '#FF9500',
      isLucide: false,
    },
    {
      icon: 'lock-closed',
      title: 'settings.titles.privacy',
      onPress: handlePrivacyPolicy,
      color: '#FF3B30',
      isLucide: false,
    },
    {
      icon: 'help-circle',
      title: 'profile.help',
      route: '/settings/help',
      color: '#34C759',
      isLucide: false,
    },
    {
      icon: 'notifications',
      title: 'profile.notifications',
      route: '/settings/notifications',
      color: '#5856D6',
      isLucide: false,
    },
  ];

  // Profil menüsündeki tüm öğeleri ve ayarlar menüsündeki tüm öğeleri birleştiriyoruz
  // İstenmeyen sekmeleri filtrele (yoruma alma)
  const hiddenTitles = [
    'profile.editProfile',
    'profile.theme',
    'settings.titles.theme',
    'profile.help',
    'settings.titles.help',
    'profile.settings',
    'settings.titles.settings',
    'settings.titles.deleteAccount',
  ];

  const mergedMenu: MergedMenuItem[] = [
    ...menuItems.map((item) => ({
      icon: item.icon,
      title: item.text,
      route: item.route,
      isLucide: true,
    })),
    ...settings,
  ]
    // Tekilleştir (aynı title ve route olanları birleştir)
    .filter((item, index, arr) =>
      index === arr.findIndex((i) => i.title === item.title && i.route === item.route)
    )
    // İstenmeyen sekmeleri gösterme
    .filter((item) => !hiddenTitles.includes(item.title));

  const handlePress = useCallback(
    (route: Href) => {
      router.push(route);
    },
    [router]
  );

  // Hem Lucide hem Ionicons ikonlarını destekleyen render fonksiyonu
  const renderMenuItem = (item: MergedMenuItem) => (
    <PressableOpacity
      key={item.title}
      style={styles.menuItem}
      onPress={item.onPress ? item.onPress : item.route ? () => handlePress(item.route!) : undefined}
    >
      {item.isLucide && typeof item.icon !== 'string'
        ? convertLucideIconToElement(
            item.icon as LucideIcon,
            item.title === 'settings.titles.logout' ? Colors.light.error : Colors.light.black,
            ICON_SIZE.sm
          )
        : <Ionicons
            name={item.icon as keyof typeof Ionicons.glyphMap}
            size={ICON_SIZE.sm}
            color={item.title === 'settings.titles.logout' ? Colors.light.error : Colors.light.black}
          />}

      <ThemedText style={styles.menuItemText}>{t(item.title)}</ThemedText>
      <Ionicons
        name={"chevron-forward" as const}
        size={ICON_SIZE.xs}
        color={Colors.light.placeholderColor}
      />
    </PressableOpacity>
  );


  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedView style={styles.profileInfo}>
          <Animated.View entering={ZoomIn.duration(ANIMATION_DURATION.D5)}>
            <Image
              source={{ uri: userProfilePhoto }}
              style={styles.avatar}
              placeholder={placeholder}
              placeholderContentFit="contain"
              contentFit="contain"
            />
          </Animated.View>
          <ThemedView style={styles.nameContainer}>
            {name && <ThemedText style={styles.name}>{name}</ThemedText>}
            {email && <ThemedText style={styles.email}>{email}</ThemedText>}
          </ThemedView>
        </ThemedView>

        <ThemedView>
          {mergedMenu.map((item) => renderMenuItem(item))}
        </ThemedView>

        <ThemedView>
          {renderMenuItem({
            icon: 'log-out',
            title: 'settings.titles.logout',
            onPress: signOut,
            isLucide: false,
            color: Colors.light.placeholderColor,
            route: undefined,
          })}
          {/* Hesabı sil sekmesi gizlendi */}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
    paddingTop: 36, // sayfanın genelini biraz aşağı alır
  },
  profileInfo: {
    gap: 10,
    alignItems: 'center',
    marginBottom: MARGIN.lg,
    paddingHorizontal: PADDING.md,
    paddingTop: PADDING.md,
    marginTop: 24, // profil kısmını daha aşağıya alır
  },
  nameContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: AVATAR_SIZE.md,
    height: AVATAR_SIZE.md,
    borderRadius: BORDER_RADIUS.rounded,
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
  },
  email: {
    fontSize: FONT_SIZE.md,
  },
  upgradeContainer: {
    paddingHorizontal: PADDING.md,
    marginVertical: MARGIN.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: PADDING.md,
    paddingHorizontal: PADDING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItemText: {
    flex: FLEX.one,
    marginLeft: MARGIN.lg,
    fontSize: FONT_SIZE.md,
  },
});

export default ProfileScreen;
