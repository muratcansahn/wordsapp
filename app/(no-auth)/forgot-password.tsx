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
} from '../../constants/AppConstants';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/SupabaseProvider';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AuthError } from '@supabase/supabase-js';
import ShinyButton from '@/components/common/buttons/shiny-button';

interface ForgotPasswordFormInputs extends FieldValues {
  email: string;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);

const ForgotPassword = () => {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { sendNewPasswordLink, handleError } = useAuth();
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
              {t('auth.forgotPassword')}
            </ThemedText>
            <ThemedText type="default" style={styles.description}>
              {t('auth.enterEmailToResetPassword')}
            </ThemedText>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(ANIMATION_DURATION.D6)}
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
            <ShinyButton
              onPress={handleSubmit(onSubmit)}
              buttonColor={Colors[mode].primary}
              borderRadius={BORDER_RADIUS.sm}
              bgColor={Colors[mode].backgroundSecondary}
            >
              <ThemedText type="default" darkColor={Colors.dark.white}>
                {t('buttons.send')}
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
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: MARGIN.lg,
  },
});

export default ForgotPassword;
