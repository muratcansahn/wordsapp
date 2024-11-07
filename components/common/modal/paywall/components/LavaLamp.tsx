import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import {
  ANIMATION_DURATION,
  ScreenHeight,
  ScreenWidth,
  Z_INDEX,
} from '@/constants/AppConstants';

interface CozyParticleProps {
  index: number;
  color: string;
  size: number;
}

const CozyParticle: React.FC<CozyParticleProps> = React.memo(
  ({ color, size }) => {
    const translateY = useSharedValue(Math.random() * ScreenHeight);
    const translateX = useSharedValue(Math.random() * ScreenWidth);
    const scale = useSharedValue(1);

    useEffect(() => {
      translateY.value = withRepeat(
        withTiming(Math.random() * ScreenWidth, {
          duration:
            ANIMATION_DURATION.D20 + Math.random() * ANIMATION_DURATION.D5,
          easing: Easing.inOut(Easing.cubic),
        }),
        -1,
        true
      );
      translateX.value = withRepeat(
        withTiming(Math.random() * ScreenWidth, {
          duration:
            ANIMATION_DURATION.D20 + Math.random() * ANIMATION_DURATION.D5,
          easing: Easing.inOut(Easing.cubic),
        }),
        -1,
        true
      );
      scale.value = withRepeat(
        withTiming(1.5, {
          duration:
            ANIMATION_DURATION.D20 + Math.random() * ANIMATION_DURATION.D5,
          easing: Easing.inOut(Easing.cubic),
        }),
        -1,
        true
      );
    }, [scale, translateX, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value },
      ],
      backgroundColor: color,
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size / 2,
    }));

    return <Animated.View style={animatedStyle} />;
  }
);

interface StarryBackgroundProps {
  particleCount?: number;
  colors?: string[];
  particleSize?: number;
}

const StarryBackground: React.FC<StarryBackgroundProps> = ({
  particleCount = 30,
  colors = ['#1a00ff', '#bb00ff', '#7d00ff'],
  particleSize = 100,
}) => {
  const renderParticle = useCallback(
    (index: number) => (
      <CozyParticle
        key={index}
        index={index}
        color={colors[index % colors.length]}
        size={particleSize}
      />
    ),
    [colors, particleSize]
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: particleCount }).map((_, index: number) =>
        renderParticle(index)
      )}
      <BlurView
        intensity={80}
        style={StyleSheet.absoluteFillObject}
        tint="dark"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    zIndex: Z_INDEX.hide,
    backgroundColor: '#000033',
  },
});

export default React.memo(StarryBackground);
