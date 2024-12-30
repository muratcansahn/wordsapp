import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import React, { useEffect, useState } from 'react';
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
  const [isOpacity, setIsOpacity] = useState(false);
  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
      onPress?.(event);
    },
    [onPress]
  );

  useEffect(() => {
    if (variant === 'active') {
      setIsOpacity(true);
    }
  }, [variant]);

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
