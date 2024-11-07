import { Text, type TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/theme/useThemeColor';
import { FONT_SIZE } from '@/constants/AppConstants';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'normal',
    // If you want to change the font, you can do so here.
    // App is using default font.
    // fontFamily: 'SpaceMono',
  },
  defaultSemiBold: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  title: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
  },
  link: {
    fontSize: FONT_SIZE.md,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});
