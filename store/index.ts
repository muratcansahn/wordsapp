import { configureStore } from '@reduxjs/toolkit';
import admobReducer from '@/store/slices/admobSlice';
import wordReducer from '@/store/wordSlice';
import userReducer from '@/store/userSlice';

export const store = configureStore({
  reducer: {
    admob: admobReducer,
    words: wordReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
