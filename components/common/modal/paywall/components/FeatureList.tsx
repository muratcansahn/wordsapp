import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FeatureItem } from '@/components/common/modal/paywall/components/featureItem';
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { ICON_SIZE, MARGIN } from '@/constants/AppConstants';

export const FeatureList: React.FC = () => {
  const features = [
    {
      title: 'inAppPurchases.cards.ua.title',
      description: 'inAppPurchases.cards.ua.description',
      icon: <Ionicons name="flash" size={ICON_SIZE.sm} color="#FFD700" />,
    },
    {
      title: 'inAppPurchases.cards.iap.title',
      description: 'inAppPurchases.cards.iap.description',
      icon: <Ionicons name="cash" size={ICON_SIZE.sm} color="#007AFF" />,
    },
    {
      title: 'inAppPurchases.cards.admob.title',
      description: 'inAppPurchases.cards.admob.description',
      icon: (
        <MaterialCommunityIcons
          name="google-ads"
          size={ICON_SIZE.sm}
          color="#Ff0000"
        />
      ),
    },
    {
      title: 'inAppPurchases.cards.pf.title',
      description: 'inAppPurchases.cards.pf.description',
      icon: (
        <MaterialIcons name="verified" size={ICON_SIZE.sm} color="#007AFF" />
      ),
    },
    {
      title: 'inAppPurchases.cards.i18n.title',
      description: 'inAppPurchases.cards.i18n.description',
      icon: (
        <Ionicons name="language-outline" size={ICON_SIZE.sm} color="gray" />
      ),
    },
    {
      title: 'inAppPurchases.cards.sentry.title',
      description: 'inAppPurchases.cards.sentry.description',
      icon: (
        <MaterialIcons
          name="workspace-premium"
          size={ICON_SIZE.sm}
          color="#00ff4e"
        />
      ),
    },
    {
      title: 'inAppPurchases.cards.cc.title',
      description: 'inAppPurchases.cards.cc.description',
      icon: <Ionicons name="build" size={ICON_SIZE.sm} color="gray" />,
    },
    {
      title: 'inAppPurchases.cards.themes.title',
      description: 'inAppPurchases.cards.themes.description',
      icon: (
        <Ionicons name="color-palette" size={ICON_SIZE.sm} color="#ff0000" />
      ),
    },
    {
      title: 'inAppPurchases.cards.notifications.title',
      description: 'inAppPurchases.cards.notifications.description',
      icon: (
        <Ionicons name="notifications" size={ICON_SIZE.sm} color="#ff0000" />
      ),
    },
    {
      title: 'inAppPurchases.cards.auth.title',
      description: 'inAppPurchases.cards.auth.description',
      icon: <Ionicons name="lock-closed" size={ICON_SIZE.sm} color="#00ff4e" />,
    },
    {
      title: 'inAppPurchases.cards.settings.title',
      description: 'inAppPurchases.cards.settings.description',
      icon: <Ionicons name="settings" size={ICON_SIZE.sm} color="gray" />,
    },

    {
      title: 'inAppPurchases.cards.ss.title',
      description: 'inAppPurchases.cards.ss.description',
      icon: <Ionicons name="share" size={ICON_SIZE.sm} color="#bb00ff" />,
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
    marginBottom: MARGIN.xs,
  },
});
