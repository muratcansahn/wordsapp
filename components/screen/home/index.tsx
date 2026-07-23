import React, { useCallback } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import { ThemedView } from '@/components/common/view';
import { Href, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { features } from '@/components/screen/home/HomeCards';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import {
  BORDER_RADIUS,
  BUTTON_HEIGHT,
  FLEX,
  FONT_SIZE,
  ICON_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';

interface FeatureItemProps {
  icon: string;
  route: string;
  buttonColor: string;
  textColor: string;
  label: string;
}

// Grid hücresi her item için ayrı ayrı useTheme/useTranslation'a abone olmasın
// diye theme/i18n değerleri parent'tan prop olarak geçiliyor; React.memo ile
// theme/dil değişmediği sürece diğer hücrelerin gereksiz yeniden render'ı önleniyor.
const FeatureItem: React.FC<FeatureItemProps> = React.memo(
  ({ icon, route, buttonColor, textColor, label }) => {
    const handlePress = useCallback(() => {
      router.push(`/${route}` as Href);
    }, [route]);

    return (
      <ThemedView style={styles.themedView}>
        <PressableOpacity
          onPress={handlePress}
          style={[styles.gridItem, { backgroundColor: buttonColor }]}
        >
          <Ionicons
            name={icon as keyof typeof Ionicons.glyphMap}
            size={ICON_SIZE.sm}
            color={textColor}
          />
          <ThemedText style={styles.gridItemText}>{label}</ThemedText>
        </PressableOpacity>
      </ThemedView>
    );
  }
);

export default function HomeScreen() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const buttonColor = Colors[mode].button;
  const textColor = Colors[mode].text;

  const renderItem = useCallback(
    ({ item }: { item: (typeof features)[number] }) => (
      <FeatureItem
        icon={item.icon}
        route={item.route}
        buttonColor={buttonColor}
        textColor={textColor}
        label={t(item.name)}
      />
    ),
    [buttonColor, textColor, t]
  );

  const keyExtractor = useCallback((item: (typeof features)[number]) => item.id, []);

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={features}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
    padding: PADDING.sm,
  },
  gridContainer: {
    padding: PADDING.sm,
  },
  themedView: {
    flex: FLEX.one,
  },
  gridItem: {
    flex: FLEX.one,
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    alignItems: 'center',
    margin: MARGIN.md,
    height: BUTTON_HEIGHT.xl,
  },
  gridItemText: {
    marginTop: MARGIN.lg,
    textAlign: 'center',
    fontSize: FONT_SIZE.md,
  },
});
