import { useEffect } from 'react';
import { Appearance } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDispatch, RootState } from '@/store';
import {
  setThemeMode,
  ThemeMode,
  updateEffectiveTheme,
} from '@/store/slices/themeSlice';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { StatusBarStyle } from 'expo-status-bar';

export const useTheme = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { mode, selectedMode } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme) {
        dispatch(setThemeMode(savedTheme as ThemeMode));
      } else {
        dispatch(setThemeMode('system'));
      }
    };

    const subscription = Appearance.addChangeListener(() => {
      if (selectedMode === 'system') {
        dispatch(updateEffectiveTheme());
      }
    });

    loadTheme();

    return () => subscription.remove();
  }, [dispatch, mode, selectedMode]);

  const theme: Theme = mode === 'dark' ? DarkTheme : DefaultTheme;

  const statusBarStyle: StatusBarStyle = mode === 'light' ? 'dark' : 'light';

  return { theme, mode, statusBarStyle, selectedMode };
};
