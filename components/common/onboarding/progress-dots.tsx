import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';

interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
}

const DOT_WIDTH = 16;
const DOT_HEIGHT = 6;
const ACTIVE_DOT_WIDTH = 36;
const ACTIVE_DOT_HEIGHT = 8;
const DOT_SPACING = 12;

const ProgressDots: React.FC<ProgressDotsProps> = ({ currentStep, totalSteps }) => {
  const { mode } = useTheme();
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const isActive = idx === currentStep;
        return (
          <Animated.View
            key={idx}
            style={[
              styles.dot,
              {
                backgroundColor: isActive ? Colors[mode].primary : Colors[mode].button,
                width: isActive ? ACTIVE_DOT_WIDTH : DOT_WIDTH,
                height: isActive ? ACTIVE_DOT_HEIGHT : DOT_HEIGHT,
                borderRadius: isActive ? ACTIVE_DOT_HEIGHT / 2 : DOT_HEIGHT / 2,
                marginHorizontal: DOT_SPACING / 2,
                opacity: isActive ? 1 : 0.6,
                transitionDuration: '250ms',
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 18,
  },
  dot: {
    // width, height, borderRadius dinamik atanıyor
  },
});

export default ProgressDots;
