import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '@/store/slices/themeSlice';
import admobReducer from '@/store/slices/admobSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    admob: admobReducer,
    // You can add more reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
