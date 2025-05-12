/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';

// My Suggestion: Do not change this file. You could be upset when you have a lot of errors. *swh

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light
) {
  // Sadece light renk döndürülüyor
  return props.light || Colors.light[colorName];
}
