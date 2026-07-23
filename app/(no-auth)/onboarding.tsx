import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
  Dimensions,
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
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
const onboardingBackground = require('@/assets/images/game-background.png');
import ProgressDots from '@/components/common/onboarding/progress-dots';
import OnboardingSlide from '@/components/common/onboarding/onboarding-slide';
import NavigationButton from '@/components/common/onboarding/onboarding-button';
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
  const { mode } = useTheme();
  
  // Ekran boyutlarını al
  const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

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
      <OnboardingSlide item={item} index={index} scrollX={scrollX} isActive={currentIndex === index} />
    ),
    [scrollX, currentIndex]
  );

  const keyExtractor = useCallback((item: OnboardingItem) => item.id, []);

  // buttonText tamamen currentIndex + t'den türetildiğinden ayrı bir state/effect
  // yerine render sırasında doğrudan hesaplanıyor.
  const buttonText =
    currentIndex === onboardingData.length - 1
      ? t('buttons.getStarted')
      : t('buttons.next');

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
    <Container
      style={styles.container}
      bgColor={undefined}
      edges={['top', 'left', 'right']}
    >
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={onboardingBackground}
          style={[StyleSheet.absoluteFill, { width: '100%', height: '100%', resizeMode: 'cover' }]}
          blurRadius={0}
        />
      </View>
      <View style={{ height: 50 }}>
        
      </View>
      <View style={styles.centerSection}>
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
      </View>
      {/* Çizgiler kartın hemen altında */}
      <ProgressDots currentStep={currentIndex} totalSteps={onboardingData.length} />
      <View style={styles.buttonContainer}>
        <NavigationButton onPress={nextSlide} text={buttonText} />
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Dimensions.get('window').height,
    justifyContent: 'space-between',
    overflow: 'hidden', // Taşan içeriğin gizlenmesini sağlar
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Taşan içeriğin gizlenmesini sağlar
  },
  buttonContainer: {
    paddingHorizontal: PADDING.lg,
    paddingBottom: 16,
  },
});

export default OnboardingScreen;
