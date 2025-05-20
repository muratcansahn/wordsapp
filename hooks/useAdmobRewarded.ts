import { useEffect, useRef, useCallback } from 'react';
import {
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { admobConfig } from '@/services/admob/admobConfig';
import { Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { incrementByAmount } from '@/store/userSlice';
import type { AppDispatch, RootState } from '@/store';
import { incrementUserPointByAmount } from '@/services/userService';
import { supabase } from '@/lib/supabase';

const getAdUnitId = (testId: string, prodId: any, adIndex: number = 0): string => {
  if (__DEV__) return testId;
  
  // prodId bir dizi ise ve adIndex geçerli bir indeks ise, o indeksteki ID'yi kullan
  if (Array.isArray(prodId) && prodId.length > adIndex) {
    return prodId[adIndex];
  }
  
  // prodId bir dizi ise ama adIndex geçersizse, ilk ID'yi kullan
  if (Array.isArray(prodId)) {
    return prodId[0];
  }
  
  // prodId bir dizi değilse, doğrudan kullan
  return prodId;
};

export const useAdmobRewarded = (adIndex: number = 0) => {
  // adIndex parametresi ile hangi reklam ID'sinin kullanılacağını belirliyoruz
  const adUnitId = getAdUnitId(
    TestIds.REWARDED,
    admobConfig.rewardedAdUnitId,
    adIndex
  );
  const rewardedRef = useRef<RewardedAd | null>(null);
  const isLoadedRef = useRef<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const userIdFromRedux = useSelector((state: RootState) => state.user.id);

  useEffect(() => {
    const rewarded = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    rewardedRef.current = rewarded;
    const loadListener = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('[Rewarded] Ad loaded');
        isLoadedRef.current = true;
      });
      

    const rewardListener = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      async reward => {
        
        // Eğer adIndex 1 ise (ikinci reklam ID'si) puan ekleme
        if (adIndex === 1) {
          return;
        }
        
        // Önce Redux'tan kullanıcı ID'sini kontrol et
        let userId = userIdFromRedux;
        
        // Redux'ta yoksa Supabase oturumundan almaya çalış
        if (!userId) {
          try {
            const { data: session } = await supabase.auth.getSession();
            const sessionUserId = session?.session?.user?.id;
            
            if (!sessionUserId) {
              console.warn('Kullanıcı ID bulunamadı, puan eklenemedi. Redux ve Supabase oturumunda kullanıcı yok.');
              return;
            }
            
            userId = sessionUserId; // Artık userId kesinlikle string olacak
            console.log('Kullanıcı ID Supabase oturumundan alındı:', userId);
          } catch (sessionError) {
            console.error('Supabase oturumu alınırken hata:', sessionError);
            console.warn('Kullanıcı ID bulunamadı, puan eklenemedi.');
            return;
          }
        }
        
        try {
          const { success } = await incrementUserPointByAmount(userId, 25);
          if (success) {
            dispatch(incrementByAmount(25));
            console.log('🎉 25 puan veritabanına ve Redux stateine eklendi!');
          } else {
            console.warn('Veritabanına puan eklenemedi, Redux güncellenmedi.');
          }
        } catch (e) {
          console.error('Puan ekleme sırasında hata:', e);
        }
      }
    );

    const closeListener = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[Rewarded] Ad closed');
      isLoadedRef.current = false;
      rewarded.load(); // tekrar yükle
    });

    const errorListener = rewarded.addAdEventListener(AdEventType.ERROR, error => {
      console.warn('[Rewarded] Ad failed to load:', error);
    });

    rewarded.load();

    return () => {
      loadListener();
      rewardListener();
      closeListener();
      errorListener();
    };
  }, []);

  const showRewarded = useCallback((): Promise<void> => {
    return new Promise<void>((resolve) => {
      const ad = rewardedRef.current;
      if (ad && isLoadedRef.current) {
        // Reklam kapandığında resolve et
        const closeListener = ad.addAdEventListener(AdEventType.CLOSED, () => {
          // adIndex 1 olduğunda (ikinci reklam ID'si) özel işlem
          if (adIndex === 1) {
            console.log('[Rewarded] adIndex 1 için özel işlem tamamlandı');
          }
          
          resolve();
          closeListener(); // listener'ı kaldır
        });
        ad.show();
        isLoadedRef.current = false;
      } else {
        console.log('[Rewarded] Not ready yet, loading...');
        ad?.load();
        resolve(); // Reklam yoksa hemen resolve et
      }
    });
  }, [adIndex]); // adIndex'i dependency olarak ekledim

  return {
    showRewarded,
  };

};
