import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import { FONT_SIZE, MARGIN } from '@/constants/AppConstants';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';

export const TermsText: React.FC<{ price: string; period: string }> = ({
  price,
  period,
}) => {
  const { t } = useTranslation();
  return (
    <ThemedText
      type="default"
      style={[styles.termsText, { color: Colors.dark.text }]}
    >
      {t('inAppPurchases.info', {
        price,
        period,
      })}
    </ThemedText>
  );
};

const styles = StyleSheet.create({
  termsText: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginBottom: MARGIN.lg,
    marginHorizontal: MARGIN.xxl,
  },
});
