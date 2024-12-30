import React, { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Container from '@/components/common/container';
import { ThemedView } from '@/components/common/view';
import { ThemedText } from '@/components/common/typography';
import {
  ANIMATION_DURATION,
  BORDER_RADIUS,
  FLEX,
  FONT_SIZE,
  ICON_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  Bolt,
  CloudUpload,
  Infinity as InfinityIcon,
  Sparkle,
  LucideIcon,
  Sparkles,
  Download,
} from 'lucide-react-native';
import { TermsText } from '@/components/screen/paywall-single/terms-text';
import { useTranslation } from 'react-i18next';

// 1. Uncomment this:
// import { useRevenueCat } from '@/context/RevenueCatProvider';
// import LoaderLucide from '@/components/common/loader/loader-2';

interface PlanFeature {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: PlanFeature[] = [
  {
    id: 1,
    icon: Sparkles,
    title: 'inAppPurchases.cards.feature1.title',
    description: 'inAppPurchases.cards.feature1.description',
  },
  {
    id: 2,
    icon: InfinityIcon,
    title: 'inAppPurchases.cards.feature2.title',
    description: 'inAppPurchases.cards.feature2.description',
  },
  {
    id: 3,
    icon: Bolt,
    title: 'inAppPurchases.cards.feature3.title',
    description: 'inAppPurchases.cards.feature3.description',
  },
  {
    id: 4,
    icon: CloudUpload,
    title: 'inAppPurchases.cards.feature4.title',
    description: 'inAppPurchases.cards.feature4.description',
  },
  {
    id: 5,
    icon: Download,
    title: 'inAppPurchases.cards.feature5.title',
    description: 'inAppPurchases.cards.feature5.description',
  },
];

const AnimatedSparkle = Animated.createAnimatedComponent(Sparkle);

const PaywallSingle: React.FC = () => {
  const { t } = useTranslation();
  const animated = useSharedValue(0);
  const { mode } = useTheme();
  // 2. Uncomment this 👇:
  // const { packages, purchasePackage, isLoading } = useRevenueCat();

  // 3. Uncomment this 👇:
  // const handlePurchase = useCallback(() => {
  //   console.log('packages', packages[0].packageType);
  //   if (packages.length > 0) {
  //     purchasePackage(packages[0]);
  //   } else {
  //     console.error('No package available for purchase');
  //   }
  // }, [packages, purchasePackage]);

  const rotate = useAnimatedStyle(() => ({
    transform: [{ rotate: `${animated.value}deg` }],
  }));

  useEffect(() => {
    animated.value = withRepeat(
      withTiming(360, {
        duration: ANIMATION_DURATION.D20,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
      }),
      -1,
      true
    );
  }, [animated]);

  return (
    <Container bgColor={Colors[mode].background} edges={['bottom']}>
      <ThemedView
        style={{
          flex: FLEX.one,
          justifyContent: 'space-between',
          paddingHorizontal: PADDING.lg,
          paddingVertical: PADDING.md,
        }}
      >
        <ThemedView>
          <AnimatedSparkle
            size={ICON_SIZE.lg}
            color={Colors[mode].primary}
            style={[styles.icon, rotate]}
          />
          <ThemedText style={styles.title}>
            {t('inAppPurchases.title')}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {t('inAppPurchases.subtitle')}
          </ThemedText>

          <ScrollView style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <ThemedView key={index} style={styles.featureItem}>
                <ThemedView style={styles.iconContainer}>
                  <feature.icon size={22} color={Colors[mode].primary} />
                </ThemedView>
                <ThemedView style={styles.featureText}>
                  <ThemedText style={styles.featureTitle}>
                    {t(`inAppPurchases.cards.feature${feature.id}.title`)}
                  </ThemedText>
                  <ThemedText style={styles.featureDescription}>
                    {t(`inAppPurchases.cards.feature${feature.id}.description`)}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            ))}
          </ScrollView>
        </ThemedView>

        <ThemedView>
          <PressableOpacity
            style={styles.subscribeButton}
            // 4. Uncomment this 👇:
            // onPress={handlePurchase}
            // disabled={isLoading}
          >
            {/* TODO: 5. Remove this 👇: */}
            <ThemedText style={styles.subscribeButtonText}>
              {t('buttons.continue')}
            </ThemedText>
            {/* 6. Uncomment this 👇: */}
            {/* {isLoading ? (
              <LoaderLucide size={20} color={Colors.light.black} />
            ) : (
              <ThemedText style={styles.subscribeButtonText}>
                {t('buttons.continue')}
              </ThemedText>
            )} */}
          </PressableOpacity>

          <TermsText
            price={'$19.99'}
            // TODO: 7. Uncomment this 👇:
            // price={packages[0].product.priceString}
            // period={packages[0].packageType}
          />
        </ThemedView>
      </ThemedView>
    </Container>
  );
};

const styles = StyleSheet.create({
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: MARGIN.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    textAlign: 'center',
  },
  icon: {
    marginBottom: MARGIN.xl,
    alignSelf: 'center',
  },
  price: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
  },
  period: {
    fontSize: FONT_SIZE.md,
    marginLeft: MARGIN.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.lg,
    textAlign: 'center',
    marginBottom: MARGIN.xxl,
    marginTop: MARGIN.lg,
  },
  featuresContainer: {
    marginBottom: MARGIN.xxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MARGIN.xxl,
  },
  iconContainer: {
    width: ICON_SIZE.md,
    height: ICON_SIZE.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${Colors.light.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MARGIN.md,
  },
  featureText: {
    flex: FLEX.one,
  },
  featureTitle: {
    marginBottom: MARGIN.md,
    fontWeight: 'bold',
  },
  featureDescription: {
    fontSize: FONT_SIZE.sm,
  },
  subscribeButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BORDER_RADIUS.sm,
    padding: PADDING.md,
    alignItems: 'center',
    marginBottom: MARGIN.md,
  },
  subscribeButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: Colors.light.black,
  },
  terms: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: MARGIN.md,
  },
});

export default PaywallSingle;
