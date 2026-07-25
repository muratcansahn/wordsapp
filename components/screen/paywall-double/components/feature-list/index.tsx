import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FeatureItem } from '@/components/screen/paywall-double/components/feature-item';
import { ICON_SIZE, MARGIN } from '@/constants/AppConstants';
import { Ban, Calendar, BookOpen } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

const ICON_COLOR = '#333333';

export const FeatureList: React.FC = () => {
  const { t } = useTranslation();
  const features = [
    {
      title: t('inAppPurchases.cards.feature1.title'),
      description: t('inAppPurchases.cards.feature1.description'),
      icon: <Ban size={ICON_SIZE.sm} color={ICON_COLOR} />,
    },
    {
      title: t('inAppPurchases.cards.feature2.title'),
      description: t('inAppPurchases.cards.feature2.description'),
      icon: <Calendar size={ICON_SIZE.sm} color={ICON_COLOR} />,
    },
    {
      title: t('inAppPurchases.cards.feature3.title'),
      description: t('inAppPurchases.cards.feature3.description'),
      icon: <BookOpen size={ICON_SIZE.sm} color={ICON_COLOR} />,
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
    marginTop: MARGIN.lg,
    marginBottom: MARGIN.md,
  },
});
