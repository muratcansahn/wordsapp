import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/common/typography';
import Button from '@/components/common/buttons/button';
import {
  BUTTON_HEIGHT,
  FONT_SIZE,
  BORDER_RADIUS,
  PADDING,
  MARGIN,
} from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface PurchaseButtonProps {
  onPress: () => void;
}

export const PurchaseButton: React.FC<PurchaseButtonProps> = ({ onPress }) => {
  const { t } = useTranslation();

  return (
    <Button
      onPress={onPress}
      bgColor="transparent"
      height={BUTTON_HEIGHT.md}
      style={styles.button}
    >
      <LinearGradient
        colors={['#bb00ff', '#7d00ff', '#1a00ff']}
        style={styles.gradient}
        start={[1, 1]}
        end={[0, 0]}
      >
        <ThemedText type="subtitle" style={styles.tryButtonText}>
          {t('buttons.continue')}
        </ThemedText>
      </LinearGradient>
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: PADDING.lg,
    marginTop: MARGIN.lg,
  },
  gradient: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
  },
  tryButtonText: {
    color: Colors.light.white,
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
});
