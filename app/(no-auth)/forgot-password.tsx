import React from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/common/view';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/common/typography';
import { useTheme } from '@/hooks/theme/useTheme';
import FormField from '@/components/common/form-field';
import {
  ICON_SIZE,
  LOGO_SIZE,
  MARGIN,
  PADDING,
  FLEX,
  BORDER_RADIUS,
  FONT_SIZE,
  INPUT_HEIGHT,
  Z_INDEX,
  ANIMATION_DURATION,
} from '@/constants/AppConstants';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/SupabaseProvider';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AuthError } from '@supabase/supabase-js';
import AnimatedBorderButton from '@/components/common/buttons/animated-border-button';
import { BlurView } from 'expo-blur';

interface ForgotPasswordFormInputs extends FieldValues {
  email: string;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);

const ForgotPassword = () => {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { sendNewPasswordLink, handleError, isLoading } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormInputs>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = async (data) => {
    try {
      await sendNewPasswordLink(data.email);
      reset();
    } catch (error) {
      handleError(error as AuthError);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <AnimatedImage
            entering={FadeInDown.duration(ANIMATION_DURATION.D2)}
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Animated.View
            entering={FadeInDown.duration(ANIMATION_DURATION.D3)}
            style={styles.textContainer}
          >
            <ThemedText type="subtitle" style={styles.title}>
              {t('auth.forgotPassword')}
            </ThemedText>
            <ThemedText type="default" style={styles.description}>
              {t('auth.enterEmailToResetPassword')}
            </ThemedText>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(ANIMATION_DURATION.D4)}
            style={styles.formContainer}
          >
            <FormField<ForgotPasswordFormInputs>
              name="email"
              control={control}
              placeholder={t('auth.emailPlaceholder')}
              keyboardType="email-address"
              rightIcon={
                <Ionicons
                  name="mail-outline"
                  size={ICON_SIZE.sm}
                  color={Colors[mode].placeholderColor}
                />
              }
              rules={{
                required: t('auth.pleaseEnterEmail') as string,
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: t('auth.invalidEmail') as string,
                },
              }}
              containerStyle={styles.input}
              error={errors.root?.message}
            />
            <AnimatedBorderButton
              onPress={handleSubmit(onSubmit)}
              sliderColor={Colors[mode].primary}
              borderRadius={BORDER_RADIUS.sm}
              pathColor={Colors[mode].button}
              sliderHeight={4}
              width={'100%'}
              height={INPUT_HEIGHT.md}
              sliderWidth={40}
              innerContainerColor={Colors[mode].backgroundOpacity}
              loading={isLoading}
            >
              {Platform.OS === 'ios' ? (
                <BlurView intensity={100} style={styles.blurView} tint={mode}>
                  <ThemedView
                    style={styles.buttonContainer}
                    darkColor="transparent"
                    lightColor="transparent"
                  >
                    <ThemedText type="default" darkColor={Colors.dark.white}>
                      {t('buttons.send')}
                    </ThemedText>
                  </ThemedView>
                </BlurView>
              ) : (
                <ThemedView style={styles.buttonContainer}>
                  <ThemedText type="default" darkColor={Colors.dark.white}>
                    {t('buttons.send')}
                  </ThemedText>
                </ThemedView>
              )}
            </AnimatedBorderButton>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
  },
  keyboardAvoidingView: {
    flex: FLEX.one,
  },
  scrollViewContent: {
    flexGrow: FLEX.one,
    justifyContent: 'center',
    padding: PADDING.lg,
  },
  logo: {
    width: LOGO_SIZE.sm,
    height: LOGO_SIZE.sm,
    alignSelf: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: MARGIN.xl,
  },
  title: {
    marginBottom: MARGIN.sm,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    fontSize: FONT_SIZE.sm,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: MARGIN.lg,
    height: INPUT_HEIGHT.md,
  },
  buttonContainer: {
    flex: FLEX.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurView: {
    flex: FLEX.one,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: Z_INDEX.top,
  },
});

export default ForgotPassword;
