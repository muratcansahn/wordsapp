import { View, type ViewProps } from 'react-native';
import { Colors } from '@/constants/Colors';

import { useThemeColor } from '@/hooks/theme/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  // Sadece light modda çalışacak şekilde sadeleştirildi
  const backgroundColor = lightColor || Colors.light.background;
  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
