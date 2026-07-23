import { AppDispatch } from '@/store';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import { setAdmobReady } from '@/store/slices/admobSlice';

export const initializeAdmob = (dispatch: AppDispatch) => {
  mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.G,
    tagForChildDirectedTreatment: true,
    tagForUnderAgeOfConsent: true,
  });
  mobileAds()
    .initialize()
    .then((adapterStatuses) => {
      dispatch(setAdmobReady(adapterStatuses[0].state === 1));
    })
    .catch((error) => {
      console.error('[AdMob] initialize failed:', error);
      dispatch(setAdmobReady(false));
    });
};
