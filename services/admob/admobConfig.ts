import { Platform } from 'react-native';

type AdmobPlatformConfig = {
  interstitialAdUnitId: string;
  rewardedAdUnitId: string;
  appOpenAdUnitId: string;
  bannerAdUnitId: string;
};

//* Change these to the new Admob unit ids
// TODO1: Go Google Admob and create new app and get the new unit ids
// TODO2: Change the new unit ids here

export const admobConfig: AdmobPlatformConfig =
  Platform.select<AdmobPlatformConfig>({
    ios: {
      interstitialAdUnitId: 'ca-app-pub-...',
      rewardedAdUnitId: 'ca-app-pub-...',
      appOpenAdUnitId: 'ca-app-pub-...',
      bannerAdUnitId: 'ca-app-pub-...',
    },
    android: {
      interstitialAdUnitId: 'ca-app-pub-...',
      rewardedAdUnitId: 'ca-app-pub-...',
      appOpenAdUnitId: 'ca-app-pub-...',
      bannerAdUnitId: 'ca-app-pub-...',
    },
  })!;
