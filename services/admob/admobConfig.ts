import { Platform } from 'react-native';

type AdmobPlatformConfig = {
  interstitialAdUnitId: string;
  rewardedAdUnitId: any;
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
      rewardedAdUnitId:['ca-app-pub-2920147810768385/3996818238',"ca-app-pub-2920147810768385/4141439846"],
      appOpenAdUnitId: 'ca-app-pub-...',
      bannerAdUnitId: 'ca-app-pub-...',
    },
    android: {
      interstitialAdUnitId: 'ca-app-pub-...',
      rewardedAdUnitId: ["ca-app-pub-2920147810768385/7072755326","ca-app-pub-2920147810768385/5172037219"],
      appOpenAdUnitId: 'ca-app-pub-...',
      bannerAdUnitId: 'ca-app-pub-...',
    },
  })!;
