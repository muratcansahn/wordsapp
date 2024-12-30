import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import {
  LOGO_SIZE,
  MARGIN,
  FONT_SIZE,
  PADDING,
} from '@/constants/AppConstants';
import { useTranslation } from 'react-i18next';

export const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
      <ThemedText style={styles.title}>{t('inAppPurchases.title')}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: MARGIN.lg,
  },
  logo: {
    width: LOGO_SIZE.md,
    height: LOGO_SIZE.md,
    marginBottom: MARGIN.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    textAlign: 'center',
    paddingHorizontal: PADDING.lg,
    fontWeight: '900',
    lineHeight: 30,
  },
});
