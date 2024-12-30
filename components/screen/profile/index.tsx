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
import { menuItems } from '@/data/ProfileButtons';
import { ChevronRight, LucideIcon } from 'lucide-react-native';

const ProfileScreen = () => {
  const { mode } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const placeholder =
    'https://ui-avatars.com/api/?name=Ship+Mobile+Fast?size=150';
  const userProfilePhoto = user?.user_metadata?.avatar_url;
  const name = user?.user_metadata?.full_name ?? user?.name;
  const email = user?.email;

  const handlePress = useCallback(
    (route: Href) => {
      router.push(route);
    },
    [router]
  );

  const renderMenuItem = (IconComponent: LucideIcon, text: string) => (
    <PressableOpacity
      key={text}
      style={[styles.menuItem, { borderBottomColor: Colors[mode].borderColor }]}
      onPress={() =>
        handlePress(menuItems.find((item) => item.text === text)?.route as Href)
      }
    >
      <IconComponent size={ICON_SIZE.sm} color={Colors[mode].text} />
      <ThemedText style={styles.menuItemText}>{t(text)}</ThemedText>
      <ChevronRight size={ICON_SIZE.xs} color={Colors[mode].placeholderColor} />
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
          {menuItems.map((item) => renderMenuItem(item.icon, item.text))}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
  },
  profileInfo: {
    gap: 10,
    alignItems: 'center',
    marginBottom: MARGIN.lg,
    paddingHorizontal: PADDING.md,
    paddingTop: PADDING.md,
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
