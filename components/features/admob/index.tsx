import { useCallback } from 'react';
// TODO: Re-enable when react-native-google-mobile-ads is fixed
// import {
//   RewardedAd,
//   RewardedAdEventType,
//   AdEventType,
//   TestIds,
// } from 'react-native-google-mobile-ads';

export const useRewardedAd = () => {
  const showRewardedAd = useCallback(() => {
    console.log('[RewardedAd] Temporarily disabled for testing');
  }, []);

  return {
    showRewardedAd,
  };
};
