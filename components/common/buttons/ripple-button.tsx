import React, { useCallback, useState, memo } from 'react';
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import {
  BUTTON_HEIGHT,
  BORDER_RADIUS,
  ANIMATION_DURATION,
  MARGIN,
} from '@/constants/AppConstants';
import Loader from '@/components/common/loader/native-loader';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';

interface RippleButtonProps {
  image?: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  onPress: () => void;
  color?: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
  height?: number;
  disabled?: boolean;
  children?: React.ReactNode;
  loading?: boolean;
  duration?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  iconPosition?: 'left' | 'right';
  iconStyle?: StyleProp<ViewStyle>;
}

const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  image,
  icon,
  title,
  onPress,
  color,
  style,
  titleStyle,
  height = BUTTON_HEIGHT.md,
  disabled = false,
  loading = false,
  duration = ANIMATION_DURATION.D8,
  borderRadius = BORDER_RADIUS.md,
  iconPosition = 'left',
  iconStyle,
  ...rest
}) => {
  const { mode } = useTheme();
  const [layout, setLayout] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const rippleScale = useSharedValue<number>(0);
  const rippleOpacity = useSharedValue<number>(1);
  const rippleX = useSharedValue<number>(0);
  const rippleY = useSharedValue<number>(0);

  const resetRipple = useCallback(() => {
    rippleScale.value = 0;
    rippleOpacity.value = 1;
  }, [rippleScale, rippleOpacity]);

  const startRipple = useCallback(() => {
    rippleScale.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.ease),
    });
    rippleOpacity.value = withTiming(
      0,
      {
        duration,
        easing: Easing.out(Easing.ease),
      },
      () => {
        runOnJS(resetRipple)();
      }
    );

    runOnJS(Haptics.selectionAsync)();
    runOnJS(onPress)();
  }, [rippleScale, rippleOpacity, resetRipple, onPress, duration]);

  const gesture = Gesture.Tap()
    .enabled(!disabled)
    .onStart((event) => {
      rippleX.value = event.x;
      rippleY.value = event.y;
      runOnJS(startRipple)();
    });

  const buttonStyle = useAnimatedStyle(() => ({
    backgroundColor: `${color || Colors[mode].primary}20`,
  }));

  const rippleStyle = useAnimatedStyle(() => {
    const maxRadius = Math.max(layout.width, layout.height) / 2;
    const scale = rippleScale.value;

    return {
      position: 'absolute',
      left: rippleX.value - maxRadius,
      top: rippleY.value - maxRadius,
      width: maxRadius * 2,
      height: maxRadius * 2,
      borderRadius: maxRadius,
      backgroundColor: color || Colors[mode].primary,
      opacity: rippleOpacity.value,
      transform: [{ scale }],
    };
  });

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  }, []);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.button, buttonStyle, style, { height, borderRadius }]}
        onLayout={onLayout}
        {...rest}
      >
        {!loading && icon && iconPosition === 'left' && (
          <View style={[iconStyle, { marginRight: icon ? MARGIN.sm : 0 }]}>
            {icon}
          </View>
        )}
        {loading ? <Loader /> : children}
        {!loading && icon && iconPosition === 'right' && (
          <View style={[iconStyle, { marginLeft: icon ? MARGIN.sm : 0 }]}>
            {icon}
          </View>
        )}
        <Animated.View style={rippleStyle} />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    flexDirection: 'row',
  },
});

export default memo(RippleButton);
