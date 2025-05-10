import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import Button from '@/components/common/buttons/button';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { FONT_SIZE, MARGIN } from '@/constants/AppConstants';
import { LinearGradient } from 'expo-linear-gradient';

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
      bgColor={undefined}
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
    backgroundColor: '#fff', // Kart gibi beyaz zemin
    overflow: 'hidden',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    position: 'relative',
    width: '100%',
    borderWidth: 2,
    borderColor: '#F7A943',
    alignSelf: 'center',
    // Mavi gradient alt bölüm için ekstra View eklenmeli
  },

  buttonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
});

export default OnboardingSlideButton;
