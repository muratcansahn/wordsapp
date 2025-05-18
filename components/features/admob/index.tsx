import { useEffect, useRef } from 'react';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

const adUnitId = __DEV__
  ? TestIds.REWARDED
  : Platform.select({
      ios: 'ca-app-pub-xxxx/yyyy',      // ← Prod ID buraya
      android: 'ca-app-pub-xxxx/yyyy',  // ← Prod ID buraya
    })!;

export const useRewardedAd = () => {
  const rewardedRef = useRef<RewardedAd | null>(null);

  useEffect(() => {
    const rewarded = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    rewardedRef.current = rewarded;

    const loadListener = rewarded.addAdEventListener(AdEventType.LOADED, () => {
      console.log('[RewardedAd] Ad loaded ✅');
    });

    const earnListener = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        console.log('[RewardedAd] Reward earned 🎉:', reward);
      }
    );

    const closeListener = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[RewardedAd] Ad closed ❌');
      rewarded.load(); // Reklamı yeniden yükle
    });

    const errorListener = rewarded.addAdEventListener(AdEventType.ERROR, error => {
      console.warn('[RewardedAd] Ad error ⚠️:', error);
    });

    rewarded.load();

    return () => {
      loadListener();
      earnListener();
      closeListener();
      errorListener();
    };
  }, []);

  const showRewardedAd = () => {
    const ad = rewardedRef.current;
    if (ad && ad.loaded) {
      ad.show();
    } else {
      console.log('[RewardedAd] Not loaded yet ❌');
      ad?.load();
    }
  };

  return {
    showRewardedAd,
  };
};
