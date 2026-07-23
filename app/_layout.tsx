//! -- You can start with Expo Go --
// If you want to use Admob, RevenueCat, Google Sign In and Share Social, you need to create a development build.
// This won't work on Expo Go.

import 'react-native-reanimated'; // ← EN ÜSTE
import { useFonts } from 'expo-font';
import { Slot, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { SplashScreen } from 'expo-router';
import React, { useEffect } from 'react';
import { InteractionManager } from 'react-native';
import '@/i18n';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import { getUserTrackingPermission } from '@/helpers/app-functions';
import { usePushNotification } from '@/hooks/usePushNotification';
import { useTheme } from '@/hooks/theme/useTheme';
import { RootSiblingParent } from 'react-native-root-siblings';
import { AuthProvider, useAuth } from '@/context/SupabaseProvider';
import { FLEX } from '@/constants/AppConstants';

// Add built-in error handling
import { View, Text } from 'react-native';

// Simple error boundary using React's built-in error handling
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.log('Error caught by boundary:', error);
    console.log('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10, textAlign: 'center' }}>Something went wrong</Text>
          <Text style={{ color: 'red', marginBottom: 20, textAlign: 'center' }}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

import { RevenueCatProvider } from '@/context/RevenueCatProvider';

//* If you want to use Admob, uncomment the following lines 👇
import { useAdmob } from '@/hooks/useAdmob';

//* If you want to use PostHog, uncomment the following lines 👇
// import { PostHogProvider } from 'posthog-react-native';
// import { posthog } from '@/services/posthog/posthogConfig';

SplashScreen.preventAutoHideAsync();

function MainLayout() {
  usePushNotification();
  const { statusBarStyle, theme } = useTheme();

  //* If you want to use Admob, uncomment the following lines 👇
  const { initializeAdmobService } = useAdmob();

  const segments = useSegments();
  const router = useRouter();
  const { session, initialized } = useAuth();
  // Not: SpaceMono şu an hiçbir yerde render edilmiyor; arka planda yüklenmeye
  // devam eder ama splash/first-paint artık buna bağlı değil (bkz. aşağıdaki effect).
  useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
    // Add more fonts here if needed
  });

  useEffect(() => {
    // AdMob init ve ATT izin isteği ilk boyama ile yarışmasın diye
    // etkileşimler tamamlandıktan sonra çalıştırılır (açılış süresini bloklamaz).
    const task = InteractionManager.runAfterInteractions(() => {
      try {
        //* If you want to use Admob, uncomment the following lines 👇
        initializeAdmobService();
        // Dont remove it , because Apple will reject the app if this is not implemented
        // You should configure this function according to your needs.
        getUserTrackingPermission();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    });
    return () => task.cancel();
  }, []);

  useEffect(() => {
    // SpaceMono şu an UI'da kullanılmadığından splash'ı font yüklemesiyle bloklamıyoruz;
    // sadece auth hidrasyonu (initialized) bekleniyor.
    if (initialized) {
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [initialized]);

  useEffect(() => {
    if (!session && segments[0] !== '(no-auth)') {
      router.replace('/(no-auth)/onboarding');
    } else if (session && segments[0] === '(no-auth)') {
      router.replace('/(auth)');
    }
  }, [segments, router, session]);

  // Daha güvenli loading kontrolü
  if (!initialized) {
    return <Slot />;
  }

  return (
    <ThemeProvider value={theme}>
      <StatusBar
        style={statusBarStyle}
        animated={true}
      />
      <Stack initialRouteName="(auth)" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(no-auth)" />
        <Stack.Screen
          name="callback"
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

const RootLayout = () => {
  return (
    <AppErrorBoundary>
      <Provider store={store}>
        {/* <PostHogProvider client={posthog}> */}
        <AuthProvider>
          <RevenueCatProvider>
            <GestureHandlerRootView style={{ flex: FLEX.one }}>
              <BottomSheetModalProvider>
                <RootSiblingParent>
                  <MainLayout />
                </RootSiblingParent>
              </BottomSheetModalProvider>
            </GestureHandlerRootView>
          </RevenueCatProvider>
        </AuthProvider>
        {/* </PostHogProvider> */}
      </Provider>
    </AppErrorBoundary>
  );
};

export default RootLayout;
