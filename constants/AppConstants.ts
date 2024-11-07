import { Dimensions, PixelRatio } from 'react-native';

// Temel size type'ı
type BaseSize =
  | 'xxxs'
  | 'xxs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'xxl'
  | 'xxxl';

// Özel durumlar için ek type'lar

type RoundedSize = 'rounded';

// Türetilmiş size type'ları
type PaddingSize = BaseSize;
type LogoSize = BaseSize;
type ButtonHeightSize = BaseSize;
type InputHeightSize = ButtonHeightSize;
type ButtonRadiusSize = BaseSize | RoundedSize;
type BorderWidthSize = BaseSize;
type FontSize = BaseSize;
type IconSize = BaseSize;
type MarginSize = BaseSize;
type AvatarSize = BaseSize | RoundedSize;
type FlexSize = 'hide' | 'one';

// You should change for your font family
type Font = 'sm';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 375;

const scale = (size: number): number => (SCREEN_WIDTH / BASE_WIDTH) * size;

const moderateScale = (size: number, factor: number = 0.5): number => {
  const newSize = size + (scale(size) - size) * factor;
  return PixelRatio.roundToNearestPixel(newSize);
};

export const ScreenHeight: number = SCREEN_HEIGHT;
export const ScreenWidth: number = SCREEN_WIDTH;

export const PADDING: Record<PaddingSize, number> = {
  xxxs: scale(1),
  xxs: scale(2),
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(40),
  xxxl: scale(48),
};

export const LOGO_SIZE: Record<LogoSize, number> = {
  xxxs: scale(16),
  xxs: scale(24),
  xs: scale(32),
  sm: scale(40),
  md: scale(56),
  lg: scale(60),
  xl: scale(72),
  xxl: scale(96),
  xxxl: scale(128),
};

export const BUTTON_HEIGHT: Record<ButtonHeightSize, number> = {
  xxxs: scale(10),
  xxs: scale(16),
  xs: scale(32),
  sm: scale(40),
  md: scale(56),
  lg: scale(80),
  xl: scale(96),
  xxl: scale(128),
  xxxl: scale(160),
};

export const INPUT_HEIGHT: Record<InputHeightSize, number> = {
  xxxs: scale(10),
  xxs: scale(16),
  xs: scale(32),
  sm: scale(40),
  md: scale(56),
  lg: scale(80),
  xl: scale(96),
  xxl: scale(128),
  xxxl: scale(160),
};

export const BORDER_RADIUS: Record<ButtonRadiusSize, number> = {
  xxxs: scale(2),
  xxs: scale(4),
  xs: scale(8),
  sm: scale(16),
  md: scale(24),
  lg: scale(32),
  xl: scale(40),
  xxl: scale(48),
  xxxl: scale(56),
  rounded: scale(999),
};

export const BORDER_WIDTH: Record<BorderWidthSize, number> = {
  xxxs: scale(0.25),
  xxs: scale(0.5),
  xs: scale(1),
  sm: scale(2),
  md: scale(3),
  lg: scale(4),
  xl: scale(5),
  xxl: scale(6),
  xxxl: scale(7),
};

export const FONT_SIZE: Record<FontSize, number> = {
  xxxs: moderateScale(6),
  xxs: moderateScale(8),
  xs: moderateScale(10),
  sm: moderateScale(12),
  md: moderateScale(14),
  lg: moderateScale(16),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  xxxl: moderateScale(32),
};

export const ICON_SIZE: Record<IconSize, number> = {
  // You can use this icon size values for your components.
  // for example: <Icon name="home" size={ICON_SIZE.md} />
  // I generally use ICON.SIZE.sm
  xxxs: moderateScale(8),
  xxs: scale(10),
  xs: scale(16),
  sm: scale(24),
  md: scale(32),
  lg: scale(40),
  xl: scale(48),
  xxl: scale(56),
  xxxl: scale(64),
};
export const AVATAR_SIZE: Record<AvatarSize, number> = {
  xxxs: scale(16),
  xxs: scale(32),
  xs: scale(40),
  sm: scale(56),
  md: scale(64),
  lg: scale(80),
  xl: scale(96),
  xxl: scale(128),
  xxxl: scale(160),
  rounded: scale(999),
};

export const MARGIN: Record<MarginSize, number> = {
  // You can use this margin values for your components.
  // If you want to use a different margin, you can use the scale function.
  xxxs: scale(0.25),
  xxs: scale(0.5),
  xs: scale(1),
  sm: scale(2),
  md: scale(4),
  lg: scale(8),
  xl: scale(16),
  xxl: scale(24),
  xxxl: scale(32),
};

export const Z_INDEX = {
  // You can use this z-index values for your components.
  hide: -999,
  zero: 0,
  one: 1,
  top: 999,
};

export const FLEX: Record<FlexSize, number> = {
  // You can use this flex values for your components.
  hide: 0,
  one: 1,
};

export const ANIMATION_DURATION = {
  // You can use this durations for your animations.
  // For example: withTiming(1, { duration: ANIMATION_DURATION.D3 });
  // This is important for a consistency.
  D1: 100, // 100ms
  D2: 200, // 200ms
  D3: 300, // 300ms
  D4: 400, // 400ms
  D5: 500, // 500ms
  D6: 600, // 600ms
  D7: 700, // 700ms
  D8: 800, // 800ms
  D9: 900, // 900ms
  D10: 1000, // 1000ms
  D11: 1100, // 1100ms
  D12: 1200, // 1200ms
  D13: 1300, // 1300ms
  D14: 1400, // 1400ms
  D15: 1500, // 1500ms
  D20: 2000, // 2000ms
  D30: 3000, // 3000ms
  D40: 4000, // 4000ms
  D50: 5000, // 5000ms
};

export const FONT: Record<Font, string> = {
  // Implement your custom fonts here:
  // It is really easy to use with this way.
  sm: 'SpaceMono-Regular',
};
