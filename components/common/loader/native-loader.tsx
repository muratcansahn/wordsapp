import { ActivityIndicator } from 'react-native';
import React from 'react';
import { useTheme } from '@/hooks/theme/useTheme';
import { Colors } from '@/constants/Colors';

const Loader = ({ size = 'small' }: { size?: 'small' | 'large' }) => {
  const { mode } = useTheme();
  return <ActivityIndicator size={size} color={Colors[mode].tint} />;
};

export default Loader;
