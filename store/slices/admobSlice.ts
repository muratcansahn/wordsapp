import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type AdState = {
  isLoading: boolean;
  isLoaded: boolean;
};

type AdmobState = {
  [key: string]: AdState;
};

const initialState: AdmobState = {
  admobReady: { isLoading: false, isLoaded: false },
  interstitial: { isLoading: false, isLoaded: false },
  rewarded: { isLoading: false, isLoaded: false },
  appOpen: { isLoading: false, isLoaded: false },
  banner: { isLoading: false, isLoaded: false },
};

const admobSlice = createSlice({
  name: 'admob',
  initialState,
  reducers: {
    setAdLoading: (
      state,
      action: PayloadAction<{
        adType: keyof Omit<AdmobState, 'admobReady'>;
        isLoading: boolean;
      }>
    ) => {
      const { adType, isLoading } = action.payload;
      state[adType].isLoading = isLoading;
    },
    setAdLoaded: (
      state,
      action: PayloadAction<{
        adType: keyof Omit<AdmobState, 'admobReady'>;
        isLoaded: boolean;
      }>
    ) => {
      const { adType, isLoaded } = action.payload;
      state[adType].isLoaded = isLoaded;
    },
    setAdmobReady: (state, action: PayloadAction<boolean>) => {
      state.admobReady = { isLoading: false, isLoaded: action.payload };
    },
  },
});

export const { setAdLoading, setAdLoaded, setAdmobReady } = admobSlice.actions;
export default admobSlice.reducer;
