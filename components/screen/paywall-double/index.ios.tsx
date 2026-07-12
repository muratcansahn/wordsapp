import React, { useState ,useMemo,useCallback} from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Text, StatusBar } from 'react-native';
import Container from '@/components/common/container';
import {
  BORDER_RADIUS,
  BUTTON_HEIGHT,
  FLEX,
  FONT_SIZE,
  MARGIN,
  PADDING,
  Z_INDEX,
} from '@/constants/AppConstants';
import { Header } from '@/components/screen/paywall-double/components/header';
import { FeatureList } from '@/components/screen/paywall-double/components/feature-list';
import { TermsText } from '@/components/screen/paywall-double/components/terms-text';
import { PurchaseButton } from '@/components/screen/paywall-double/components/purchase-button';
import RadioButton from '@/components/common/buttons/radio-button';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';

// 1. Uncomment: 👇
import { ThemedText } from '@/components/common/typography';
// import { useRevenueCat } from '@/context/RevenueCatProvider';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import WaveBackground from '@/components/screen/paywall-double/components/wave-background';

export default function IOSInAppPurchases() {
  const { mode } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<
    '$rc_monthly' | '$rc_annual' | '$rc_lifetime'
  >('$rc_annual');

  // 2. Uncomment: 👇
  // const { packages, purchasePackage } = useRevenueCat();
  const packages: any[] = [];
  const purchasePackage = async (..._args: any[]) => {};

  // // 3. Uncomment plans: 👇
  const plans = useMemo(() => {
    const monthlyPackage = packages.find(
      (pkg) => pkg.identifier === '$rc_monthly'
    );
    const yearlyPackage = packages.find(
      (pkg) => pkg.identifier === '$rc_annual'
    );
    const lifetimePackage = packages.find(
      (pkg) => pkg.identifier === '$rc_lifetime'
    );

  //   // Early return if packages are not available
    if (!monthlyPackage || !yearlyPackage) {
      return {
        $rc_monthly: {},
        $rc_annual: {},
        $rc_lifetime: {},
      };
    }

  //   // Safely calculate savings percentage
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

  // TODO: Uncomment this 👇:
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

  // Delete this function 👇:
  // const handlePurchase = () => {
  //   console.log('Purchase');
  // };

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
          <PurchaseButton onPress={handlePurchase} />
        </View>
        <TermsText
          // TODO: Remove this 👇:
          price="$7.99" // TODO: Remove this
          period="year" // TODO: Remove this
          // TODO: Uncomment this 👇:
          //   price={plans[selectedPlan]?.price ?? ''}
          //   period={plans[selectedPlan]?.period ?? ''}
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
  radioButton: {
    marginVertical: MARGIN.md,
  },
  savingsContainer: {
    position: 'relative',
  },
  savingsView: {
    position: 'absolute',
    top: 15,
    right: 12,
    paddingHorizontal: PADDING.sm,
    paddingVertical: PADDING.xs,
    borderRadius: BORDER_RADIUS.sm,
    zIndex: Z_INDEX.top,
    backgroundColor: Colors.light.purple,
  },
  savingsText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: Colors.dark.text,
    textAlign: 'center',
  },
});
