import { Colors, ThemeMode } from '@/constants/Colors';

const mode: ThemeMode = 'light';

const defaultTheme = {
  dark: false,
  colors: {
    primary: Colors[mode].tint,
    background: Colors[mode].background,
    card: Colors[mode].background,
    text: Colors[mode].text,
    border: Colors[mode].tabIconDefault,
    notification: Colors[mode].tint,
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700' as const,
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '700' as const,
    },
  },
};

type UseThemeResult = {
  theme: typeof defaultTheme;
  mode: ThemeMode;
  statusBarStyle: 'dark';
  selectedMode: ThemeMode;
  statusBarBackgroundColor: string;
};

export const useTheme = (): UseThemeResult => {
  const selectedMode: ThemeMode = mode;

  // Sadece light mod döndürülüyor
  return {
    theme: defaultTheme,
    mode: selectedMode,
    statusBarStyle: 'dark' as const,
    selectedMode,
    statusBarBackgroundColor: Colors[selectedMode].background,
  };
};
