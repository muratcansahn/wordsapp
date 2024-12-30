import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  AccessibilityProps,
  DimensionValue,
} from 'react-native';
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

interface GlowButtonProps extends AccessibilityProps {
  onPress: () => void;
  style?: ViewStyle;
  children: React.ReactNode;
  colors?: string[];
  duration?: number;
  bgColor?: string;
  buttonStyle?: ViewStyle;
  m?: number;
  height?: number | string | DimensionValue;
  width?: number | string | DimensionValue;
  borderRadius?: number;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  onPress,
  style,
  children,
  colors,
  duration = ANIMATION_DURATION.D30,
  bgColor,
  buttonStyle,
  height = BUTTON_HEIGHT.md,
  width = BUTTON_HEIGHT.md,
  borderRadius = BORDER_RADIUS.sm,
  m = MARGIN.sm,
  containerStyle,
  disabled = false,
  ...accessibilityProps
}) => {
  const { mode } = useTheme();
  const color = colors || [
    `${Colors[mode].primary}10`,
    Colors[mode].primary,
    `${Colors[mode].primary}10`,
  ];

  const maxDimension = Math.max(
    typeof width === 'number' ? width : ScreenWidth,
    typeof height === 'number' ? height : ScreenWidth
  );
  const diagonal = Math.sqrt(2) * maxDimension;
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration,
        easing: Easing.linear,
      }),
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
      variant="active"
      style={[
        {
          height: height as DimensionValue,
          width: width as DimensionValue,
        },
        style,
      ]}
      disabled={disabled}
      accessible={true}
      accessibilityRole="button"
      {...accessibilityProps}
    >
      <View
        style={[
          styles.container,
          {
            height: height as DimensionValue,
            width: width as DimensionValue,
            borderRadius: borderRadius,
            overflow: 'hidden',
          },
          containerStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.colorContainer,
            {
              height: diagonal,
              width: diagonal,
            },
            animatedStyle,
          ]}
        >
          <LinearGradient
            colors={color as [string, string, ...string[]]}
            style={styles.colorSegment}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />
        </Animated.View>
        <View
          style={[
            styles.button,
            {
              backgroundColor: bgColor || Colors[mode].background,
              margin: m,
              borderRadius: borderRadius - m,
            },
            buttonStyle,
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
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: Z_INDEX.one,
  },
  colorSegment: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
});
