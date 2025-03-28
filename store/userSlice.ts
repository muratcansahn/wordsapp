import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string;
  full_name: string;
  point: number;
  known_words: number;
  unknown_words: number;
  streak_count: number;
  wordStatusUpdateCounter: number;
}

// User tipini UserState'e dönüştüren yardımcı fonksiyon
export const convertUserToUserState = (user: any): UserState => {
  return {
    id: user.id,
    full_name: user.user_metadata.full_name,
    point: user.app_metadata.point,
    known_words: user.app_metadata.known_words,
    unknown_words: user.app_metadata.unknown_words,
    streak_count: user.app_metadata.streak_count,
    wordStatusUpdateCounter: 0,
  };
};

const initialState: UserState = {
  id: '',
  full_name: '',
  point: 0,
  known_words: 0,
  unknown_words: 0,
  streak_count: 0,
  wordStatusUpdateCounter: 0,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setReduxUser: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },
    clearReduxUser: () => initialState,
    updateUserStats: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
    incrementWordStatusCounter: (state) => {
      return { ...state, wordStatusUpdateCounter: state.wordStatusUpdateCounter + 1 };
    },
  }
});

export const { setReduxUser, clearReduxUser, updateUserStats, incrementWordStatusCounter } = userSlice.actions;
export default userSlice.reducer;
