import Ionicons from '@expo/vector-icons/Ionicons';
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
  BUTTON_HEIGHT,
  ICON_SIZE,
  MARGIN,
} from '@/constants/AppConstants';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { mode } = useTheme();
  const animatedHeight = useSharedValue<number>(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(isOpen ? animatedHeight.value : 0, {
        duration: ANIMATION_DURATION.D3,
      }),
      overflow: 'hidden',
    };
  });

  return (
    <ThemedView>
      <PressableOpacity
        style={styles.heading}
        onPress={() => {
          setIsOpen((value) => !value);
          animatedHeight.value = isOpen ? 0 : BUTTON_HEIGHT.xl;
        }}
      >
        <Ionicons
          name={isOpen ? 'chevron-down' : 'chevron-forward-outline'}
          size={ICON_SIZE.sm}
          color={Colors[mode].text}
        />
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </PressableOpacity>
      <Animated.View style={[styles.content, animatedStyle]}>
        <ScrollView
          style={{ maxHeight: BUTTON_HEIGHT.xxl }}
          nestedScrollEnabled={true}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MARGIN.lg,
  },
  content: {
    marginTop: MARGIN.sm,
    marginLeft: MARGIN.xxl,
    maxHeight: BUTTON_HEIGHT.xxl,
  },
});
