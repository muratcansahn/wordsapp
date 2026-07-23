import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import React from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type PressableOpacityProps = PressableProps & {
  variant?: 'default' | 'active';
};

const PressableOpacity = ({
  style,
  variant = 'default',
  onPress,
  ...props
}: PressableOpacityProps) => {
  // isOpacity yalnızca variant === 'active' olduğunda true olan bir kopyaydı;
  // ayrı bir state/effect yerine doğrudan türetilen değer olarak kullanılıyor.
  const isOpacity = variant === 'active';
  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
      onPress?.(event);
    },
    [onPress]
  );

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        style as StyleProp<ViewStyle>,
        {
          opacity: isOpacity ? (pressed ? 0.8 : 1) : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
      onPress={handlePress}
    >
      {props.children}
    </Pressable>
  );
};

export default PressableOpacity;
