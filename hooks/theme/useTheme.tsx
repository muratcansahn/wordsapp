import { Colors } from '@/constants/Colors';

const defaultTheme = {
  dark: false,
  colors: {
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.background,
    text: Colors.light.text,
    border: Colors.light.tabIconDefault,
    notification: Colors.light.tint,
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

export const useTheme = () => {
  // Sadece light mod döndürülüyor
  return {
    theme: defaultTheme,
    mode: 'light',
    statusBarStyle: 'dark' as const,
    selectedMode: 'light',
    statusBarBackgroundColor: Colors.light.background,
  };
};
