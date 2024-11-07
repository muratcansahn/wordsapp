import React from 'react';
import { StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { ThemedView } from '@/components/common/view';
import { setThemeMode, ThemeMode } from '@/store/slices/themeSlice';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { FLEX, ICON_SIZE, MARGIN, PADDING } from '@/constants/AppConstants';
import RadioButton from '@/components/common/buttons/radio-button';
import { Ionicons } from '@expo/vector-icons';

interface Theme {
  key: ThemeMode;
  icon: 'sunny-outline' | 'moon-outline' | 'phone-portrait-outline';
}

const themes: Theme[] = [
  {
    key: 'light',
    icon: 'sunny-outline',
  },
  {
    key: 'dark',
    icon: 'moon-outline',
  },
  {
    key: 'system',
    icon: 'phone-portrait-outline',
  },
];

const ThemeSettings: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedMode, mode } = useTheme();
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      {themes.map((theme) => (
        <RadioButton
          key={theme.key}
          icon={
            <Ionicons
              name={theme.icon}
              size={ICON_SIZE.sm}
              color={
                selectedMode === theme.key
                  ? Colors[mode].primary
                  : Colors[mode].text
              }
            />
          }
          label={t(`settings.theme.${theme.key}`)}
          selected={selectedMode === theme.key}
          onSelect={() => dispatch(setThemeMode(theme.key))}
          color={Colors[mode].primary}
          style={styles.themeItem}
        />
      ))}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
    padding: PADDING.sm,
  },
  themeItem: {
    marginBottom: MARGIN.md,
  },
});

export default ThemeSettings;
