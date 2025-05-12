import { DefaultTheme } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';

export const useTheme = () => {
  // Sadece light mod döndürülüyor
  return {
    theme: DefaultTheme,
    mode: 'light',
    statusBarStyle: 'dark' as const,
    selectedMode: 'light',
    statusBarBackgroundColor: Colors.light.background,
  };
};
