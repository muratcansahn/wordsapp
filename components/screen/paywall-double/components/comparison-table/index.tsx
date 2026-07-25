import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/common/typography';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { BORDER_RADIUS, FONT_SIZE, ICON_SIZE, MARGIN, PADDING } from '@/constants/AppConstants';

const ROWS = [
  { labelKey: 'inAppPurchases.cards.feature1.title', free: false },
  { labelKey: 'inAppPurchases.cards.feature3.title', free: false },
] as const;

export const ComparisonTable: React.FC = () => {
  const { t } = useTranslation();
  const { mode } = useTheme();
  const colors = Colors[mode];

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.headerRow}>
        <View style={styles.labelColumn} />
        <ThemedText type="defaultSemiBold" style={[styles.columnHeader, { color: colors.text }]}>
          {t('inAppPurchases.compareFreeLabel')}
        </ThemedText>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.columnHeader, { color: colors.text }, styles.premiumColumnHeader]}
        >
          {t('inAppPurchases.comparePremiumLabel')}
        </ThemedText>
      </View>

      {ROWS.map((row) => (
        <View key={row.labelKey} style={styles.row}>
          <ThemedText style={[styles.rowLabel, { color: colors.text }]} numberOfLines={2}>
            {t(row.labelKey)}
          </ThemedText>
          <View style={styles.cell}>
            <X size={ICON_SIZE.xs} color={colors.error} />
          </View>
          <View style={[styles.cell, styles.premiumCell]}>
            <Check size={ICON_SIZE.xs} color="#333333" />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: PADDING.sm,
    paddingHorizontal: PADDING.md,
    marginTop: MARGIN.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: PADDING.sm,
  },
  labelColumn: {
    flex: 2,
  },
  columnHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.sm,
  },
  premiumColumnHeader: {
    color: '#B8860B',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: PADDING.xs,
  },
  rowLabel: {
    flex: 2,
    fontSize: FONT_SIZE.sm,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumCell: {
    backgroundColor: 'rgba(255, 206, 8, 0.18)',
    borderRadius: BORDER_RADIUS.xxxs,
    paddingVertical: 4,
  },
});
