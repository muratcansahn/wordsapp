import { Platform } from 'react-native';

type AdmobPlatformConfig = {
  interstitialAdUnitId: string;
  rewardedAdUnitId: string | string[]; // ✅ Allow both string and array
  appOpenAdUnitId: string;
  bannerAdUnitId: string;
};

//* Change these to the new Admob unit ids
// TODO1: Go Google Admob and create new app and get the new unit ids
// TODO2: Change the new unit ids here

export const admobConfig: AdmobPlatformConfig =
  Platform.select<AdmobPlatformConfig>({
    ios: {
      interstitialAdUnitId: 'ca-app-pub-3940256099942544/4411468910', // Test ID
      rewardedAdUnitId:['ca-app-pub-3940256099942544/1712485313', 'ca-app-pub-3940256099942544/5224354917'], // Test IDs
      appOpenAdUnitId: 'ca-app-pub-3940256099942544/5572853029', // Test ID
      bannerAdUnitId: 'ca-app-pub-3940256099942544/2934735716', // Test ID
    },
    android: {
      interstitialAdUnitId: 'ca-app-pub-3940256099942544/1033173712', // Test ID
      rewardedAdUnitId: ["ca-app-pub-3940256099942544/5224354917","ca-app-pub-3940256099942544/5354046379"], // Test IDs
      appOpenAdUnitId: 'ca-app-pub-3940256099942544/3419835294', // Test ID
      bannerAdUnitId: 'ca-app-pub-3940256099942544/6300978111', // Test ID
    },
  })!;
