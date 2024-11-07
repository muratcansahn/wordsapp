import React, { useEffect } from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/common/typography';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { useTheme } from '@/hooks/theme/useTheme';
import {
  BORDER_WIDTH,
  BORDER_RADIUS,
  FONT_SIZE,
  PADDING,
  ICON_SIZE,
  MARGIN,
  FLEX,
  ANIMATION_DURATION,
} from '@/constants/AppConstants';
interface RadioButtonProps {
  selected: boolean;
  onSelect: () => void;
  label: string;
  value?: string;
  description?: string;
  color?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  height?: number;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  selected,
  onSelect,
  label,
  value,
  description,
  color,
  accessibilityLabel,
  style,
  icon,
  height,
}) => {
  const { mode } = useTheme();
  const animationDuration = ANIMATION_DURATION.D4;
  const borderColor = useSharedValue<string>('transparent');
  const checkScale = useSharedValue<number>(0);
  const checkOpacity = useSharedValue<number>(0);
  const checkTranslateX = useSharedValue<number>(0);
  const textTranslateX = useSharedValue<number>(0);
  const outerOpacity = useSharedValue<number>(0);
  const outerTranslateX = useSharedValue<number>(-30);

  useEffect(() => {
    if (selected) {
      borderColor.value = withTiming(color || Colors[mode].primary, {
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
      });
      checkScale.value = withTiming(1, { duration: animationDuration });
      checkOpacity.value = withTiming(1, { duration: animationDuration });
      checkTranslateX.value = withTiming(0, {
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
      });
      textTranslateX.value = withTiming(5, {
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
      });

      outerOpacity.value = withTiming(1, {
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
      });
      outerTranslateX.value = withTiming(0, {
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
      });
    } else {
      borderColor.value = withTiming(Colors[mode].borderColor, {
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
      });
      checkScale.value = withTiming(0, { duration: animationDuration });
      checkOpacity.value = withTiming(0, { duration: animationDuration });
      checkTranslateX.value = withTiming(0, {
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
      });
      textTranslateX.value = withTiming(-30, {
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
      });

      outerOpacity.value = withTiming(0, {
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
      });
      outerTranslateX.value = withTiming(-30, {
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [
    selected,
    borderColor,
    checkScale,
    checkOpacity,
    checkTranslateX,
    textTranslateX,
    color,
    mode,
    outerOpacity,
    outerTranslateX,
    animationDuration,
  ]);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    backgroundColor: borderColor.value,
  }));

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: checkScale.value },
      { translateX: checkTranslateX.value },
    ],
    opacity: checkOpacity.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: textTranslateX.value }],
  }));

  const animatedOuterStyle = useAnimatedStyle(() => ({
    opacity: outerOpacity.value,
    transform: [{ translateX: outerTranslateX.value }],
  }));

  return (
    <PressableOpacity
      style={[
        styles.container,
        style,
        {
          height: height,
          borderColor: selected
            ? color || Colors[mode].primary
            : Colors[mode].borderColor,
        },
      ]}
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={accessibilityLabel || label}
    >
      <Animated.View
        style={[
          styles.radioOuter,
          animatedBorderStyle,
          animatedCheckStyle,
          animatedOuterStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.radioInner,
            { backgroundColor: color || Colors[mode].primary },
          ]}
        >
          <Ionicons
            name="checkmark"
            size={ICON_SIZE.xs}
            color={Colors[mode].background}
            style={styles.checkIcon}
          />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.textContainer, animatedTextStyle]}>
        <ThemedText type="defaultSemiBold">{label}</ThemedText>
        {value && <ThemedText style={styles.value}>{value}</ThemedText>}
        {description && (
          <ThemedText type="default" style={styles.description}>
            {description}
          </ThemedText>
        )}
      </Animated.View>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
    </PressableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: BORDER_WIDTH.sm,
    borderRadius: BORDER_RADIUS.md,
    padding: PADDING.md,
  },
  radioOuter: {
    height: ICON_SIZE.sm,
    width: ICON_SIZE.sm,
    borderRadius: BORDER_RADIUS.rounded,
    borderWidth: BORDER_WIDTH.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: MARGIN.sm,
  },
  radioInner: {
    height: ICON_SIZE.xs,
    width: ICON_SIZE.xs,
    borderRadius: BORDER_RADIUS.rounded,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    position: 'absolute',
  },
  textContainer: {
    flex: FLEX.one,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: FONT_SIZE.xs,
  },
  description: {
    fontSize: FONT_SIZE.sm,
  },
});

export default React.memo(RadioButton);
