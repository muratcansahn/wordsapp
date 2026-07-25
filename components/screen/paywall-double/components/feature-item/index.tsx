import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import { BORDER_RADIUS, FLEX, FONT_SIZE, ICON_SIZE, MARGIN } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';

interface FeatureItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const FeatureItem: React.FC<FeatureItemProps> = ({
  title,
  description,
  icon,
}) => {
  const { t } = useTranslation();
  const { mode } = useTheme();

  return (
    <View style={styles.featureButton}>
      <View style={[styles.featureIcon, { backgroundColor: Colors[mode].primary }]}>
        {icon}
      </View>
      <View style={styles.featureText}>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.featureTitle, { color: Colors[mode].text }]}
        >
          {t(title)}
        </ThemedText>
        <ThemedText
          type="default"
          style={[styles.featureDescription, { color: Colors[mode].text }]}
        >
          {t(description)}
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  featureButton: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: FLEX.one,
    marginBottom: MARGIN.lg,
  },
  featureIcon: {
    width: ICON_SIZE.lg,
    height: ICON_SIZE.lg,
    borderRadius: BORDER_RADIUS.rounded,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: MARGIN.md,
  },
  featureText: {
    flex: FLEX.one,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  featureDescription: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
    opacity: 0.65,
  },
});
