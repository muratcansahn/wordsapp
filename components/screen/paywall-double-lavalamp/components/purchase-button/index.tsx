import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS, MARGIN } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/common/typography';
import Button from '@/components/common/buttons/button';
import { useTheme } from '@/hooks/theme/useTheme';

// TODO: 1. Uncomment this 👇:
// import { useRevenueCat } from '@/context/RevenueCatProvider';
// import LoaderLucide from '@/components/common/loader/loader-2';

interface PurchaseButtonProps {
  onPress: () => void;
}

export const PurchaseButton: React.FC<PurchaseButtonProps> = ({ onPress }) => {
  const { t } = useTranslation();
  const { mode } = useTheme();

  // TODO: 2. Uncomment this 👇:
  // const { isLoading } = useRevenueCat();

  return (
    <View style={styles.container}>
      <Button
        onPress={onPress}
        bgColor={Colors[mode].primary}
        // TODO: 3. Uncomment this 👇:
        // disabled={isLoading}
      >
        {/* TODO: 4. Uncomment this 👇: */}
        {/* {isLoading ? (
          <LoaderLucide size={24} color={Colors.light.text} />
        ) : (
          <ThemedText
            type="defaultSemiBold"
            style={{ color: Colors.light.text }}
          >
            {t('buttons.continue')}
          </ThemedText>
        )} */}
        <ThemedText type="defaultSemiBold" style={{ color: Colors.light.text }}>
          {t('buttons.continue')}
        </ThemedText>
      </Button>
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
