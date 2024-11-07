import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Container from '@/components/common/container';
import { FLEX, PADDING } from '@/constants/AppConstants';
import { Header } from '@/components/common/modal/paywall/components/Header';
import { FeatureList } from '@/components/common/modal/paywall/components/FeatureList';
import { TermsText } from '@/components/common/modal/paywall/components/TermsText';
import { PurchaseButton } from '@/components/common/modal/paywall/components/PurchaseButton';
import { useRevenueCat } from '@/context/RevenueCatProvider';

export default function IOSInAppPurchases() {
  const { purchasePackage, packages } = useRevenueCat();
  const handlePurchase = () => {
    if (packages.length > 0) {
      purchasePackage(packages[0]);
    } else {
      console.log('No package available for purchase');
    }
  };

  return (
    <Container edges={['top', 'bottom']} bgColor="#000033">
      <StatusBar style="light" />
      <View style={styles.container}>
        <Header priceString={packages[0]?.product?.priceString || ''} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <FeatureList />
          <TermsText />
        </ScrollView>
      </View>
      <PurchaseButton onPress={handlePurchase} />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingHorizontal: PADDING.lg,
  },
});
