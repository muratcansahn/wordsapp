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
} from '@/constants/AppConstants';
import { ANIMATION_DURATION } from '@/constants/AppConstants';

interface RainbowButton3Props extends AccessibilityProps {
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

const defaultColors = ['#1DB954', '#00ff4e', '#333'];

export const RainbowButton3: React.FC<RainbowButton3Props> = ({
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
  const rotation = useSharedValue(0);
  const shadowColor = useSharedValue(colors);
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, [duration, rotation, shadowColor]);

  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View>
      <PressableOpacity
        onPress={onPress}
        style={[styles.container, style, { borderRadius: borderRadius }]}
        accessible={true}
        accessibilityRole="button"
        {...accessibilityProps}
      >
        <Animated.View
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
              end={{ x: 0, y: 1 }}
              locations={[1, 0.8, 0.5]}
            />
          </Animated.View>
        </Animated.View>
      </PressableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  bgWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: Z_INDEX.hide,
  },
  bgSegment: {
    height: ScreenWidth,
    aspectRatio: 1,
    width: ScreenWidth,
    borderRadius: BORDER_RADIUS.rounded,
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
  },
});
