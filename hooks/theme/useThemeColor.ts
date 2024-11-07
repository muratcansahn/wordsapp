/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Colors } from '@/constants/Colors';

// My Suggestion: Do not change this file. You could be upset when you have a lot of errors. *swh

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { mode } = useSelector((state: RootState) => state.theme);
  const colorFromProps = props[mode];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[mode][colorName];
  }
}
