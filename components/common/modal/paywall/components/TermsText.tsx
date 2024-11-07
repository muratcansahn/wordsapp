import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import { FONT_SIZE, MARGIN } from '@/constants/AppConstants';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';

export const TermsText: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ThemedText
      type="default"
      style={styles.termsText}
      lightColor={Colors.light.placeholderColor}
      darkColor={Colors.dark.placeholderColor}
    >
      {t('inAppPurchases.terms')}
    </ThemedText>
  );
};

const styles = StyleSheet.create({
  termsText: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    marginBottom: MARGIN.lg,
  },
});
