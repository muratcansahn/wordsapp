import { useEffect, useRef, useCallback } from 'react';
import {
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { admobConfig } from '@/services/admob/admobConfig';
import { useDispatch, useSelector } from 'react-redux';
import { incrementByAmount } from '@/store/userSlice';
import type { AppDispatch, RootState } from '@/store';
import { incrementUserPointByAmount } from '@/services/userService';
import { supabase } from '@/lib/supabase';

export const useAdmobRewarded = (adIndex: 0 | 1 = 0) => {
  const adUnitId = __DEV__ ? TestIds.REWARDED : admobConfig.rewardedAdUnitId[adIndex];
  const rewardedRef = useRef<RewardedAd | null>(null);
  const isLoadedRef = useRef<boolean>(false);
  const earnedRewardRef = useRef(false);
  const dispatch = useDispatch<AppDispatch>();
  const userIdFromRedux = useSelector((state: RootState) => state.user.id);

  useEffect(() => {
    const rewarded = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    rewardedRef.current = rewarded;

    const loadListener = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      isLoadedRef.current = true;
    });

    const rewardListener = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      async () => {
        earnedRewardRef.current = true;

        // İkinci reklam ("Game Change") puan vermez, sadece oyun içi bir etkiyi tetikler
        if (adIndex === 1) {
          return;
        }

        let userId: string | undefined = userIdFromRedux;

        if (!userId) {
          try {
            const { data: session } = await supabase.auth.getSession();
            userId = session?.session?.user?.id;
          } catch (sessionError) {
            console.error('Supabase oturumu alınırken hata:', sessionError);
            return;
          }
        }

        if (!userId) {
          console.warn('Kullanıcı ID bulunamadı, puan eklenemedi.');
          return;
        }

        try {
          const { success } = await incrementUserPointByAmount(userId, 25);
          if (success) {
            dispatch(incrementByAmount(25));
          }
        } catch (e) {
          console.error('Puan ekleme sırasında hata:', e);
        }
      }
    );

    const closeListener = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      isLoadedRef.current = false;
      rewarded.load();
    });

    const errorListener = rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
      console.warn('[AdMob] Rewarded ad failed to load:', error);
    });

    rewarded.load();

    return () => {
      loadListener();
      rewardListener();
      closeListener();
      errorListener();
    };
  }, [adIndex, adUnitId, dispatch, userIdFromRedux]);

  const showRewarded = useCallback((): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      const ad = rewardedRef.current;
      if (!ad) {
        resolve(false);
        return;
      }

      const show = () => {
        earnedRewardRef.current = false;
        const closeListener = ad.addAdEventListener(AdEventType.CLOSED, () => {
          resolve(earnedRewardRef.current);
          closeListener();
        });
        ad.show();
        isLoadedRef.current = false;
      };

      if (isLoadedRef.current) {
        show();
        return;
      }

      const loadListener = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        loadListener();
        errorListener();
        show();
      });

      const errorListener = ad.addAdEventListener(AdEventType.ERROR, () => {
        loadListener();
        errorListener();
        ad.load();
      });

      ad.load();
    });
  }, []);

  return {
    showRewarded,
  };
};
