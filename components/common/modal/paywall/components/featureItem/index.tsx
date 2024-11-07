import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import {
  FLEX,
  FONT_SIZE,
  MARGIN,
  PADDING,
  BUTTON_HEIGHT,
  BORDER_RADIUS,
} from '@/constants/AppConstants';
import { ThemedView } from '@/components/common/view';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';

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

  return (
    <ThemedView
      style={styles.featureButton}
      lightColor={Colors.dark.background}
    >
      <PressableOpacity onPress={() => {}} style={styles.featureContent}>
        <View style={styles.featureIcon}>{icon}</View>
        <View style={styles.featureText}>
          <ThemedText type="default" style={styles.featureTitle}>
            {t(title)}
          </ThemedText>
          <ThemedText type="default" style={styles.featureDescription}>
            {t(description)}
          </ThemedText>
        </View>
      </PressableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  featureButton: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    paddingHorizontal: PADDING.md,
    marginBottom: MARGIN.md,
    minHeight: BUTTON_HEIGHT.lg,
  },
  featureContent: {
    flexDirection: 'row',
    flex: FLEX.one,
    alignItems: 'center',
    paddingVertical: PADDING.md,
    paddingRight: PADDING.md,
  },
  featureIcon: {
    marginRight: MARGIN.lg,
  },
  featureText: {
    flex: FLEX.one,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  featureDescription: {
    fontSize: FONT_SIZE.sm,
    color: '#ccc',
    marginTop: MARGIN.sm,
  },
});
