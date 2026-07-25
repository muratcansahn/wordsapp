import React, { ReactNode, useEffect, useState } from 'react';
import { DimensionValue, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import PressableOpacity from './pressable-opacity';
import LoaderLucide from '@/components/common/loader/loader-2';
import { ANIMATION_DURATION, FLEX } from '@/constants/AppConstants';
import { ThemedView } from '@/components/common/view';

export type AnimatedBorderButtonProps = {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  sliderWidth?: number;
  sliderHeight?: number;
  delayInAnimation?: number;
  pathColor?: string;
  sliderColor?: string;
  innerContainerColor?: string;
  children?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

const AnimatedBorderButton: React.FC<AnimatedBorderButtonProps> = ({
  width = 200,
  height = 50,
  borderRadius = 50,
  sliderWidth = 80,
  sliderHeight = 5,
  delayInAnimation = ANIMATION_DURATION.D30,
  pathColor = '#ffce0010',
  sliderColor = '#FFDA47',
  innerContainerColor = '#ffce0010',
  disabled = false,
  children,
  onPress,
  loading = false,
}) => {
  const { mode } = useTheme();
  const [actualWidth, setActualWidth] = useState<number | undefined>(undefined);
  const isCircle = width === height && borderRadius >= width / 2;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: delayInAnimation,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    if (typeof width === 'number' || actualWidth) {
      const numericWidth = typeof width === 'number' ? width : actualWidth!;
      const translateX = isCircle
        ? 0
        : progress.value < 0.25
        ? -numericWidth / 2 +
          borderRadius +
          progress.value * 4 * (numericWidth - 2 * borderRadius)
        : progress.value < 0.5
        ? numericWidth / 2 - borderRadius
        : progress.value < 0.75
        ? numericWidth / 2 -
          borderRadius -
          (progress.value - 0.5) * 4 * (numericWidth - 2 * borderRadius)
        : -numericWidth / 2 + borderRadius;

      const rotate = `${progress.value * 360}deg`;

      return {
        transform: [{ translateX }, { rotate }],
      };
    }
    return {};
  });

  const diagonal =
    typeof width === 'number'
      ? Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))
      : actualWidth
      ? Math.sqrt(Math.pow(actualWidth, 2) + Math.pow(height, 2))
      : 0;

  return (
    <PressableOpacity
      disabled={disabled}
      onPress={onPress}
      variant="default"
      style={[
        styles.pathContainer,
        { width, height, borderRadius, backgroundColor: pathColor },
      ]}
      onLayout={(event) => {
        const { width: layoutWidth } = event.nativeEvent.layout;
        setActualWidth(layoutWidth);
      }}
    >
      {actualWidth && (
        <Animated.View
          style={[
            styles.animatedView,
            {
              height: diagonal,
              width: sliderWidth,
            },
            animatedStyle,
          ]}
        >
          <LinearGradient
            colors={[
              `${sliderColor}02`,
              `${sliderColor}90`,
              sliderColor,
              `${sliderColor}90`,
              `${sliderColor}02`,
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1 }}
          />
          <View style={{ flex: 1, backgroundColor: pathColor }} />
        </Animated.View>
      )}
      <View
        style={[
          styles.innerContainer,
          {
            borderRadius: borderRadius - 2,
            margin: sliderHeight,
            backgroundColor: innerContainerColor || Colors[mode].primary,
          },
        ]}
      >
        {/*If you want, you can change LoaderLucide to Loader */}
        {loading ? (
          <ThemedView style={styles.loaderContainer}>
            <LoaderLucide size={20} />
          </ThemedView>
        ) : (
          children
        )}
      </View>
    </PressableOpacity>
  );
};

const styles = StyleSheet.create({
  pathContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  animatedView: {
    position: 'absolute',
  },
  innerContainer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  loaderContainer: {
    flex: FLEX.one,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimatedBorderButton;
