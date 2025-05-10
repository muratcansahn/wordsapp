import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
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
    <View style={styles.container}>
      <View
        style={[styles.progressContainer, { backgroundColor: Colors[mode].button }]}
      >
        <Animated.View style={[styles.progressBar, progressStyle]} />
      </View>
      {isTheEnd && (
        <Animated.View
          style={[
            styles.checkmark,
            checkmarkStyle,
            { backgroundColor: Colors[mode].tertiary },
          ]}
        >
          <Check size={ICON_SIZE.xxs} color={Colors[mode].backgroundSecondary} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: MARGIN.sm,
    marginRight: MARGIN.lg,
  },
  progressContainer: {
    width: '20%',
    height: 12,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
  },
  checkmark: {
    marginLeft: MARGIN.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    width: 16,
    height: 16,
    padding: 2,
  },
});

export default ProgressBar;
