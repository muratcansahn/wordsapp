import { AppDispatch } from '@/store';

// TODO: Re-enable when react-native-google-mobile-ads is fixed
// import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import { setAdmobReady } from '@/store/slices/admobSlice';

export const initializeAdmob = (dispatch: AppDispatch) => {
  // TODO: Re-enable when react-native-google-mobile-ads is fixed
  // mobileAds().setRequestConfiguration({
  //   maxAdContentRating: MaxAdContentRating.G,
  //   tagForChildDirectedTreatment: true,
  //   tagForUnderAgeOfConsent: true,
  // });
  // mobileAds()
  //   .initialize()
  //   .then((adapterStatuses) => {
  //     if (adapterStatuses[0].state === 1) {
  //       dispatch(setAdmobReady(true));
  //     } else {
  //       dispatch(setAdmobReady(false));
  //     }
  //   })
  //   .catch((error) => {
  //     console.log(error, 'error');
  //   });

  // Mock: Set admob as ready for testing
  console.log('[AdMob] Temporarily disabled for testing');
  dispatch(setAdmobReady(false));
};
