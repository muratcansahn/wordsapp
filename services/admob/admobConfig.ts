import { Platform } from 'react-native';

type AdmobPlatformConfig = {
  rewardedAdUnitId: [string, string];
};

export const admobConfig: AdmobPlatformConfig =
  Platform.select<AdmobPlatformConfig>({
    ios: {
      rewardedAdUnitId: [
        'ca-app-pub-2920147810768385/7072755326', // 25 Puan
        'ca-app-pub-2920147810768385/5172037219', // Game Change
      ],
    },
    android: {
      rewardedAdUnitId: [
        'ca-app-pub-2920147810768385/7072755326', // 25 Puan
        'ca-app-pub-2920147810768385/5172037219', // Game Change
      ],
    },
  })!;
