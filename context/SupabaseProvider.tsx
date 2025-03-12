import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Session, User, AuthError, UserMetadata } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import Toast from 'react-native-root-toast';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/Colors';
import { parseSupabaseUrl, showToast } from '../helpers/app-functions';
import * as Linking from 'expo-linking';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

type AuthContextType = {
  user: UserMetadata | null;
  session: Session | null;
  initialized: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  createSessionFromUrl: (url: string) => Promise<void>;
  handleShowPassword: () => void;
  isLoading: boolean;
  error: string | null;
  showPassword: boolean;
  isAuthenticated: boolean;
  handleError: (error: AuthError | Error) => void;
  sendNewPasswordLink: (email: string) => Promise<void>;
  setNewPassword: (password: string) => Promise<void>;
};

// TODO: 1.Uncomment GoogleSignin 
// !! This doesn't work on web and EXPO GO.
GoogleSignin.configure({
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { t } = useTranslation();
  const url = Linking.useURL();
  const redirectUrlVerify = Linking.createURL('callback/verify');
  const redirectUrlNewPassword = Linking.createURL('callback/new-password');

  // Kullanıcıyı Users tablosuna kaydetme fonksiyonu
  const saveUserToDatabase = useCallback(async (userData: User) => {
    try {
      // Önce kullanıcının tabloda var olup olmadığını kontrol ediyoruz
      const { data: existingUser, error: queryError } = await supabase
        .from('Users')
        .select('id')
        .eq('id', userData.id)

      if (queryError) {
        console.error('Sorgu hatası:', queryError.message);
        return;
      }

      // Kullanıcının var olup olmadığını kontrol et
      const userExists = existingUser && existingUser.length > 0;
      console.log('Kullanıcı durumu:', userExists ? 'Bulundu' : 'Bulunamadı');

      if (!userExists) {
        const { error: insertError } = await supabase
          .from('Users')
          .insert([
            {
              id: userData.id,
              full_name: userData.user_metadata?.full_name || 
                        userData.user_metadata?.name || 
                        userData.email?.split('@')[0] || 
                        'Anonim Kullanıcı',
              point: 5,
              streak_count: 1,
              last_login_datetime: new Date().toISOString(),
            },
          ]);

        if (insertError) {
          console.error('Kullanıcı ekleme hatası:', insertError);
        } else {
          console.log('Kullanıcı başarıyla eklendi');
        }
      } else {
        // Kullanıcı zaten varsa, son giriş zamanını güncelliyoruz
        const { error: updateError } = await supabase
          .from('Users')
          .update({ last_login_datetime: new Date().toISOString() })
          .eq('id', userData.id);

        if (updateError) {
          console.error('Kullanıcı güncelleme hatası:', updateError);
        } else {
          console.log('Kullanıcı son giriş zamanı güncellendi');
        }
      }
    } catch (error) {
      console.error('Kullanıcı kaydetme işlemi sırasında hata:', error);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setInitialized(true);
        setIsAuthenticated(!!session);

        // Kullanıcı giriş yaptığında veritabanına kaydet
        if (session?.user) {
          await saveUserToDatabase(session.user);
        }
      }
    );
    setIsLoading(false);

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [saveUserToDatabase]);

  const handleError = useCallback((error: AuthError | Error) => {
    console.error('Detaylı hata:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      error: JSON.stringify(error, null, 2)
    });
    setError(error.message);
    showToast(error.message, true, Colors.light.error);
  }, []);

  const handleAuthAction = useCallback(
    async (
      action: () => Promise<{
        data: { session: Session | null };
        error: AuthError | null;
      }>,
      loadingMessage: string
    ) => {
      const toast = showToast(loadingMessage, false, Colors.light.primary);
      try {
        setIsLoading(true);
        const { data, error } = await action();
        if (error) throw error;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        // Kullanıcı başarıyla giriş yaptığında veritabanına kaydet
        if (data.session?.user) {
          await saveUserToDatabase(data.session.user);
        }
      } catch (error) {
        handleError(error as AuthError);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        Toast.hide(toast);
      }
    },
    [handleError, saveUserToDatabase]
  );

  const signIn = useCallback(
    (email: string, password: string) =>
      handleAuthAction(
        async () => await supabase.auth.signInWithPassword({ email, password }),
        t('auth.signingIn')
      ),
    [handleAuthAction, t]
  );

  const signUp = useCallback(
    (email: string, password: string) =>
      handleAuthAction(
        async () => {
          try {
            console.log('Signup attempt with:', { email });
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: redirectUrlVerify,
              },
            });
            
            if (error) {
              console.error('Signup error:', {
                code: error.status,
                name: error.name,
                message: error.message,
                details: error
              });
              throw error;
            }
            
            console.log('Signup successful:', data);
            return { data: { session: data.session }, error: null };
          } catch (err) {
            console.error('Signup error caught:', err);
            throw err;
          }
        },
        t('auth.signingUp')
      ),
    [handleAuthAction, t, redirectUrlVerify]
  );

  const signOut = useCallback(async () => {
    await handleAuthAction(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { data: { session: null }, error: error };
    }, t('auth.signingOut'));
  }, [handleAuthAction, t]);

  const sendMagicLink = useCallback(
    async (email: string) => {
      await handleAuthAction(
        async () =>
          await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: redirectUrlVerify,
            },
          }),
        t('auth.sendingMagicLink')
      );
    },
    [handleAuthAction, t, redirectUrlVerify]
  );

  const sendNewPasswordLink = useCallback(
    async (email: string) => {
      await handleAuthAction(async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrlNewPassword,
        });
        return { data: { session: null }, error };
      }, t('auth.sendingResetPasswordLink'));
    },
    [handleAuthAction, t, redirectUrlNewPassword]
  );

  const signInWithGoogle = useCallback(async () => {
    console.log("Google signin başlatılıyor")
    const toast = showToast(
      t('auth.signingInWithGoogle'),
      false,
      Colors.light.primary
    );
    try {
      setIsLoading(true);
      // TODO: 2. Uncomment this :
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (idToken) {
        await handleAuthAction(
          () =>
            supabase.auth.signInWithIdToken({
              provider: 'google',
              token: idToken,
            }),
          t('auth.signingInWithGoogle')
        );
      }
    } catch (error: any) {
      handleError(error);
      console.log("Google signin hatası", error)
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      Toast.hide(toast);
    }
  }, [handleError, handleAuthAction, t]);

  const signInWithApple = useCallback(async () => {
    const toast = showToast(
      t('auth.signingInWithApple'),
      false,
      Colors.light.primary
    );
    try {
      setIsLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        throw new Error('Apple authentication failed');
      }
      await handleAuthAction(
        () =>
          supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: credential.identityToken ?? '',
          }),
        t('auth.signingInWithApple')
      );
    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsLoading(false);
      Toast.hide(toast);
    }
  }, [handleError, handleAuthAction, t]);

  const createSessionFromUrl = useCallback(
    async (url: string) => {
      setIsLoading(true);
      const parsedUrl = new URL(url.replace('#', '?'));
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: parsedUrl.searchParams.get('access_token') ?? '',
          refresh_token: parsedUrl.searchParams.get('refresh_token') ?? '',
        });
        if (error) throw error;
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          setIsAuthenticated(true);
          
          // URL'den gelen session sonrası kullanıcıyı veritabanına kaydet
          await saveUserToDatabase(data.session.user);
        }
      } catch (error) {
        handleError(error as AuthError);
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, saveUserToDatabase]
  );

  const handleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const setNewPassword = useCallback(
    async (password: string) => {
      const toast = showToast(
        t('auth.settingNewPassword'),
        false,
        Colors.light.primary
      );
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setUser(data?.user ?? null);
      } catch (error) {
        handleError(error as AuthError);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
        Toast.hide(toast);
      }
    },
    [handleError, t]
  );

  useEffect(() => {
    if (url) {
      const parsedUrl = parseSupabaseUrl(url);
      if (
        !session &&
        (parsedUrl?.queryParams?.type === 'signup' ||
          parsedUrl?.queryParams?.type === 'recovery' ||
          parsedUrl?.queryParams?.type === 'magiclink')
      ) {
        createSessionFromUrl(url);
      }
    }
  }, [url, session, createSessionFromUrl]);

  const value = {
    user,
    session,
    initialized,
    signOut,
    signIn,
    signUp,
    sendMagicLink,
    signInWithGoogle,
    signInWithApple,
    createSessionFromUrl,
    handleShowPassword,
    isLoading,
    error,
    isAuthenticated,
    showPassword,
    handleError,
    sendNewPasswordLink,
    setNewPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};