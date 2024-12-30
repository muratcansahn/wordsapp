import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FeatureItem } from '@/components/screen/paywall-double/components/feature-item';
import { ICON_SIZE, MARGIN } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export const FeatureList: React.FC = () => {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const features = [
    {
      title: t('inAppPurchases.cards.feature1.title'),
      description: t('inAppPurchases.cards.feature1.description'),
      icon: <Check size={ICON_SIZE.sm} color={Colors[mode].text} />,
    },
    {
      title: t('inAppPurchases.cards.feature2.title'),
      description: t('inAppPurchases.cards.feature2.description'),
      icon: <Check size={ICON_SIZE.sm} color={Colors[mode].text} />,
    },
    {
      title: t('inAppPurchases.cards.feature3.title'),
      description: t('inAppPurchases.cards.feature3.description'),
      icon: <Check size={ICON_SIZE.sm} color={Colors[mode].text} />,
    },
    {
      title: t('inAppPurchases.cards.feature4.title'),
      description: t('inAppPurchases.cards.feature4.description'),
      icon: <Check size={ICON_SIZE.sm} color={Colors[mode].text} />,
    },
    {
      title: t('inAppPurchases.cards.feature5.title'),
      description: t('inAppPurchases.cards.feature5.description'),
      icon: <Check size={ICON_SIZE.sm} color={Colors[mode].text} />,
    },
  ];

  return (
    <View style={styles.featuresContainer}>
      {features.map((feature, index) => (
        <FeatureItem key={index} {...feature} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  featuresContainer: {
    width: '100%',
    marginTop: MARGIN.xl,
    marginBottom: MARGIN.md,
  },
});
