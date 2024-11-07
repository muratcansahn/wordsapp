import { View, Modal, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
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
  ANIMATION_DURATION,
  FLEX,
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
  animationDuration?: number;
}) => {
  const { t } = useTranslation();
  const animationValue = useSharedValue(0);
  const { mode } = useTheme();

  const openModal = () => {
    setVisible(true);
    animationValue.value = withTiming(1, {
      duration: animationDuration,
      easing: Easing.out(Easing.exp),
    });
  };

  const closeModal = () => {
    animationValue.value = withTiming(
      0,
      {
        duration: animationDuration,
        easing: Easing.in(Easing.exp),
      },
      () => {
        runOnJS(setVisible)(false);
      }
    );
  };

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
  }, [visible]);

  return (
    <>
      {children}
      <Modal
        transparent={true}
        animationType="none"
        visible={visible}
        onRequestClose={closeModal}
      >
        <BlurView style={styles.blurContainer} tint={mode} intensity={80}>
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
            <View style={styles.buttonContainer}>
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
              <Button
                onPress={() => {
                  onConfirm();
                  closeModal();
                }}
                style={styles.button}
                bgColor={Colors[mode].error}
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
        </BlurView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: FLEX.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogContainer: {
    borderRadius: BORDER_RADIUS.md,
    padding: PADDING.md,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
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
    width: '100%',
  },
  button: {
    flex: FLEX.one,
    marginHorizontal: MARGIN.sm,
    height: BUTTON_HEIGHT.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  buttonText: {
    fontSize: FONT_SIZE.md,
  },
});

export default Dialog;
