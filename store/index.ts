import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '@/store/slices/themeSlice';
import admobReducer from '@/store/slices/admobSlice';
import wordReducer from '@/store/wordSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    admob: admobReducer,
    words: wordReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
