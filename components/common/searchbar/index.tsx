import React from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TextInput,
} from 'react-native';
import { ThemedText } from '@/components/common/typography';
import { useTheme } from '@/hooks/theme/useTheme';
import { Colors } from '@/constants/Colors';

import {
  PADDING,
  FONT_SIZE,
  INPUT_HEIGHT,
  BORDER_RADIUS,
  FLEX,
  ICON_SIZE,
  ANIMATION_DURATION,
} from '@/constants/AppConstants';
import Input from '@/components/common/input';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useRef } from 'react';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onCancel?: () => void;
  placeholder?: string;
};

const Searchbar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onFocus,
  onBlur,
  onCancel,
  placeholder = 'Search',
}) => {
  const { mode } = useTheme();
  const animationProgress = useSharedValue(0);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    animationProgress.value = withTiming(1, {
      duration: ANIMATION_DURATION.D3,
    });
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    if (!value) {
      animationProgress.value = withTiming(0, {
        duration: ANIMATION_DURATION.D3,
      });
    }
    onBlur?.(e);
  };

  const handleCancel = () => {
    animationProgress.value = withTiming(0, {
      duration: ANIMATION_DURATION.D3,
    });
    onChangeText('');
    inputRef.current?.blur();
    onCancel?.();
  };

  const searchContainerStyle = useAnimatedStyle(() => {
    const width = interpolate(animationProgress.value, [0, 1], [100, 85]);
    return {
      width: `${width}%`,
    };
  });

  const cancelButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: animationProgress.value,
      transform: [
        { translateX: interpolate(animationProgress.value, [0, 1], [50, 0]) },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <AnimatedView style={searchContainerStyle}>
        <Input
          ref={inputRef}
          style={[styles.input, { color: Colors[mode].text }]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          leftIcon={
            <Ionicons
              name="search"
              size={ICON_SIZE.sm}
              color={Colors[mode].placeholderColor}
            />
          }
          placeholder={placeholder}
          placeholderTextColor={Colors[mode].placeholderColor}
          containerStyle={{
            height: INPUT_HEIGHT.sm,
            backgroundColor: Colors[mode].background,
            borderRadius: BORDER_RADIUS.lg,
          }}
        />
      </AnimatedView>
      <AnimatedPressable
        style={[styles.cancelButton, cancelButtonStyle]}
        onPress={handleCancel}
      >
        <ThemedText style={styles.cancelText}>Cancel</ThemedText>
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: PADDING.xs,
  },

  input: {
    flex: FLEX.one,
    fontSize: FONT_SIZE.md,
    height: '100%',
  },
  cancelButton: {
    marginLeft: PADDING.sm,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: FONT_SIZE.md,
  },
});

export default Searchbar;
