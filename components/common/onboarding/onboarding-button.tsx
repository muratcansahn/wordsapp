import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import Button from '@/components/common/buttons/button';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { FONT_SIZE, MARGIN } from '@/constants/AppConstants';

interface OnboardingSlideButtonProps {
  onPress: () => void;
  text: string;
}

const OnboardingSlideButton: React.FC<OnboardingSlideButtonProps> = ({
  onPress,
  text,
}) => {
  const { mode } = useTheme();
  return (
    <Button
      style={styles.button}
      onPress={onPress}
      bgColor={Colors[mode].primary}
    >
      <ThemedText
        type="subtitle"
        style={styles.buttonText}
        darkColor={Colors.light.text}
        lightColor={Colors.light.text}
      >
        {text}
      </ThemedText>
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: MARGIN.xl,
  },
  buttonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
});

export default OnboardingSlideButton;
