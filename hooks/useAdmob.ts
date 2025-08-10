import { useCallback, useEffect, useState } from 'react';
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

const getAdUnitId = (testId: string, prodId: string | string[]): string => {
  if (__DEV__) return testId;
  
  // If prodId is an array, return the first element
  if (Array.isArray(prodId)) {
    return prodId[0] || testId; // Fallback to testId if array is empty
  }
  
  return prodId;
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
  const [pendingAdType, setPendingAdType] = useState<'interstitial' | 'rewarded' | 'appOpen' | null>(null);

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
        if (pendingAdType === 'interstitial') {
          showInterstitialNow();
        }
      }
    );

    const rewardedListener = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        dispatch(setAdLoaded({ adType: 'rewarded', isLoaded: true }));
        dispatch(setAdLoading({ adType: 'rewarded', isLoading: false }));
        if (pendingAdType === 'rewarded') {
          showRewardedNow();
        }
      }
    );

    const appOpenListener = appOpenAd.addAdEventListener(
      AdEventType.LOADED,
      () => {
        dispatch(setAdLoaded({ adType: 'appOpen', isLoaded: true }));
        dispatch(setAdLoading({ adType: 'appOpen', isLoading: false }));
        if (pendingAdType === 'appOpen') {
          showAppOpenNow();
        }
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
  }, [dispatch, loadAppOpen, loadInterstitial, loadRewarded, pendingAdType]);

  const showInterstitial = () => {
    if (admobState.interstitial.isLoaded) {
      showInterstitialNow();
    } else {
      setPendingAdType('interstitial');
      loadInterstitial();
    }
  };

  const showRewarded = () => {
    if (admobState.rewarded.isLoaded) {
      showRewardedNow();
    } else {
      setPendingAdType('rewarded');
      loadRewarded();
    }
  };

  const showAppOpen = () => {
    if (admobState.appOpen.isLoaded) {
      showAppOpenNow();
    } else {
      setPendingAdType('appOpen');
      loadAppOpen();
    }
  };

  const showInterstitialNow = () => {
    hideStatusBar();
    const adClosedListener = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      showStatusBar();
      loadInterstitial(); // Reload for next time
      adClosedListener();
    });
    interstitial.show();
    dispatch(setAdLoaded({ adType: 'interstitial', isLoaded: false }));
    setPendingAdType(null);
  };

  const showRewardedNow = () => {
    hideStatusBar();
    const adClosedListener = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      showStatusBar();
      loadRewarded();
      adClosedListener();
    });
    rewarded.show();
    dispatch(setAdLoaded({ adType: 'rewarded', isLoaded: false }));
    setPendingAdType(null);
  };

  const showAppOpenNow = () => {
    hideStatusBar();
    const adClosedListener = appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
      showStatusBar();
      loadAppOpen();
      adClosedListener();
    });
    appOpenAd.show();
    dispatch(setAdLoaded({ adType: 'appOpen', isLoaded: false }));
    setPendingAdType(null);
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
