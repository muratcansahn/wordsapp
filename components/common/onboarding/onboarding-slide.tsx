import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { ThemedText } from '@/components/common/typography';
import { Image } from 'expo-image';
import {
  FLEX,
  MARGIN,
  PADDING,
  ScreenWidth,
  ScreenHeight,
  FONT_SIZE,
} from '@/constants/AppConstants';
import { ThemedView } from '@/components/common/view';
import { OnboardingItem } from '@/app/(no-auth)/onboarding';

interface OnboardingSlideProps {
  item: OnboardingItem;
  index: number;
  scrollX: SharedValue<number>;
}

const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  item,
  index,
  scrollX,
}) => {
  const { t } = useTranslation();
  const lottieRef = useRef<LottieView>(null);

  const inputRange = [
    (index - 1) * ScreenWidth,
    index * ScreenWidth,
    (index + 1) * ScreenWidth,
  ];

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }], opacity };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [ScreenHeight * 0.1, 0, -ScreenHeight * 0.1],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }], opacity };
  });

  return (
    <ThemedView style={styles.slideContainer}>
      <Animated.View style={[styles.lottieContainer, animatedStyle]}>
        {item.lottie && (
          <LottieView
            ref={lottieRef}
            source={item.lottie}
            style={styles.lottie}
            loop
            autoPlay
          />
        )}
        {item.image && <Image source={item.image} style={styles.image} />}
      </Animated.View>
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <ThemedText type="title" style={styles.title}>
          {t(item.title)}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.description}>
          {t(item.description)}
        </ThemedText>
      </Animated.View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  slideContainer: {
    width: ScreenWidth,
    height: ScreenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  lottieContainer: {
    flex: FLEX.one,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: ScreenWidth,
    height: ScreenHeight * 0.4,
  },
  image: {
    width: ScreenWidth,
    height: ScreenHeight * 0.4,
    aspectRatio: 1,
  },
  textContainer: {
    flex: FLEX.one,
    alignItems: 'center',
    paddingHorizontal: PADDING.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: MARGIN.sm,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    marginTop: MARGIN.xl,
    fontSize: FONT_SIZE.lg,
  },
});

export default OnboardingSlide;
