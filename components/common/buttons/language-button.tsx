import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { useTheme } from '@/hooks/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import { Colors } from '@/constants/Colors';
import {
  ICON_SIZE,
  PADDING,
  MARGIN,
  BORDER_RADIUS,
  FONT_SIZE,
} from '@/constants/AppConstants';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const LanguageButton = ({
  item,
  isActive,
  onPress,
}: {
  item: { code: string; name: string; flag: string };
  isActive: boolean;
  onPress: () => void;
}) => {
  const { mode } = useTheme();
  const animatedCheckmark = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(isActive ? 1 : 0) }],
    };
  });
  return (
    <PressableOpacity
      onPress={onPress}
      style={[
        styles.languageItem,
        isActive
          ? { backgroundColor: `${Colors[mode].primary}20` }
          : { backgroundColor: Colors[mode].button },
      ]}
    >
      <Image
        source={{
          uri: `https://flagcdn.com/32x24/${item.flag.toLowerCase()}.png`,
        }}
        style={styles.flagImage}
        contentFit="contain"
      />
      <ThemedText
        type={isActive ? 'subtitle' : 'default'}
        style={styles.languageText}
      >
        {item.name}
      </ThemedText>
      <Animated.View style={[styles.checkmark, animatedCheckmark]}>
        <Ionicons
          name="checkmark-circle"
          size={ICON_SIZE.sm}
          color={Colors[mode].primary}
          style={styles.checkmark}
        />
      </Animated.View>
    </PressableOpacity>
  );
};

const styles = StyleSheet.create({
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: PADDING.md,
    marginVertical: MARGIN.md,
    borderRadius: BORDER_RADIUS.sm,
  },

  flagImage: {
    width: ICON_SIZE.sm,
    height: ICON_SIZE.sm,
    marginRight: MARGIN.lg,
  },
  checkmark: {
    marginLeft: 'auto',
  },
  languageText: {
    fontSize: FONT_SIZE.md,
  },
});

export default LanguageButton;
