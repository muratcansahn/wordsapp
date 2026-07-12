import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// TODO: Re-enable when react-native-google-mobile-ads is fixed
// import {
//   AdEventType,
//   AppOpenAd,
//   InterstitialAd,
//   RewardedAd,
//   RewardedAdEventType,
//   TestIds,
// } from 'react-native-google-mobile-ads';
import { setAdLoaded, setAdLoading } from '@/store/slices/admobSlice';
import { AppDispatch, RootState } from '@/store';
// import { admobConfig } from '@/services/admob/admobConfig';
import { initializeAdmob } from '@/services/admob/admobService';

export const useAdmob = () => {
  const dispatch = useDispatch<AppDispatch>();
  const admobState = useSelector((state: RootState) => state.admob);

  const initializeAdmobService = useCallback(() => {
    initializeAdmob(dispatch);
  }, [dispatch]);

  const loadInterstitial = useCallback(() => {
    console.log('[AdMob] Interstitial ads temporarily disabled');
    dispatch(setAdLoading({ adType: 'interstitial', isLoading: false }));
  }, [dispatch]);

  const loadRewarded = useCallback(() => {
    console.log('[AdMob] Rewarded ads temporarily disabled');
    dispatch(setAdLoading({ adType: 'rewarded', isLoading: false }));
  }, [dispatch]);

  const loadAppOpen = useCallback(() => {
    console.log('[AdMob] AppOpen ads temporarily disabled');
    dispatch(setAdLoading({ adType: 'appOpen', isLoading: false }));
  }, [dispatch]);

  const showInterstitial = useCallback(() => {
    console.log('[AdMob] showInterstitial - temporarily disabled');
  }, []);

  const showRewarded = useCallback(() => {
    console.log('[AdMob] showRewarded - temporarily disabled');
  }, []);

  const showAppOpen = useCallback(() => {
    console.log('[AdMob] showAppOpen - temporarily disabled');
  }, []);

  return {
    initializeAdmobService,
    showInterstitial,
    showRewarded,
    showAppOpen,
    admobState,
    loadInterstitial,
    loadRewarded,
    loadAppOpen,
  };
};
