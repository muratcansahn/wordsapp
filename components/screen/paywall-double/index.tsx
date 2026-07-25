import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import Container from '@/components/common/container';
import {
  BORDER_RADIUS,
  BUTTON_HEIGHT,
  FLEX,
  FONT_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';
import { Header } from '@/components/screen/paywall-double/components/header';
import { FeatureList } from '@/components/screen/paywall-double/components/feature-list';
import { ComparisonTable } from '@/components/screen/paywall-double/components/comparison-table';
import { TermsText } from '@/components/screen/paywall-double/components/terms-text';
import { PurchaseButton } from '@/components/screen/paywall-double/components/purchase-button';
import RadioButton from '@/components/common/buttons/radio-button';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/common/typography';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { useRevenueCat } from '@/context/RevenueCatProvider';

const MIN_SENSIBLE_SAVINGS = 1;
const MAX_SENSIBLE_SAVINGS = 95;

export default function AndroidInAppPurchases() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<
    '$rc_monthly' | '$rc_annual'
  >('$rc_annual');

  const { packages, purchasePackage, restorePurchases, isReady, error } = useRevenueCat();

  const plans = useMemo(() => {
    const monthlyPackage = packages.find(
      (pkg) => pkg.identifier === '$rc_monthly' || pkg.packageType === 'MONTHLY'
    );
    const yearlyPackage = packages.find(
      (pkg) => pkg.identifier === '$rc_annual' || pkg.packageType === 'ANNUAL'
    );

    // Early return if packages are not available
    if (!monthlyPackage || !yearlyPackage) {
      return {
        $rc_monthly: {},
        $rc_annual: {},
      };
    }

    // Savings % must come from a real, sane comparison: annualized monthly price vs the yearly price.
    const calculateSavingsPercent = () => {
      const monthlyPricePerYear =
        monthlyPackage.product.pricePerYear ??
        (monthlyPackage.product.price ? monthlyPackage.product.price * 12 : 0);
      const yearlyPrice = yearlyPackage.product.price ?? 0;

      if (!monthlyPricePerYear || !yearlyPrice || yearlyPrice >= monthlyPricePerYear) {
        return null;
      }

      const savingsPercentage = Math.round(
        ((monthlyPricePerYear - yearlyPrice) / monthlyPricePerYear) * 100
      );

      return savingsPercentage >= MIN_SENSIBLE_SAVINGS && savingsPercentage <= MAX_SENSIBLE_SAVINGS
        ? savingsPercentage
        : null;
    };

    return {
      $rc_monthly: {
        price: monthlyPackage.product.priceString,
        period: 'month',
        id: monthlyPackage.identifier,
        package: monthlyPackage,
        pricePerMonth: monthlyPackage.product.pricePerMonthString,
      },
      $rc_annual: {
        price: yearlyPackage.product.priceString,
        period: 'year',
        id: yearlyPackage.identifier,
        package: yearlyPackage,
        pricePerMonth: yearlyPackage.product.pricePerMonthString,
        priceIfBilledMonthly: monthlyPackage.product.pricePerYearString,
        savingsPercent: calculateSavingsPercent(),
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

  const handleRestore = useCallback(async () => {
    try {
      await restorePurchases();
    } catch (error) {
      console.error('Restore failed:', error);
    }
  }, [restorePurchases]);



  return (
    <Container edges={['bottom']} bgColor={Colors[mode].background}>
      <View style={styles.container}>
        <Header />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <FeatureList />
          <ComparisonTable />
        </ScrollView>
        <View style={styles.pricingContainer}>
          {error ? (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          ) : null}
          <RadioButton
            selected={selectedPlan === '$rc_monthly'}
            onSelect={() => setSelectedPlan('$rc_monthly')}
            label={t('inAppPurchases.monthlyPlan')}
            value={plans['$rc_monthly'].price}
            description={
              plans['$rc_monthly'].pricePerMonth
                ? t('inAppPurchases.billedMonthly')
                : t('loading')
            }
            style={styles.radioButton}
            color={Colors[mode].primary}
            height={BUTTON_HEIGHT.lg}
          />
          <View style={styles.savingsContainer}>
            {plans['$rc_annual'].savingsPercent != null && (
              <PressableOpacity
                style={styles.mostPopularBadge}
                variant="active"
                onPress={() => setSelectedPlan('$rc_annual')}
              >
                <ThemedText type="defaultSemiBold" style={styles.mostPopularText}>
                  {t('inAppPurchases.mostPopular')}
                </ThemedText>
              </PressableOpacity>
            )}
            <RadioButton
              selected={selectedPlan === '$rc_annual'}
              onSelect={() => setSelectedPlan('$rc_annual')}
              label={t('inAppPurchases.yearlyPlan')}
              value={plans['$rc_annual'].price}
              description={
                plans['$rc_annual'].pricePerMonth
                  ? t('inAppPurchases.billedYearly')
                  : t('loading')
              }
              color={Colors[mode].primary}
              height={BUTTON_HEIGHT.lg}
              style={styles.yearlyRadioButton}
            />
            {plans['$rc_annual'].savingsPercent != null && (
              <View style={styles.savingsRow} pointerEvents="none">
                {plans['$rc_annual'].priceIfBilledMonthly && (
                  <ThemedText style={styles.strikethroughPrice}>
                    {plans['$rc_annual'].priceIfBilledMonthly}
                  </ThemedText>
                )}
                <View style={styles.savingsPill}>
                  <ThemedText type="defaultSemiBold" style={styles.savingsPillText}>
                    {t('inAppPurchases.bestSavings')} {plans['$rc_annual'].savingsPercent}%
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        </View>
        <View style={styles.purchaseButtonContainer}>
          <PurchaseButton onPress={handlePurchase} disabled={!isReady || !plans[selectedPlan]?.package} />
          <PressableOpacity onPress={handleRestore} style={styles.restoreButton}>
            <ThemedText style={[styles.restoreText, { color: Colors[mode].text }]}>
              {t('inAppPurchases.restorePurchases')}
            </ThemedText>
          </PressableOpacity>
        </View>
        <TermsText
          price={plans[selectedPlan]?.price || ""}
          period={plans[selectedPlan]?.period || "month"}
        />
      </View>
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
  purchaseButtonContainer: {
    marginHorizontal: MARGIN.lg,
    marginBottom: MARGIN.lg,
  },
  pricingContainer: {
    marginBottom: MARGIN.xl,
    marginHorizontal: MARGIN.xl,
  },
  radioButton: {
    marginVertical: MARGIN.md,
  },
  yearlyRadioButton: {
    marginTop: MARGIN.md,
    marginBottom: 0,
  },
  savingsContainer: {
    position: 'relative',
  },
  mostPopularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    paddingHorizontal: PADDING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    zIndex: 1,
    backgroundColor: Colors.light.primary,
  },
  mostPopularText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    textAlign: 'center',
    color: '#333333',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: PADDING.xs,
    marginTop: MARGIN.sm,
    paddingHorizontal: PADDING.xs,
  },
  strikethroughPrice: {
    fontSize: FONT_SIZE.sm,
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  savingsPill: {
    paddingHorizontal: PADDING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#E8F5E9',
  },
  savingsPillText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: '#2E7D32',
  },
  restoreButton: {
    marginTop: MARGIN.sm,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: FONT_SIZE.xs,
    textDecorationLine: 'underline',
    opacity: 0.6,
  },
  errorText: {
    color: Colors.light.error,
    marginBottom: MARGIN.sm,
    textAlign: 'center',
  },
});
