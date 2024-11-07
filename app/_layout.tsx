//! --Expo Development Build Required--
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { SplashScreen } from 'expo-router';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
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

//* If you want to use RevenueCat, uncomment the following lines 👇
// import {
//   RevenueCatProvider,
//   useRevenueCat,
// } from '@/context/RevenueCatProvider';

SplashScreen.preventAutoHideAsync();

function MainLayout() {
  usePushNotification();
  const { statusBarStyle, theme } = useTheme();
  //* If you want to use RevenueCat, uncomment the following lines 👇
  // const { initializeRevenueCat } = useRevenueCat();
  const segments = useSegments();

  const router = useRouter();
  const { session, initialized } = useAuth();
  const [loaded] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
    // Add more fonts here if needed
  });

  useEffect(() => {
    // Get user tracking permission
    // This function is important for compliance with privacy regulations
    // Dont remove it , because Apple will reject the app if this is not implemented
    // You should configure this function according to your needs.
    getUserTrackingPermission();
    // If you don't need In App Purchases, remove this line and react-native-purchases package too. 👇
    //* initializeRevenueCat();
  }, []);

  useEffect(() => {
    if (loaded && initialized /* admobState.admobReady.isLoaded */) {
      SplashScreen.hideAsync();
    }
  }, [loaded, initialized /* admobState.admobReady.isLoaded */]);

  useEffect(() => {
    if (session && segments[0] === '(no-auth)') {
      router.replace('/');
    } else if (
      !session &&
      segments[0] !== '(no-auth)' &&
      segments[0] !== 'callback'
    ) {
      router.replace('/onboarding');
    }
  }, [session, segments, router]);

  if (!loaded || !initialized /* || !admobState.admobReady.isLoaded */) {
    return <Slot />;
  }

  return (
    <ThemeProvider value={theme}>
      <StatusBar style={statusBarStyle} animated={true} />
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(auth)">
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
    <Provider store={store}>
      <AuthProvider>
        {/* <RevenueCatProvider> */}
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <RootSiblingParent>
              <MainLayout />
            </RootSiblingParent>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
        {/* </RevenueCatProvider> */}
      </AuthProvider>
    </Provider>
  );
};

// If you are using Sentry, wrap your RootLayout in Sentry.wrap
// export default Sentry.wrap(RootLayout);

// or if you are not using Sentry, 👇
export default RootLayout;
