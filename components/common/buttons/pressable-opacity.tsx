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

const PressableOpacity = ({ style, onPress, ...props }: PressableProps) => {
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
          opacity: pressed ? 0.8 : 1,
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
