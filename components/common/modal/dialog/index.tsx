import { Modal, StyleSheet, Pressable, View, ViewStyle } from 'react-native';
import React, { useEffect, useCallback } from 'react';
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/common/typography';
import Button from '@/components/common/buttons/button';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import {
  BUTTON_HEIGHT,
  BORDER_RADIUS,
  FONT_SIZE,
  MARGIN,
  PADDING,
  FLEX,
  ANIMATION_DURATION,
  ScreenWidth,
  ScreenHeight,
} from '@/constants/AppConstants';

const Dialog = ({
  title,
  description,
  onConfirm = () => {},
  bgColor,
  children,
  rightButton,
  isLoading,
  visible,
  setVisible,
  showCancel = true,
  animationDuration = ANIMATION_DURATION.D3,
}: {
  title: string;
  description: string;
  onConfirm?: () => void;
  children: React.ReactNode;
  bgColor: string;
  rightButton: string;
  isLoading?: boolean;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  showCancel?: boolean;
  animationDuration?: number;
}) => {
  const { t } = useTranslation();
  const animationValue = useSharedValue(0);
  const { mode } = useTheme();

  const openModal = useCallback(() => {
    cancelAnimation(animationValue);
    animationValue.value = withTiming(1, {
      duration: animationDuration,
      easing: Easing.out(Easing.exp),
    });
  }, [animationDuration, animationValue]);

  const closeModal = useCallback(() => {
    cancelAnimation(animationValue);
    animationValue.value = withTiming(
      0,
      {
        duration: animationDuration,
        easing: Easing.in(Easing.exp),
      },
      (finished) => {
        if (finished) {
          runOnJS(setVisible)(false);
        }
      }
    );
  }, [animationDuration, animationValue, setVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animationValue.value,
    transform: [
      {
        scale: animationValue.value * 0.3 + 0.7,
      },
    ],
  }));

  useEffect(() => {
    if (visible) {
      openModal();
    }
  }, [visible, openModal]);

  const handleConfirm = useCallback(() => {
    onConfirm();
    closeModal();
  }, [onConfirm, closeModal]);

  return (
    <>
      {children}
      <Modal
        transparent={true}
        animationType="none"
        visible={visible}
        onRequestClose={closeModal}
        statusBarTranslucent={true}
      >
        <Pressable
          style={[
            styles.modalOverlay,
            {
              backgroundColor: Colors[mode].dialogBackdrop,
            },
          ]}
          onPress={closeModal}
        >
          <Animated.View
            style={[
              styles.dialogContainer,
              animatedStyle,
              {
                backgroundColor: bgColor,
              },
            ]}
          >
            <ThemedText type="title" style={styles.title}>
              {title}
            </ThemedText>
            <ThemedText style={styles.description}>{description}</ThemedText>
            <View style={[styles.buttonContainer, !showCancel && styles.singleButtonContainer]}>
              {showCancel && (
                <Button
                  onPress={closeModal}
                  style={styles.button}
                  bgColor={Colors[mode].backgroundOpacity}
                  disabled={isLoading}
                >
                  <ThemedText style={styles.buttonText}>
                    {t('buttons.cancel')}
                  </ThemedText>
                </Button>
              )}
              <Button
                onPress={handleConfirm}
                style={showCancel ? styles.button : { ...styles.button, ...styles.singleButton }}
                bgColor={showCancel ? Colors[mode].error : Colors[mode].primary}
                disabled={isLoading}
                loading={isLoading}
              >
                <ThemedText
                  type="default"
                  style={styles.buttonText}
                  darkColor={Colors.dark.text}
                  lightColor={Colors.dark.text}
                >
                  {rightButton || t('buttons.okay')}
                </ThemedText>
              </Button>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: FLEX.one,
    width: ScreenWidth,
    height: ScreenHeight,
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    borderRadius: BORDER_RADIUS.md,
    padding: PADDING.md,
    width: ScreenWidth - 48,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    marginBottom: MARGIN.xl,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: MARGIN.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: MARGIN.md,
  },
  singleButtonContainer: {
    justifyContent: 'center',
  },
  button: {
    flex: FLEX.one,
    marginHorizontal: MARGIN.sm,
    height: BUTTON_HEIGHT.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  singleButton: {
    flex: 0,
    width: '50%',
  },
  buttonText: {
    fontSize: FONT_SIZE.md,
  },
});

export default Dialog;
