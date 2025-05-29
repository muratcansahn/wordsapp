import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import { MARGIN, PADDING } from '@/constants/AppConstants';
import { useTranslation } from 'react-i18next';

interface TermsTextProps {
  price: string;
  period: string;
}

export function TermsText({ price, period }: TermsTextProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ThemedText type="default" style={styles.text}>
        {t('İstediğiniz zaman iptal edin. Plan otomatik olarak yenilenecektir.')}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING.lg,
    marginBottom: MARGIN.lg,
  },
  text: {
    textAlign: 'center',
    opacity: 0.7,
    color: '#FFFFFF',
  },
});
