import React from 'react';
import { Platform, ScrollView } from 'react-native';
import { ThemedView } from '@/components/common/view';
import { ThemedText } from '@/components/common/typography';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ExternalLink } from '@/components/common/external-link';
import { ANIMATION_DURATION } from '@/constants/AppConstants';
import { useAuth } from '@/context/SupabaseProvider';
import { Image } from 'expo-image';
import AuthButton from '@/components/common/buttons/auth';
import { authStyles } from '@/constants/AuthStyles';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const SignUpScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { mode } = useTheme();
  const { signInWithGoogle, signInWithApple, isLoading } = useAuth();

  return (
    <ScrollView
      contentContainerStyle={authStyles.scrollViewContent}
      style={{ backgroundColor: Colors[mode].background }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <ThemedView>
        <ThemedView style={authStyles.imageTitleContainer}>
          <AnimatedImage
            entering={FadeInDown.delay(ANIMATION_DURATION.D2)}
            source={require('@/assets/images/logo.png')}
            style={authStyles.logo}
          />
          <ThemedText type="title" style={authStyles.title}>
            {t('appName')}
          </ThemedText>
        </ThemedView>

        <ThemedView style={authStyles.viewContainer}>
          {Platform.OS === 'ios' && (
            <Animated.View entering={FadeInDown.delay(ANIMATION_DURATION.D3)}>
              <AuthButton
                onPress={signInWithApple}
                icon="logo-apple"
                text={t('auth.continueWithApple')}
                disabled={isLoading}
                loading={isLoading}
              />
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(ANIMATION_DURATION.D4)}>
            <AuthButton
              onPress={signInWithGoogle}
              icon="logo-google"
              text={t('auth.continueWithGoogle')}
              disabled={isLoading}
              loading={isLoading}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(ANIMATION_DURATION.D5)}>
            <AuthButton
              onPress={() => router.push('/(no-auth)/sign-up-with-email')}
              icon="mail"
              text={t('auth.continueWithEmail')}
              disabled={isLoading}
            />
          </Animated.View>
        </ThemedView>
        <Animated.View entering={FadeInDown.delay(ANIMATION_DURATION.D6)}>
          <ExternalLink
            href="https://shipmobilefast.com/en/privacy-policy"
            style={authStyles.termsText}
          >
            <ThemedText
              type="link"
              lightColor={Colors.light.placeholderColor}
              darkColor={Colors.dark.placeholderColor}
            >
              {t('auth.termsOfService')}
            </ThemedText>
          </ExternalLink>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(ANIMATION_DURATION.D6)}>
          <PressableOpacity
            onPress={() => {
              router.push('/(no-auth)/sign-in');
            }}
            disabled={isLoading}
            style={authStyles.alreadyHaveAccount}
          >
            <ThemedText
              style={authStyles.alreadyHaveAccount}
              lightColor={Colors.light.placeholderColor}
              darkColor={Colors.dark.placeholderColor}
            >
              {t('auth.alreadyHaveAccount')}
            </ThemedText>
            <ThemedText
              type="link"
              lightColor={Colors.light.primary}
              darkColor={Colors.dark.primary}
              style={authStyles.linkText}
            >
              {t('auth.signIn')}
            </ThemedText>
          </PressableOpacity>
        </Animated.View>
      </ThemedView>
    </ScrollView>
  );
};

export default SignUpScreen;
