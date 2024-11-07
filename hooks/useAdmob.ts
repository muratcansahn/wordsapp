import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AdEventType,
  AppOpenAd,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { setAdLoaded, setAdLoading } from '@/store/slices/admobSlice';
import { AppDispatch, RootState } from '@/store';
import { StatusBar } from 'react-native';
import { admobConfig } from '@/services/admob/admobConfig';
import { initializeAdmob } from '@/services/admob/admobService';

const getAdUnitId = (testId: string, prodId: string): string => {
  return __DEV__ ? testId : prodId;
};

const interstitial = InterstitialAd.createForAdRequest(
  getAdUnitId(TestIds.INTERSTITIAL, admobConfig.interstitialAdUnitId)
);
const rewarded = RewardedAd.createForAdRequest(
  getAdUnitId(TestIds.REWARDED, admobConfig.rewardedAdUnitId)
);
const appOpenAd = AppOpenAd.createForAdRequest(
  getAdUnitId(TestIds.APP_OPEN, admobConfig.appOpenAdUnitId)
);

export const useAdmob = () => {
  const dispatch = useDispatch<AppDispatch>();
  const admobState = useSelector((state: RootState) => state.admob);

  const initializeAdmobService = useCallback(() => {
    initializeAdmob(dispatch);
  }, [dispatch]);

  const hideStatusBar = () => {
    StatusBar.setHidden(true, 'fade');
  };

  const showStatusBar = () => {
    StatusBar.setHidden(false, 'fade');
  };

  const loadInterstitial = useCallback(() => {
    dispatch(setAdLoading({ adType: 'interstitial', isLoading: true }));
    interstitial.load();
  }, [dispatch]);

  const loadRewarded = useCallback(() => {
    dispatch(setAdLoading({ adType: 'rewarded', isLoading: true }));
    rewarded.load();
  }, [dispatch]);

  const loadAppOpen = useCallback(() => {
    dispatch(setAdLoading({ adType: 'appOpen', isLoading: true }));
    appOpenAd.load();
  }, [dispatch]);

  useEffect(() => {
    const interstitialListener = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        dispatch(setAdLoaded({ adType: 'interstitial', isLoaded: true }));
        dispatch(setAdLoading({ adType: 'interstitial', isLoading: false }));
      }
    );

    const rewardedListener = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        dispatch(setAdLoaded({ adType: 'rewarded', isLoaded: true }));
        dispatch(setAdLoading({ adType: 'rewarded', isLoading: false }));
      }
    );

    const appOpenListener = appOpenAd.addAdEventListener(
      AdEventType.LOADED,
      () => {
        dispatch(setAdLoaded({ adType: 'appOpen', isLoaded: true }));
        dispatch(setAdLoading({ adType: 'appOpen', isLoading: false }));
      }
    );

    loadInterstitial();
    loadRewarded();
    loadAppOpen();

    return () => {
      interstitialListener();
      rewardedListener();
      appOpenListener();
    };
  }, [dispatch, loadAppOpen, loadInterstitial, loadRewarded]);

  const showInterstitial = () => {
    loadInterstitial();
    if (admobState.interstitial.isLoaded) {
      hideStatusBar();
      const adClosedListener = interstitial.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          showStatusBar();
          adClosedListener();
        }
      );
      interstitial.show();
      dispatch(setAdLoaded({ adType: 'interstitial', isLoaded: false }));
    } else {
      console.log('Interstitial ad is not loaded');
    }
  };

  const showRewarded = () => {
    loadRewarded();
    if (admobState.rewarded.isLoaded) {
      hideStatusBar();
      const adClosedListener = rewarded.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          showStatusBar();
          adClosedListener();
        }
      );
      rewarded.show();
      dispatch(setAdLoaded({ adType: 'rewarded', isLoaded: false }));
    } else {
      console.log('Rewarded ad is not loaded');
    }
  };

  const showAppOpen = () => {
    loadAppOpen();
    if (admobState.appOpen.isLoaded) {
      hideStatusBar();
      const adClosedListener = appOpenAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          showStatusBar();
          adClosedListener();
        }
      );
      appOpenAd.show();
      dispatch(setAdLoaded({ adType: 'appOpen', isLoaded: false }));
    } else {
      console.log('App open ad is not loaded');
    }
  };

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
