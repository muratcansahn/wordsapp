import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GlowButton } from '@/components/common/buttons/glow-button';
import { BORDER_RADIUS, MARGIN } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/theme/useTheme';
import { ThemedText } from '@/components/common/typography';

//* If you want to use RevenueCat, uncomment the following lines 👇
// import { useRevenueCat } from '@/context/RevenueCatProvider';
// import LoaderLucide from '@/components/common/loader/loader-2';

interface PurchaseButtonProps {
  onPress: () => void;
}

export const PurchaseButton: React.FC<PurchaseButtonProps> = ({ onPress }) => {
  const { t } = useTranslation();
  // const { isLoading } = useRevenueCat();
  const { mode } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          shadowColor: Colors[mode].primary,
        },
      ]}
    >
      <GlowButton
        onPress={onPress}
        width={'100%'}
        colors={[
          '#FFF9C4',
          '#FFF176',
          '#FFEE58',
        ]}
        bgColor={'#FFEB3B'}
        // disabled={isLoading}
        borderRadius={BORDER_RADIUS.rounded}
      >
        {/* {isLoading ? (
          <LoaderLucide size={24} color={Colors[mode].text} />
        ) : (
          <ThemedText
            type="defaultSemiBold"
            style={{ color: Colors[mode].text }}
          >
            {t('buttons.continue')}
          </ThemedText>
        )} */}
        <ThemedText type="defaultSemiBold" style={{ color: '#333333' }}>
          {t('buttons.continue')}
        </ThemedText>
      </GlowButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    marginHorizontal: MARGIN.lg,
    marginBottom: MARGIN.lg,
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
    height: '100%',
    borderRadius: BORDER_RADIUS.xs,
  },
});
