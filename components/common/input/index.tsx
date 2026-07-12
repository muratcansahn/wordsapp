import React, { forwardRef } from 'react';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TextStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { ThemedText } from '@/components/common/typography';
import {
  BORDER_RADIUS,
  BORDER_WIDTH,
  FLEX,
  FONT_SIZE,
  INPUT_HEIGHT,
  MARGIN,
  PADDING,
  Z_INDEX,
} from '@/constants/AppConstants';

interface InputProps extends TextInputProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftIconStyle?: ViewStyle;
  rightIconStyle?: ViewStyle;
  fontSize?: number;
  fontFamily?: string;
  height?: number;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  placeholderTextColor?: string;
  selectionColor?: string;
  cursorColor?: string;
}

const Input = forwardRef<TextInput, InputProps>((props, ref) => {
  const {
    leftIcon,
    leftIconStyle,
    rightIcon,
    rightIconStyle,
    error,
    containerStyle,
    inputStyle,
    onBlur,
    onFocus,
    fontFamily,
    fontSize = FONT_SIZE.md,
    height = INPUT_HEIGHT.md,
    borderColor,
    borderWidth = BORDER_WIDTH.sm,
    borderRadius = BORDER_RADIUS.sm,
    placeholderTextColor,
    selectionColor,
    cursorColor,
    ...restProps
  } = props;

  const { mode } = useTheme();

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    onBlur?.(e);
  };

  return (
    <>
      <Animated.View
        style={[
          styles.inputContainer,
          containerStyle,
          {
            borderWidth,
            borderRadius,
            borderColor: error
              ? Colors.light.error
              : borderColor || Colors[mode].borderColor,
          },
        ]}
      >
        <View style={styles.border}>
          {leftIcon && (
            <View style={[styles.leftIcon, leftIconStyle]}>{leftIcon}</View>
          )}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              inputStyle,
              {
                color: Colors[mode].text,
                fontSize,
                fontFamily,
                height,
              },
            ]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={
              placeholderTextColor || Colors[mode].placeholderColor
            }
            selectionColor={selectionColor || Colors[mode].primary}
            cursorColor={cursorColor || Colors[mode].primary}
            autoCapitalize={restProps.autoCapitalize || 'none'}
            keyboardAppearance={mode}
            placeholder={restProps.placeholder || ''}
            clearButtonMode="while-editing"
            {...restProps}
          />
          {rightIcon && (
            <View style={[styles.rightIcon, rightIconStyle]}>{rightIcon}</View>
          )}
        </View>
      </Animated.View>
      {error && (
        <ThemedText type="default" style={styles.errorText}>
          {error}
        </ThemedText>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: Z_INDEX.hide,
    overflow: 'hidden',
    width: '100%',
  },
  rightIcon: {
    marginRight: MARGIN.lg,
  },
  leftIcon: {
    marginHorizontal: MARGIN.lg,
  },
  input: {
    flex: FLEX.one,

    paddingLeft: PADDING.md,
  },
  border: {
    flex: FLEX.one,
    height: '100%',
    zIndex: Z_INDEX.hide,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.light.error,
    marginBottom: MARGIN.md,
    alignSelf: 'flex-start',
  },
});

export default Input;
