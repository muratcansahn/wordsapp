import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ThemedView } from '@/components/common/view';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import {
  ANIMATION_DURATION,
  BORDER_RADIUS,
  BUTTON_HEIGHT,
  ICON_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';
import { MaterialIcons } from '@expo/vector-icons';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  const { mode } = useTheme();
  const isTheEnd = currentStep === totalSteps - 1;

  const progressStyle = useAnimatedStyle(() => {
    const progress = currentStep / (totalSteps - 1);
    return {
      width: withTiming(`${progress * 100}%`, {
        duration: ANIMATION_DURATION.D1,
        easing: Easing.linear,
      }),
      backgroundColor: isTheEnd ? Colors[mode].tertiary : Colors[mode].primary,
    };
  });

  const checkmarkStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isTheEnd ? 1 : 0, {
        duration: ANIMATION_DURATION.D2,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    };
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedView
        style={styles.progressContainer}
        lightColor={Colors.light.button}
        darkColor={Colors.dark.button}
      >
        <Animated.View style={[styles.progressBar, progressStyle]} />
      </ThemedView>

      <Animated.View style={[styles.checkmark, checkmarkStyle]}>
        <MaterialIcons
          name="check-circle"
          size={ICON_SIZE.xxs}
          color={Colors[mode].tertiary}
        />
      </Animated.View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: PADDING.md,
    height: BUTTON_HEIGHT.xxxs,
  },
  progressContainer: {
    width: '15%',
    borderRadius: BORDER_RADIUS.md,
  },
  progressBar: {
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
  },
  checkmark: {
    marginLeft: MARGIN.sm,
    justifyContent: 'center',
  },
});

export default ProgressBar;
