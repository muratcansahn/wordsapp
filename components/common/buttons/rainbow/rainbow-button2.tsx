import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle, AccessibilityProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import {
  BUTTON_HEIGHT,
  BORDER_RADIUS,
  MARGIN,
  ScreenWidth,
  Z_INDEX,
  ANIMATION_DURATION,
} from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
interface RainbowButtonProps extends AccessibilityProps {
  onPress: () => void;
  style?: ViewStyle;
  children: React.ReactNode;
  colors?: string[];
  duration?: number;
  bgColor?: string;
  buttonStyle?: ViewStyle;
  m?: number;
  height?: number;
  borderRadius?: number;
}

export const RainbowButton2: React.FC<RainbowButtonProps> = ({
  onPress,
  style,
  children,
  colors,
  duration = ANIMATION_DURATION.D40,
  bgColor,
  buttonStyle,
  height = BUTTON_HEIGHT.md,
  borderRadius = BORDER_RADIUS.md,
  m = MARGIN.sm,
  ...accessibilityProps
}) => {
  const rotation = useSharedValue(0);
  const { mode } = useTheme();
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, [duration, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <PressableOpacity
      onPress={onPress}
      style={[style, { height: height }]}
      accessible={true}
      accessibilityRole="button"
      {...accessibilityProps}
    >
      <View
        style={[
          styles.container,
          {
            height: height,
            borderRadius: borderRadius,
          },
        ]}
      >
        <Animated.View style={[styles.colorContainer, animatedStyle]}>
          <LinearGradient
            colors={
              colors || [
                Colors[mode].primary,
                Colors[mode].backgroundSecondary,
                Colors[mode].error,
              ]
            }
            style={[styles.colorSegment]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
        <View
          style={[
            styles.button,
            {
              backgroundColor: bgColor || Colors[mode].background,
              overflow: 'hidden',
              margin: m,
              borderRadius: borderRadius - m,
            },
          ]}
        >
          {children}
        </View>
      </View>
    </PressableOpacity>
  );
};

const styles = StyleSheet.create({
  colorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    borderRadius: BORDER_RADIUS.md,
    margin: MARGIN.sm,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    height: BUTTON_HEIGHT.md,
  },
  button: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: Z_INDEX.one,
  },
  colorSegment: {
    width: ScreenWidth * 0.9,
    aspectRatio: 1,
    height: ScreenWidth * 0.9,
  },
});
