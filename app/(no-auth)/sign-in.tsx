// E-posta ile giriş kaldırıldı. Dosya boşaltıldı.
import { KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedView } from '@/components/common/view';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/common/typography';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/theme/useTheme';
import { useAuth } from '@/context/SupabaseProvider';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AuthButton from '@/components/common/buttons/auth';
import { authStyles } from '@/constants/AuthStyles';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const SignIn = () => {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const {
    isLoading,
    signInWithGoogle,
    signInWithApple,
    signInAsGuest,
  } = useAuth();

  return (
    <KeyboardAvoidingView
      style={authStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={authStyles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={authStyles.container}>
          <ThemedText style={authStyles.title}>{t('auth.signInTitle')}</ThemedText>

          <AuthButton
            icon="logo-google"
            text={t('auth.continueWithGoogle')}
            onPress={signInWithGoogle}
            disabled={isLoading}
            loading={isLoading}
          />
          {Platform.OS === 'ios' && (
            <AuthButton
              icon="logo-apple"
              text={t('auth.continueWithApple')}
              onPress={signInWithApple}
              disabled={isLoading}
              loading={isLoading}
            />
          )}
          <AuthButton
            icon="person-outline"
            text={t('auth.continueAsGuest')}
            onPress={signInAsGuest}
            disabled={isLoading}
            loading={isLoading}
          />
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;
