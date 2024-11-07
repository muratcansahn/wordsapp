import React, { useEffect } from 'react';
import {
  StyleSheet,
  ViewStyle,
  LayoutChangeEvent,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import {
  ANIMATION_DURATION,
  BORDER_RADIUS,
  BUTTON_HEIGHT,
  FLEX,
  PADDING,
  Z_INDEX,
} from '@/constants/AppConstants';
import { ThemedText, ThemedTextProps } from '@/components/common/typography';

interface ShinyButtonProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  bgColor?: string;
  buttonStyle?: ViewStyle;
  buttonColor?: string;
  disabled?: boolean;
  loading?: boolean;
  image?: React.ReactNode;
  icon?: React.ReactNode;
  height?: number;
  width?: number | string;
  title?: string;
  titleType?: ThemedTextProps['type'];
  titleStyle?: TextStyle;
  borderRadius?: number;
}

const ShinyButton: React.FC<ShinyButtonProps> = ({
  children,
  style,
  onPress,
  bgColor,
  buttonStyle,
  buttonColor,
  disabled,
  loading,
  image,
  icon,
  title,
  titleType = 'default',
  titleStyle,
  height = BUTTON_HEIGHT.md,
  width,
  borderRadius = BORDER_RADIUS.sm,
}) => {
  const { mode } = useTheme();
  const x = useSharedValue(0);
  const buttonWidth = useSharedValue(0);

  const onButtonLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    buttonWidth.value = width;
  };

  useEffect(() => {
    x.value = 0;
    x.value = withRepeat(
      withTiming(3, { duration: ANIMATION_DURATION.D30 }),
      -1,
      false
    );
  }, [x, buttonWidth]);

  const shineStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          x.value,
          [0, 1],
          [-buttonWidth.value, buttonWidth.value * 2],
          Extrapolation.CLAMP
        ),
      },
      {
        scale: interpolate(x.value, [0, 1], [1, 1.1], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        buttonStyle,
        {
          height,
          width: width ?? '100%',
          borderRadius,
        } as ViewStyle,
      ]}
      onLayout={onButtonLayout}
    >
      <PressableOpacity
        onPress={onPress}
        style={[
          styles.button,
          {
            opacity: disabled || loading ? 0.95 : 1,
            width: width ?? '100%',
            height,
          } as ViewStyle,
        ]}
        disabled={disabled || loading}
      >
        <Animated.View
          style={[
            style,
            styles.contentContainer,
            {
              backgroundColor: bgColor || Colors[mode].background,
              borderRadius,
            },
          ]}
        >
          {image}
          {icon}
          {title && (
            <ThemedText
              type={titleType}
              style={[
                styles.title,
                titleStyle,
                icon || image ? { paddingLeft: PADDING.sm } : undefined,
              ]}
            >
              {title}
            </ThemedText>
          )}
          {children}
        </Animated.View>
      </PressableOpacity>
      <Animated.View style={[styles.shineContainer, shineStyle]}>
        <LinearGradient
          colors={[
            Colors[mode].shinyButtonBackground,
            loading
              ? Colors[mode].primary
              : buttonColor || Colors[mode].shinyButtonBorderColor,
            Colors[mode].shinyButtonBackground,
          ]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.shine}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    zIndex: Z_INDEX.one,
  },
  button: {
    padding: PADDING.xxs,
  },
  contentContainer: {
    flex: FLEX.one,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  shineContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: Z_INDEX.hide,
  },
  shine: {
    flex: FLEX.one,
    height: '100%',
    width: '100%',
  },
  title: {
    paddingLeft: PADDING.sm,
  },
});

export default ShinyButton;
