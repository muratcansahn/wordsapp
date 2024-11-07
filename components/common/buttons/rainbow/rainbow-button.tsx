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
import { ThemedView } from '@/components/common/view';
import {
  BUTTON_HEIGHT,
  BORDER_RADIUS,
  MARGIN,
  ScreenHeight,
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
  height?: number;
  borderRadius?: number;
}

const defaultColors = ['#00ff4e', '#000'];

export const RainbowButton: React.FC<RainbowButtonProps> = ({
  onPress,
  style,
  children,
  colors = defaultColors,
  duration = ANIMATION_DURATION.D30,
  bgColor,
  buttonStyle,
  height = BUTTON_HEIGHT.md,
  borderRadius = BORDER_RADIUS.md,
  ...accessibilityProps
}) => {
  const { mode } = useTheme();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, [duration, rotation]);

  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <PressableOpacity
      onPress={onPress}
      style={[styles.container, style, { borderRadius: borderRadius }]}
      accessible={true}
      accessibilityRole="button"
      {...accessibilityProps}
    >
      <ThemedView
        style={[
          styles.button,
          buttonStyle,
          {
            borderRadius: borderRadius,
          },
        ]}
      >
        <View
          style={[
            styles.outerContainer,
            {
              height: height,
              backgroundColor: bgColor || Colors[mode].background,
              borderRadius: borderRadius,
            },
          ]}
        >
          {children}
        </View>
        <Animated.View style={[styles.bgWrapper, bgStyle]}>
          <LinearGradient
            colors={colors}
            style={styles.bgSegment}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.5 }}
          />
        </Animated.View>
      </ThemedView>
    </PressableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  bgWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: Z_INDEX.hide,
  },
  bgSegment: {
    height: ScreenHeight,
    width: ScreenWidth,
  },
  button: {
    margin: MARGIN.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  outerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
