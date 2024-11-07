import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/theme/useTheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/common/typography';
import { Href, useRouter } from 'expo-router';
import { ThemedView } from '@/components/common/view';
import { Image } from 'expo-image';
import { RainbowButton } from '@/components/common/buttons/rainbow/rainbow-button';
import {
  BORDER_RADIUS,
  FLEX,
  ICON_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';

const SocialShareButton: React.FC<{
  icon: React.ReactNode;
  text: string;
  colors: string[];
  onPress: () => void;
}> = ({ icon, text, colors, onPress }) => {
  const { mode } = useTheme();

  return (
    <RainbowButton
      onPress={onPress}
      style={styles.socialButton}
      buttonStyle={styles.socialButtonContent}
      colors={[...colors, Colors[mode].button]}
      height={80}
      borderRadius={20}
    >
      {icon}
      <ThemedText style={[styles.socialButtonText, { color: colors[1] }]}>
        {text}
      </ThemedText>
    </RainbowButton>
  );
};

const socialButtons = [
  {
    icon: <FontAwesome6 name="spotify" size={30} color="#1DB954" />,
    text: 'Share Spotify Music',
    colors: ['#1DB954', Colors.light.background, '#1ed760'],
    route: '/(auth)/(modals)/share',
  },
  {
    icon: (
      <Image
        source={require('@/assets/logos/cuul.png')}
        style={{ width: 30, height: 30, borderRadius: 10 }}
      />
    ),
    text: 'Share Cuul Story',
    colors: ['#FAFF00', '#B2DE10'],
    route: '/(auth)/(modals)/cuul',
  },
  {
    icon: (
      <Image
        source={require('@/assets/logos/kroko.png')}
        style={{ width: 30, height: 30, borderRadius: 10 }}
      />
    ),
    text: 'Share Krok',
    colors: ['#ff4e00', '#ff8900'],
    route: '/(auth)/(modals)/kroko',
  },
];

export default function SocialSharing() {
  const router = useRouter();

  const openBottomSheet = (route: string) => {
    router.push(route as Href);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {socialButtons.map((button, index) => (
          <SocialShareButton
            key={index}
            icon={button.icon}
            text={button.text}
            colors={button.colors}
            onPress={() => openBottomSheet(button.route)}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
  },
  scrollContent: {
    padding: PADDING.md,
  },
  socialButton: {
    marginBottom: MARGIN.lg,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialButtonText: {
    marginLeft: MARGIN.lg,
  },
  logoImage: {
    width: ICON_SIZE.md,
    height: ICON_SIZE.md,
    borderRadius: BORDER_RADIUS.md,
  },
});
