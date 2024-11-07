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
  ANIMATION_DURATION,
  BORDER_RADIUS,
  FONT_SIZE,
} from '@/constants/AppConstants';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/SupabaseProvider';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ShinyButton from '@/components/common/buttons/shiny-button';
import { AuthError } from '@supabase/supabase-js';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { useRouter } from 'expo-router';
import { RainbowButton2 } from '@/components/common/buttons/rainbow/rainbow-button2';
import LoadingScreen from '@/components/screen/loading';

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
            entering={FadeInDown.delay(ANIMATION_DURATION.D4)}
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
          />
          <ThemedText type="title" style={styles.title}>
            {t('notFound')}
          </ThemedText>
          <RainbowButton2
            onPress={() => {
              router.back();
            }}
            colors={[
              Colors[mode].button,
              Colors[mode].buttonInactive,
              Colors[mode].error,
            ]}
            bgColor={Colors[mode].background}
            borderRadius={BORDER_RADIUS.sm}
            style={{
              marginTop: MARGIN.lg,
            }}
          >
            <ThemedText type="default">
              {t('buttons.goToHomeScreen')}
            </ThemedText>
          </RainbowButton2>
        </ScrollView>
      </ThemedView>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <AnimatedImage
            entering={FadeInDown.delay(ANIMATION_DURATION.D4)}
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
          />
          <Animated.View
            entering={FadeInDown.delay(ANIMATION_DURATION.D5)}
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
            entering={FadeInDown.delay(ANIMATION_DURATION.D6)}
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
            <ShinyButton
              onPress={handleSubmit(onSubmit)}
              buttonColor={Colors[mode].primary}
              borderRadius={BORDER_RADIUS.sm}
              bgColor={Colors[mode].backgroundOpacity}
            >
              <ThemedText type="default" darkColor={Colors.light.white}>
                {t('buttons.okay')}
              </ThemedText>
            </ShinyButton>
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
    width: LOGO_SIZE.md,
    height: LOGO_SIZE.md,
    alignSelf: 'center',
    marginBottom: MARGIN.xl,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: MARGIN.xl,
  },
  title: {
    marginBottom: MARGIN.sm,
    textAlign: 'center',
    fontSize: FONT_SIZE.xxxl,
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
});

export default NewPassword;
