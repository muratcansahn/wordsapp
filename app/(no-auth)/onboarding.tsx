import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { PADDING, ScreenWidth } from '@/constants/AppConstants';
import Container from '@/components/common/container';
import ProgressBar from '@/components/common/onboarding/ProgressBar';
import OnboardingSlide from '@/components/common/onboarding/OnboardingSlide';
import NavigationButton from '@/components/common/onboarding/OnboardingButton';
import { LottieViewProps } from 'lottie-react-native';
import { ImageProps } from 'expo-image';
import { onboardingData } from '@/data/Onboarding';

export interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  lottie?: LottieViewProps['source'];
  image?: ImageProps['source'];
}

const OnboardingScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const scrollX = useSharedValue<number>(0);
  const flatListRef = useRef<Animated.FlatList<OnboardingItem>>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [buttonText, setButtonText] = useState<string>(t('buttons.next'));
  const { mode } = useTheme();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const nextSlide = useCallback(() => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/sign-up');
    }
  }, [currentIndex, router]);

  const renderItem = useCallback(
    ({ item, index }: { item: OnboardingItem; index: number }) => (
      <OnboardingSlide item={item} index={index} scrollX={scrollX} />
    ),
    [scrollX]
  );

  const keyExtractor = useCallback((item: OnboardingItem) => item.id, []);

  useEffect(() => {
    setButtonText(
      currentIndex === onboardingData.length - 1
        ? t('buttons.getStarted')
        : t('buttons.next')
    );
  }, [currentIndex, t]);

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newIndex = Math.round(
        event.nativeEvent.contentOffset.x / ScreenWidth
      );
      setCurrentIndex(newIndex);
    },
    []
  );

  return (
    <Container bgColor={Colors[mode].background} edges={['top', 'bottom']}>
      <ProgressBar
        currentStep={currentIndex}
        totalSteps={onboardingData.length}
      />
      <Animated.FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
      <View style={styles.buttonContainer}>
        <NavigationButton onPress={nextSlide} text={buttonText} />
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: PADDING.lg,
  },
});

export default OnboardingScreen;
