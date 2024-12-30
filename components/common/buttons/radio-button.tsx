import React from 'react';
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  View,
  TextStyle,
  PressableProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/common/typography';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { useTheme } from '@/hooks/theme/useTheme';
import {
  BORDER_WIDTH,
  BORDER_RADIUS,
  PADDING,
  ICON_SIZE,
  FLEX,
  ANIMATION_DURATION,
} from '@/constants/AppConstants';

interface RadioButtonProps extends PressableProps {
  selected: boolean;
  onSelect: () => void;
  label: string;
  value?: string;
  description?: string;
  color?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;

  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  height?: number;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
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
  labelStyle,
  valueStyle,
  descriptionStyle,
}) => {
  const { mode } = useTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useAnimatedReaction(
    () => selected,
    (currentSelected) => {
      scale.value = withSpring(currentSelected ? 1 : 0, {
        mass: 0.5,
        damping: 12,
      });
      opacity.value = withTiming(currentSelected ? 1 : 0, {
        duration: ANIMATION_DURATION.D3,
      });
    },
    [selected]
  );

  const innerCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const primaryColor = color || Colors[mode].primary;
  const borderColor = selected ? primaryColor : Colors[mode].borderColor;

  return (
    <PressableOpacity
      style={[
        styles.container,
        style,
        {
          height,
          borderColor: selected ? primaryColor : Colors[mode].borderColor,
          backgroundColor: selected ? `${primaryColor}50` : 'transparent',
        },
      ]}
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={accessibilityLabel || label}
    >
      <View style={[styles.radioOuter, { borderColor }]}>
        <Animated.View
          style={[
            styles.radioInner,
            { backgroundColor: primaryColor },
            innerCircleStyle,
          ]}
        />
      </View>

      <View style={styles.textContainer}>
        <ThemedText type="defaultSemiBold" style={labelStyle}>
          {label}
        </ThemedText>
        {value && <ThemedText style={valueStyle}>{value}</ThemedText>}
        {description && (
          <ThemedText type="default" style={descriptionStyle}>
            {description}
          </ThemedText>
        )}
      </View>
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
    gap: PADDING.sm,
  },
  radioOuter: {
    borderRadius: BORDER_RADIUS.rounded,
    borderWidth: BORDER_WIDTH.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    height: ICON_SIZE.xxs,
    width: ICON_SIZE.xxs,
    margin: 1,
    borderRadius: BORDER_RADIUS.rounded,
  },
  textContainer: {
    flex: FLEX.one,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(RadioButton);
