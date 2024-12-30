import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/theme/useTheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/common/typography';
import { Href, useRouter } from 'expo-router';
import { ThemedView } from '@/components/common/view';
import { Image } from 'expo-image';
import {
  ANIMATION_DURATION,
  BORDER_RADIUS,
  BUTTON_HEIGHT,
  FLEX,
  ICON_SIZE,
  MARGIN,
  PADDING,
  ScreenWidth,
  Z_INDEX,
} from '@/constants/AppConstants';
import AnimatedBorderButton from '@/components/common/buttons/animated-border-button';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';

const SocialShareButton: React.FC<{
  icon: React.ReactNode;
  text: string;
  color: string;
  onPress: () => void;
  duration?: number;
  height?: number;
  borderRadius?: number;
}> = ({
  icon,
  text,
  color,
  onPress,
  duration = ANIMATION_DURATION.D30,
  height = BUTTON_HEIGHT.md,
  borderRadius = BORDER_RADIUS.sm,
}) => {
  const { mode } = useTheme();

  return (
    <AnimatedBorderButton
      height={height}
      borderRadius={borderRadius}
      delayInAnimation={duration}
      pathColor={Colors[mode].borderColor}
      innerContainerColor={Colors[mode].background}
      sliderColor={color}
      width={ScreenWidth - 40}
      sliderHeight={3}
    >
      <PressableOpacity style={styles.socialButtonView} onPress={onPress}>
        {icon}
        <ThemedText
          style={[styles.socialButtonText, { color: Colors[mode].text }]}
        >
          {text}
        </ThemedText>
      </PressableOpacity>
    </AnimatedBorderButton>
  );
};

export default function SocialSharing() {
  const router = useRouter();
  const openBottomSheet = (route: string) => {
    router.push(route as Href);
  };

  const socialButtons = [
    {
      icon: <FontAwesome6 name="spotify" size={30} color="#1DB954" />,
      text: 'Share Spotify Music',
      color: '#1DB954',
      route: '/spotify',
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
      color: '#FAFF00',
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
      color: '#ff8900',
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
            color={button.color}
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
    gap: MARGIN.lg,
  },
  socialButton: {
    marginBottom: MARGIN.lg,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: Z_INDEX.one,
    flex: 1,
    justifyContent: 'center',
  },
  socialButtonText: {
    marginLeft: MARGIN.lg,
    zIndex: Z_INDEX.one,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    zIndex: Z_INDEX.zero,
  },
  logoImage: {
    width: ICON_SIZE.md,
    height: ICON_SIZE.md,
    borderRadius: BORDER_RADIUS.md,
  },
});
