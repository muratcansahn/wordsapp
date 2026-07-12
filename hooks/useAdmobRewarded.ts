import { useCallback } from 'react';
// TODO: Re-enable when react-native-google-mobile-ads is fixed
// import {
//   RewardedAd,
//   AdEventType,
//   RewardedAdEventType,
//   TestIds,
// } from 'react-native-google-mobile-ads';
// import { admobConfig } from '@/services/admob/admobConfig';
import { useDispatch, useSelector } from 'react-redux';
import { incrementByAmount } from '@/store/userSlice';
import type { AppDispatch, RootState } from '@/store';
import { incrementUserPointByAmount } from '@/services/userService';
import { supabase } from '@/lib/supabase';

export const useAdmobRewarded = (adIndex: number = 0) => {
  const dispatch = useDispatch<AppDispatch>();
  const userIdFromRedux = useSelector((state: RootState) => state.user.id);

  const showRewarded = useCallback((): Promise<void> => {
    return new Promise<void>(async (resolve) => {
      console.log('[AdMob] Rewarded ads temporarily disabled for testing');

      // Mock reward for testing - give points without showing ad
      if (adIndex !== 1) {
        let userId = userIdFromRedux;

        if (!userId) {
          try {
            const { data: session } = await supabase.auth.getSession();
            userId = session?.session?.user?.id || null;
          } catch (sessionError) {
            console.error('Supabase oturumu alınırken hata:', sessionError);
          }
        }

        if (userId) {
          try {
            const { success } = await incrementUserPointByAmount(userId, 25);
            if (success) {
              dispatch(incrementByAmount(25));
              console.log('🎉 [Mock] 25 puan eklendi!');
            }
          } catch (e) {
            console.error('Puan ekleme sırasında hata:', e);
          }
        }
      }

      resolve();
    });
  }, [adIndex, dispatch, userIdFromRedux]);

  return {
    showRewarded,
  };
};
