import React from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  View,
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
  ANIMATION_DURATION,
  BORDER_RADIUS,
  FONT_SIZE,
  INPUT_HEIGHT,
} from '@/constants/AppConstants';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/SupabaseProvider';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AuthError } from '@supabase/supabase-js';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { useRouter } from 'expo-router';
import AnimatedBorderButton from '@/components/common/buttons/animated-border-button';
import LoaderLucide from '@/components/common/loader/loader-2';
import { BlurView } from 'expo-blur';

interface ForgotPasswordFormInputs extends FieldValues {
  password: string;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);

const NewPassword = () => {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const {
    handleError,
    showPassword,
    handleShowPassword,
    session,
    isLoading,
    setNewPassword,
  } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormInputs>({
    defaultValues: {
      password: '',
    },
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = async (data) => {
    try {
      await setNewPassword(data.password);
      reset();
    } catch (error) {
      handleError(error as AuthError);
    } finally {
      router.back();
    }
  };

  if (!session && !isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <AnimatedImage
            entering={FadeInDown.delay(ANIMATION_DURATION.D3)}
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
          />
          <ThemedText type="title" style={styles.title}>
            {t('notFound')}
          </ThemedText>
          <View style={styles.buttonContainer}>
            <AnimatedBorderButton
              borderRadius={BORDER_RADIUS.sm}
              sliderColor={Colors[mode].primary}
              innerContainerColor={Colors[mode].background}
              pathColor={Colors[mode].button}
              width={200}
              sliderWidth={50}
              sliderHeight={2}
            >
              <PressableOpacity
                onPress={() => router.back()}
                style={styles.button}
              >
                <ThemedText type="default">
                  {t('buttons.goToHomeScreen')}
                </ThemedText>
              </PressableOpacity>
            </AnimatedBorderButton>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <LoaderLucide size={20} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <AnimatedImage
            entering={FadeInDown.delay(ANIMATION_DURATION.D3)}
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
          />
          <Animated.View
            entering={FadeInDown.delay(ANIMATION_DURATION.D4)}
            style={styles.textContainer}
          >
            <ThemedText type="title" style={styles.title}>
              {t('auth.resetPassword')}
            </ThemedText>
            <ThemedText type="default" style={styles.description}>
              {t('auth.enterNewPassword')}
            </ThemedText>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(ANIMATION_DURATION.D5)}
            style={styles.formContainer}
          >
            <FormField<ForgotPasswordFormInputs>
              name="password"
              control={control}
              placeholder={t('auth.passwordPlaceholder')}
              keyboardType="default"
              secureTextEntry={showPassword}
              rightIcon={
                showPassword ? (
                  <PressableOpacity onPress={handleShowPassword}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={ICON_SIZE.sm}
                      color={Colors[mode].placeholderColor}
                    />
                  </PressableOpacity>
                ) : (
                  <PressableOpacity onPress={handleShowPassword}>
                    <Ionicons
                      name="lock-open-outline"
                      size={ICON_SIZE.sm}
                      color={Colors[mode].placeholderColor}
                    />
                  </PressableOpacity>
                )
              }
              rules={{
                required: t('auth.passwordRequired') as string,
                minLength: {
                  value: 6,
                  message: t('auth.passwordMinLength'),
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
                <BlurView intensity={100} style={styles.blurView}>
                  <View style={styles.buttonContainer}>
                    <ThemedText type="default" darkColor={Colors.dark.white}>
                      {t('buttons.send')}
                    </ThemedText>
                  </View>
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
  loadingContainer: {
    flex: FLEX.one,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: LOGO_SIZE.md,
    height: LOGO_SIZE.md,
    alignSelf: 'center',
    marginBottom: MARGIN.lg,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: MARGIN.xl,
  },
  title: {
    marginBottom: MARGIN.lg,
    textAlign: 'center',
    fontSize: FONT_SIZE.xl,
  },
  description: {
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: MARGIN.lg,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: FLEX.one,
  },
  buttonContainer: {
    flex: FLEX.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});

export default NewPassword;
