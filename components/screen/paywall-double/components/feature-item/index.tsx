import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { FLEX, FONT_SIZE, MARGIN } from '@/constants/AppConstants';
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
  return (
    <View style={styles.featureButton}>
      <PressableOpacity onPress={() => {}} style={styles.featureContent}>
        <View style={styles.featureIcon}>{icon}</View>
        <View style={styles.featureText}>
          <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
            {t(title)}
          </ThemedText>
          <ThemedText type="default" style={styles.featureDescription}>
            {t(description)}
          </ThemedText>
        </View>
      </PressableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  featureButton: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: MARGIN.xl,
  },
  featureContent: {
    flexDirection: 'row',
    flex: FLEX.one,
    alignItems: 'center',
    
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
    color: '#FFFFFF',
  },
  featureDescription: {
    fontSize: FONT_SIZE.md,
    marginTop: MARGIN.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
