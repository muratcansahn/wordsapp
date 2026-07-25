import React, { useState ,useMemo,useCallback} from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Text } from 'react-native';
import {
  BORDER_RADIUS,
  FLEX,
  FONT_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';
import { Header } from '@/components/screen/paywall-double/components/header';
import { FeatureList } from '@/components/screen/paywall-double/components/feature-list';
import { TermsText } from '@/components/screen/paywall-double/components/terms-text';
import { PurchaseButton } from '@/components/screen/paywall-double/components/purchase-button';

import { useRevenueCat } from '@/context/RevenueCatProvider';
import WaveBackground from '@/components/screen/paywall-double/components/wave-background';

export default function IOSInAppPurchases() {
  const [selectedPlan, setSelectedPlan] = useState<
    '$rc_monthly' | '$rc_annual' | '$rc_lifetime'
  >('$rc_annual');

  const { packages, purchasePackage, isReady } = useRevenueCat();

  const plans = useMemo(() => {
    const monthlyPackage = packages.find(
      (pkg) => pkg.identifier === '$rc_monthly' || pkg.packageType === 'MONTHLY'
    );
    const yearlyPackage = packages.find(
      (pkg) => pkg.identifier === '$rc_annual' || pkg.packageType === 'ANNUAL'
    );
    const lifetimePackage = packages.find(
      (pkg) => pkg.identifier === '$rc_lifetime' || pkg.packageType === 'LIFETIME'
    );

    if (!monthlyPackage || !yearlyPackage) {
      return {
        $rc_monthly: {},
        $rc_annual: {},
        $rc_lifetime: {},
      };
    }

    const calculateSavings = () => {
      const monthlyPricePerYear = monthlyPackage.product.pricePerYear ?? 0;
      const yearlyPrice = yearlyPackage.product.price ?? 0;

      if (monthlyPricePerYear === 0 || yearlyPrice === 0) {
        return null;
      }

      const savingsPercentage = Math.round(
        ((monthlyPricePerYear - yearlyPrice) / monthlyPricePerYear) * 100
      );

      return savingsPercentage > 0 ? `Save ${savingsPercentage}%` : null;
    };

    return {
      $rc_monthly: {
        price: monthlyPackage.product.priceString || "$9.99",
        period: 'month',
        id: monthlyPackage.identifier,
        package: monthlyPackage,
        pricePerMonth: monthlyPackage.product.pricePerMonthString || "$9.99",
        days: 30,
      },
      $rc_annual: {
        price: yearlyPackage.product.priceString || "$69.99",
        period: 'year',
        id: yearlyPackage.identifier,
        package: yearlyPackage,
        pricePerMonth: yearlyPackage.product.pricePerMonthString || "$5.83",
        savings: calculateSavings(),
        months: 12,
      },
      $rc_lifetime: {
        price: lifetimePackage?.product.priceString || "$119.99",
        period: 'lifetime',
        id: lifetimePackage?.identifier || "$rc_lifetime",
        package: lifetimePackage,
        pricePerMonth: "",
        lifetime: true,
      },
    };
  }, [packages]);

  const handlePurchase = useCallback(async () => {
    const selectedPackage = plans[selectedPlan]?.package;

    if (!selectedPackage) {
      console.error('Selected package not available');
      return;
    }

    try {
      await purchasePackage(selectedPackage);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  }, [selectedPlan, plans, purchasePackage]);

  return (
    <WaveBackground edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        <Header />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <FeatureList />
        </ScrollView>
        <View style={styles.pricingContainer}>
          <View style={styles.subscriptionOptionsContainer}>
            <TouchableOpacity 
              style={[styles.subscriptionOption, selectedPlan === '$rc_monthly' && styles.selectedOption]}
              onPress={() => setSelectedPlan('$rc_monthly')}
            >
              <Text style={[styles.daysText, selectedPlan === '$rc_monthly' && styles.selectedText]}>
                30
              </Text>
              <Text style={[styles.periodText, selectedPlan === '$rc_monthly' && styles.selectedText]}>
                DAYS
              </Text>
              <Text style={[styles.priceText, selectedPlan === '$rc_monthly' && styles.selectedText]}>
                {plans['$rc_monthly'].price || "$9.99"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.subscriptionOption, selectedPlan === '$rc_annual' && styles.selectedOption]}
              onPress={() => setSelectedPlan('$rc_annual')}
            >
              <Text style={[styles.daysText, selectedPlan === '$rc_annual' && styles.selectedText]}>
                12
              </Text>
              <Text style={[styles.periodText, selectedPlan === '$rc_annual' && styles.selectedText]}>
                MONTHS
              </Text>
              <Text style={[styles.priceText, selectedPlan === '$rc_annual' && styles.selectedText]}>
                {plans['$rc_annual'].price || "$69.99"}
              </Text>
              {plans['$rc_annual'].savings && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsBadgeText}>
                    ✓
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.subscriptionOption, selectedPlan === '$rc_lifetime' && styles.selectedOption]}
              onPress={() => setSelectedPlan('$rc_lifetime')}
            >
              <Text style={[styles.daysText, selectedPlan === '$rc_lifetime' && styles.selectedText]}>
                ∞
              </Text>
              <Text style={[styles.periodText, selectedPlan === '$rc_lifetime' && styles.selectedText]}>
                LIFETIME
              </Text>
              <Text style={[styles.priceText, selectedPlan === '$rc_lifetime' && styles.selectedText]}>
                {plans['$rc_lifetime'].price || "$119.99"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.purchaseButtonContainer}>
          <PurchaseButton onPress={handlePurchase} disabled={!isReady || !plans[selectedPlan]?.package} />
        </View>
        <TermsText
          price={plans[selectedPlan]?.price ?? ''}
          period={plans[selectedPlan]?.period ?? ''}
        />
      </View>
    </WaveBackground>
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
  purchaseButtonContainer: {
    marginHorizontal: MARGIN.lg,
    marginBottom: MARGIN.lg,
  },
  pricingContainer: {
    marginBottom: MARGIN.xl,
    marginHorizontal: MARGIN.xl,
  },
  subscriptionOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: MARGIN.lg,
  },
  subscriptionOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.md,
    padding: PADDING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    height: 130,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: '#F7A943',
    borderWidth: 2,
  },
  daysText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: '#FFF',
  },
  periodText: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginVertical: 5,
  },
  priceText: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: '#FFF',
  },
  selectedText: {
    color: '#FFF',
  },
  savingsBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingsBadgeText: {
    color: '#FFF',
    fontSize: FONT_SIZE.xs,
    fontWeight: 'bold',
  },
});
