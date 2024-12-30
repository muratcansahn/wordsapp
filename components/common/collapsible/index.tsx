import { PropsWithChildren, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ScrollView } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import { ThemedView } from '@/components/common/view';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import {
  ANIMATION_DURATION,
  BORDER_RADIUS,
  BORDER_WIDTH,
  BUTTON_HEIGHT,
  FLEX,
  FONT_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { Minus, Plus } from 'lucide-react-native';

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { mode } = useTheme();
  const animatedHeight = useSharedValue<number>(0);
  const iconRotation = useSharedValue(0);

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${iconRotation.value}deg` }],
    };
  });

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(isOpen ? animatedHeight.value : 0, {
      duration: ANIMATION_DURATION.D3,
    }),
    overflow: 'hidden',
  }));

  const handlePress = () => {
    setIsOpen((prev) => !prev);
    iconRotation.value = withTiming(isOpen ? 0 : -180, {
      duration: ANIMATION_DURATION.D3,
    });
    animatedHeight.value = isOpen ? 0 : BUTTON_HEIGHT.sm;
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          borderColor: isOpen ? Colors[mode].primary : Colors[mode].borderColor,
        },
      ]}
    >
      <PressableOpacity style={styles.heading} onPress={handlePress}>
        <ThemedText type="default" style={styles.title}>
          {title}
        </ThemedText>
        <Animated.View style={iconStyle}>
          {isOpen ? (
            <Minus color={Colors[mode].text} style={styles.icon} />
          ) : (
            <Plus color={Colors[mode].text} style={styles.icon} />
          )}
        </Animated.View>
      </PressableOpacity>
      <Animated.View style={[styles.content, animatedStyle]}>
        <ScrollView
          style={styles.scrollView}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          <PressableOpacity onPress={handlePress}>{children}</PressableOpacity>
        </ScrollView>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: BORDER_WIDTH.sm,
    padding: PADDING.sm,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING.sm,
  },
  title: {
    flex: FLEX.one,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: PADDING.sm,
  },
  scrollView: {
    maxHeight: BUTTON_HEIGHT.xxl,
  },
  icon: {
    marginVertical: MARGIN.md,
  },
});
