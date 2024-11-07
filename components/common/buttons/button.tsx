import React from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/theme/useTheme';
import { BUTTON_HEIGHT, BORDER_RADIUS, MARGIN } from '@/constants/AppConstants';

interface ButtonProps {
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  bgColor?: string;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  borderColor?: string;
  borderWidth?: number;
  height?: number;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  style,
  bgColor,
  disabled = false,
  loading = false,
  children,
  icon,
  iconPosition = 'left',
  borderColor,
  borderWidth,
  height,
}) => {
  const { mode } = useTheme();
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size={'small'} color={Colors[mode].text} />;
    }

    const iconElement = icon ? (
      <View style={styles.iconContainer}>{icon}</View>
    ) : null;

    return (
      <>
        {iconPosition === 'left' && iconElement}
        {children}
        {iconPosition === 'right' && iconElement}
      </>
    );
  };

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.selectionAsync();
        }
        onPress();
      }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bgColor || Colors[mode].button,
          borderWidth: borderWidth || 0,
          borderColor: borderColor,
          height: height || BUTTON_HEIGHT.md,
        },

        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      {renderContent()}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  iconContainer: {
    marginHorizontal: MARGIN.sm,
  },
});

export default Button;
