import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
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
    <BlurView style={styles.featureButton} tint={'dark'} intensity={100}>
      <PressableOpacity onPress={() => {}} style={styles.featureContent}>
        <View style={styles.featureIcon}>{icon}</View>
        <View style={styles.featureText}>
          <ThemedText
            type="default"
            style={styles.featureTitle}
            lightColor={Colors.light.white}
          >
            {t(title)}
          </ThemedText>
          <ThemedText
            type="default"
            style={styles.featureDescription}
            lightColor={Colors.light.white}
          >
            {t(description)}
          </ThemedText>
        </View>
      </PressableOpacity>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  featureButton: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    paddingHorizontal: PADDING.md,
    marginBottom: MARGIN.md,
    minHeight: BUTTON_HEIGHT.lg,
    paddingVertical: PADDING.md,
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
  },
  featureDescription: {
    fontSize: FONT_SIZE.sm,
    marginTop: MARGIN.sm,
  },
});
