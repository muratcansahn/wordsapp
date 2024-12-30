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
  ICON_SIZE,
  MARGIN,
} from '@/constants/AppConstants';
import { Check } from 'lucide-react-native';

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
        duration: ANIMATION_DURATION.D3,
        easing: Easing.linear,
      }),
      backgroundColor: isTheEnd ? Colors[mode].tertiary : Colors[mode].primary,
    };
  });

  const checkmarkStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isTheEnd ? 1 : 0, {
        duration: ANIMATION_DURATION.D3,
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
        <Check size={ICON_SIZE.xxs} color={Colors[mode].background} />
      </Animated.View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: MARGIN.sm,
    marginRight: MARGIN.lg,
  },
  progressContainer: {
    width: '15%',
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
  },
  progressBar: {
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
  },
  checkmark: {
    marginLeft: MARGIN.sm,
    justifyContent: 'center',
    backgroundColor: Colors.light.tertiary,
    borderRadius: BORDER_RADIUS.lg,
  },
});

export default ProgressBar;
