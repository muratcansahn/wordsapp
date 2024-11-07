import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "@/store/slices/themeSlice";
import searchReducer from "@/store/slices/searchSlice";
import admobReducer from "@/store/slices/admobSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    search: searchReducer,
    admob: admobReducer,
    // You can add more reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
