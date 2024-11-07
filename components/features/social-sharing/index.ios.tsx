import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/theme/useTheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/common/typography';
import { Href, useRouter } from 'expo-router';
import { ThemedView } from '@/components/common/view';
import { Image } from 'expo-image';
import { RainbowButton3 } from '@/components/common/buttons/rainbow/rainbow-button3';
import { BlurView } from 'expo-blur';
import {
  ANIMATION_DURATION,
  BORDER_RADIUS,
  BUTTON_HEIGHT,
  FLEX,
  ICON_SIZE,
  MARGIN,
  PADDING,
  Z_INDEX,
} from '@/constants/AppConstants';

const SocialShareButton: React.FC<{
  icon: React.ReactNode;
  text: string;
  colors: string[];
  onPress: () => void;
  duration?: number;
  height?: number;
  borderRadius?: number;
}> = ({
  icon,
  text,
  colors,
  onPress,
  duration = ANIMATION_DURATION.D30,
  height = BUTTON_HEIGHT.md,
  borderRadius = BORDER_RADIUS.sm,
}) => {
  const { mode } = useTheme();

  return (
    <RainbowButton3
      onPress={onPress}
      style={styles.socialButton}
      buttonStyle={styles.socialButtonContent}
      bgColor={Colors[mode].background}
      colors={[...colors]}
      height={height}
      borderRadius={borderRadius}
      duration={duration}
    >
      {icon}
      <ThemedText
        style={[styles.socialButtonText, { color: Colors[mode].text }]}
      >
        {text}
      </ThemedText>
      <BlurView
        style={[styles.blurView, { backgroundColor: Colors[mode].background }]}
        intensity={100}
        tint={mode === 'dark' ? 'dark' : 'light'}
      />
    </RainbowButton3>
  );
};

export default function SocialSharing() {
  const router = useRouter();
  const { mode } = useTheme();
  const openBottomSheet = (route: string) => {
    router.push(route as Href);
  };

  const socialButtons = [
    {
      icon: <FontAwesome6 name="spotify" size={30} color="#1DB954" />,
      text: 'Share Spotify Music',
      colors: ['#1DB954', '#00ff4e', Colors[mode].button],
      route: '/share',
      height: BUTTON_HEIGHT.lg,
      borderRadius: BORDER_RADIUS.sm,
    },
    {
      icon: (
        <Image
          source={require('@/assets/logos/cuul.png')}
          style={styles.logoImage}
        />
      ),
      text: 'Share Cuul Story',
      colors: ['#FAFF00', '#B2DE10', Colors[mode].button],
      route: '/cuul',
      height: BUTTON_HEIGHT.lg,
      borderRadius: BORDER_RADIUS.sm,
    },
    {
      icon: (
        <Image
          source={require('@/assets/logos/kroko.png')}
          style={styles.logoImage}
        />
      ),
      text: 'Share Krok',
      colors: ['#ff8900', '#ff0000', Colors[mode].button],
      route: '/kroko',
      height: BUTTON_HEIGHT.lg,
      borderRadius: BORDER_RADIUS.sm,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {socialButtons.map((button, index) => (
          <SocialShareButton
            key={index}
            icon={button.icon}
            text={button.text}
            height={button.height}
            borderRadius={button.borderRadius}
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
  blurView: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    zIndex: Z_INDEX.hide,
  },
  logoImage: {
    width: ICON_SIZE.md,
    height: ICON_SIZE.md,
    borderRadius: BORDER_RADIUS.md,
  },
});
