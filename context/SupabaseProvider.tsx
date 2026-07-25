import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { Session, User, AuthError, UserMetadata } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import Toast from 'react-native-root-toast';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/Colors';
import { parseSupabaseUrl, showToast } from '../helpers/app-functions';
import * as Linking from 'expo-linking';
import { useDispatch } from 'react-redux';
import { 
  setReduxUser, 
  clearReduxUser,
  updateUserStats 
} from '../store/userSlice';
import { checkAndUpdateGameRequests } from '@/services/gameRequestServices';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

type AuthContextType = {
  user: UserMetadata | null;
  session: Session | null;
  initialized: boolean;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  createSessionFromUrl: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  handleError: (error: AuthError | Error) => void;
};

// TODO: 1.Uncomment GoogleSignin
// !! This doesn't work on web and EXPO GO.
const androidGoogleClientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_ANDROID_CLIENT_ID;
if (!androidGoogleClientId) {
  console.warn('EXPO_PUBLIC_GOOGLE_OAUTH_ANDROID_CLIENT_ID is not configured');
}

// Boot sırasında native modülü tetiklememek için configure() ilk Google
// girişi denendiğinde bir kez çalıştırılır (bkz. signInWithGoogle).
let googleSigninConfigured = false;
const ensureGoogleSigninConfigured = () => {
  if (googleSigninConfigured) return;
  GoogleSignin.configure({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID,
    // Keep androidGoogleClientId available for native Android OAuth setup.
    // @react-native-google-signin/google-signin does not accept androidClientId in configure().
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
  });
  googleSigninConfigured = true;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { t } = useTranslation();
  const url = Linking.useURL();
  const redirectUrlVerify = Linking.createURL('callback/verify');
  const redirectUrlNewPassword = Linking.createURL('callback/new-password');
  const dispatch = useDispatch();


  // Kullanıcıyı Users tablosuna kaydetme fonksiyonu
  const saveUserToDatabase = useCallback(async (userData: User) => {
    try {
      const now = new Date();
  
      // Kullanıcının veritabanında olup olmadığını kontrol et
      const { data: existingUser, error: queryError } = await supabase
        .from('Users')
        .select('id, last_streak_date, streak_count')
        .eq('id', userData.id)
        .single();
  
      if (queryError && queryError.code !== 'PGRST116') {
        console.error('Sorgu hatası:', queryError.message);
        return;
      }
  
      // Yeni kullanıcıysa
      if (queryError && queryError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('Users')
          .insert([
            {
              id: userData.id,
              full_name:
                userData.user_metadata?.full_name ||
                userData.user_metadata?.name ||
                userData.email?.split('@')[0] ||
                'Anonim Kullanıcı',
              point: 5,
              streak_count: 1,
              last_streak_date: now.toISOString(),
              last_login_datetime: now.toISOString(),
            },
          ]);
  
        if (insertError) {
          console.error('Kullanıcı ekleme hatası:', insertError);
          return;
        } else {
          console.log('Kullanıcı başarıyla eklendi');
        }

        // Yeni kullanıcı için UserGameRequestDates tablosuna kayıt ekle
        // Önce kaydın var olup olmadığını kontrol edelim
        const currentDate = now.toISOString();
        
        try {
          const { data: existingGameRequest, error: checkError } = await supabase
            .from('UserGameRequestDates')
            .select('user_id')
            .eq('user_id', userData.id)
            .maybeSingle(); // single yerine maybeSingle kullanarak hata oluşmasını engelleriz
          
          if (checkError && checkError.code !== 'PGRST116') {
            console.error('UserGameRequestDates kontrol hatası:', checkError);
          }
          
          // Kayıt yoksa ekleme yapalım
          if (!existingGameRequest) {
            let retryCount = 0;
            let inserted = false;
            
            // Maksimum 3 deneme yapalım
            while (retryCount < 3 && !inserted) {
              const { error: gameRequestError } = await supabase
                .from('UserGameRequestDates')
                .insert([
                  {
                    user_id: userData.id,
                    wordguess: currentDate,
                    wordmatching: currentDate,
                    wordguess_remaining: 2,
                    wordmatching_remaining: 2,
                    skipped_wordlist_ids: [] // Boş array olarak başlat
                  },
                ]);
    
              if (gameRequestError) {
                console.error(`UserGameRequestDates ekleme hatası (Deneme ${retryCount + 1}/3):`, gameRequestError);
                retryCount++;
                // Kısa bir bekleme ekleyelim
                await new Promise(resolve => setTimeout(resolve, 500));
              } else {
                console.log('UserGameRequestDates kaydı başarıyla oluşturuldu');
                inserted = true;
              }
            }
            
            if (!inserted) {
              console.error('UserGameRequestDates kaydı 3 denemeden sonra başarısız oldu');
            }
          } else {
            console.log('UserGameRequestDates kaydı zaten mevcut');
          }
        } catch (gameRequestCatchError) {
          console.error('UserGameRequestDates işleminde beklenmeyen hata:', gameRequestCatchError);
        }
        
        // Kullanıcı ve oyun hakları kayıtları başarıyla oluşturuldu, şimdi oyun haklarını kontrol edebiliriz
        try {
          await checkAndUpdateGameRequests(userData.id);
          console.log('Yeni kullanıcı için oyun hakları kontrol edildi ve güncellendi');
        } catch (e) {
          console.warn('Oyun hakları güncellenemedi:', e);
        }
        
        return;
      }
  
      // Mevcut kullanıcı için streak hesaplama
      if (!existingUser) return;
      let newStreakCount = existingUser.streak_count || 0;
      let shouldUpdateStreakDate = false;
      let hoursDifference = 0;
  
      const lastStreakDate = existingUser.last_streak_date
        ? new Date(existingUser.last_streak_date)
        : null;
  
      if (!lastStreakDate) {
        newStreakCount = 1;
        shouldUpdateStreakDate = true;
      } else {
        hoursDifference = (now.getTime() - lastStreakDate.getTime()) / (1000 * 60 * 60);
  
        if (hoursDifference < 24) {
          shouldUpdateStreakDate = false;
          console.log('24 saatten az süre geçmiş, streak korunuyor:', newStreakCount);
        } else if (hoursDifference < 48) {
          newStreakCount += 1;
          shouldUpdateStreakDate = true;
          console.log('24-48 saat arası giriş, streak artıyor:', newStreakCount);
        } else {
          newStreakCount = 1;
          shouldUpdateStreakDate = true;
          console.log('48 saatten fazla süre geçmiş, streak sıfırlanıyor');
        }
      }
  
      const updateData: Record<string, any> = {
        last_login_datetime: now.toISOString(),
        streak_count: newStreakCount,
      };
  
      if (shouldUpdateStreakDate) {
        updateData.last_streak_date = now.toISOString();
        console.log('Streak tarihi güncelleniyor:', now.toISOString());
      }
  
      const { error: updateError } = await supabase
        .from('Users')
        .update(updateData)
        .eq('id', userData.id);
  
      if (updateError) {
        console.error('Kullanıcı güncelleme hatası:', updateError);
      } else {
        const hours = Math.floor(hoursDifference);
        const minutes = Math.floor((hoursDifference - hours) * 60);
        console.log(
          `Kullanıcı bilgileri güncellendi. Yeni streak: ${newStreakCount}, Son girişten bu yana: ${hours} saat ${minutes} dakika`
        );
      }
    } catch (error) {
      console.error('Kullanıcı kaydetme işlemi sırasında hata:', error);
    }
  }, []);
  

  // saveUserToDatabase + Users tablosundan güncel veriyi çekip Redux'a yazma
  // işlemi onAuthStateChange, handleAuthAction ve createSessionFromUrl'de
  // aynı şekilde tekrarlanıyordu; tek yerden yönetiliyor.
  const syncUserToStore = useCallback(
    async (authUser: User) => {
      await saveUserToDatabase(authUser);

      const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError) {
        console.error('Kullanıcı verileri çekilirken hata:', userError);
        return;
      }
      if (userData) {
        const userState = {
          full_name: userData.full_name || '',
          point: userData.point || 0,
          last_login_datetime: userData.last_login_datetime || '',
          streak_count: userData.streak_count || 0,
          id: authUser.id,
          wordStatusUpdateCounter: 0,
        };
        dispatch(setReduxUser(userState));
      }
    },
    [saveUserToDatabase, dispatch]
  );

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session);
        setUser(session?.user ?? null);
        setSession(session);
        setInitialized(true);

        if (!session?.user) {
          dispatch(clearReduxUser());
          return;
        }

        // TOKEN_REFRESHED (autoRefreshToken sayesinde saatte bir tetiklenir)
        // kullanıcı verisini değiştirmez; bu event'te DB write + fetch +
        // dispatch tekrarını atlıyoruz. Diğer event'lerde (SIGNED_IN,
        // INITIAL_SESSION, USER_UPDATED vb.) veriyi senkronize ediyoruz.
        if (event === 'TOKEN_REFRESHED') {
          return;
        }

        await syncUserToStore(session.user);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [syncUserToStore, dispatch]);

  const handleError = useCallback((error: AuthError | Error) => {
    console.error('Detaylı hata:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      error: JSON.stringify(error, null, 2)
    });
    setError(error.message);
    showToast(error.message, true, Colors.light.error,);
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
        
        // Kullanıcı oturumu varsa, Users tablosundan bilgileri çekelim
        if (data.session?.user) {
          await syncUserToStore(data.session.user);
        } else {
          dispatch(clearReduxUser());
        }
      } catch (error) {
        handleError(error as AuthError);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        Toast.hide(toast);
      }
    },
    [handleError, syncUserToStore, dispatch]
  );
  
  

  

  const signOut = useCallback(async () => {
    await handleAuthAction(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { data: { session: null }, error: error };
    }, t('auth.signingOut'));
  }, [handleAuthAction, t]);

  

  

  const deleteAccount = useCallback(async () => {
    const currentUserId = session?.user?.id;
    if (!currentUserId) return;

    try {
      // Not: satır zaten yoksa Supabase delete hata döndürmez (0 satır silinir),
      // bu yüzden bu adım tekrar denemelerde güvenle no-op olur.
      const { error: deleteRowError } = await supabase
        .from('Users')
        .delete()
        .eq('id', currentUserId);

      if (deleteRowError) {
        console.error('Hesap verisi silinirken hata:', deleteRowError.message);
        throw deleteRowError;
      }

      // Auth kullanıcısını silmek admin yetkisi ister; bu yüzden bir Supabase Edge
      // Function üzerinden service-role ile siliyoruz (anon/public key ile
      // auth.admin.deleteUser çağrılamaz).
      const { error: fnError } = await supabase.functions.invoke('delete-account');
      if (fnError) {
        console.error('Auth hesabı silinirken hata:', fnError.message);
        // Users satırı zaten silindi; kullanıcıyı yarı silinmiş ama hâlâ oturum
        // açık bir durumda bırakmamak için oturumu yine de kapatıyoruz ve
        // net bir hata gösteriyoruz. Burada throw ETMİYORUZ: signOut zaten
        // gerçekleşti, çağıran taraf (delete-account ekranı) yine de
        // sign-in'e yönlendirebilir; ikinci kez handleError tetiklenmesini
        // (çift toast) önlemek için fonksiyonu burada normal şekilde bitiriyoruz.
        await signOut();
        handleError(new Error(t('settings.deleteAccount.partialFailureError')));
        return;
      }

      await signOut();
    } catch (err) {
      handleError(err as Error);
      throw err;
    }
  }, [session, signOut, handleError, t]);

  const signInWithGoogle = useCallback(async () => {
    console.log("Google signin başlatılıyor")
    const toast = showToast(
      t('auth.signingInWithGoogle'),
      false,
      Colors.light.primary
    );
    try {
      setIsLoading(true);
      ensureGoogleSigninConfigured();
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
      // console.log("Apple signin başarılı", credential)
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
          await syncUserToStore(data.session.user);
        }
      } catch (error) {
        handleError(error as AuthError);
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, syncUserToStore]
  );



  

  // Aynı deep-link URL'i birden fazla kez işlememek için (ör. session state'i
  // henüz güncellenmeden effect tekrar tetiklenirse) işlenen URL'i takip ediyoruz.
  const handledUrlRef = useRef<string | null>(null);
  // Dış sistemle (deep-link URL) senkronizasyon — render sırasında türetilemez.
  useEffect(() => {
    if (url && handledUrlRef.current !== url) {
      const parsedUrl = parseSupabaseUrl(url);
      if (
        !session &&
        (parsedUrl?.queryParams?.type === 'signup' ||
          parsedUrl?.queryParams?.type === 'recovery' ||
          parsedUrl?.queryParams?.type === 'magiclink')
      ) {
        handledUrlRef.current = url;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- harici URL event'ine tepki veren auth akışı
        createSessionFromUrl(url);
      }
    }
  }, [url, session, createSessionFromUrl]);

  const value = useMemo(
    () => ({
      user,
      session,
      initialized,
      signOut,
      deleteAccount,
      signInWithGoogle,
      signInWithApple,
      createSessionFromUrl,
      isLoading,
      error,
      isAuthenticated,
      handleError,
    }),
    [
      user,
      session,
      initialized,
      signOut,
      deleteAccount,
      signInWithGoogle,
      signInWithApple,
      createSessionFromUrl,
      isLoading,
      error,
      isAuthenticated,
      handleError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
