import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  full_name: string;
  point: number;
  last_login_datetime: string;
  known_words: number;
  unknown_words: number;
  streak_count: number;
  id: string;
}

// User tipini UserState'e dönüştüren yardımcı fonksiyon
export const convertUserToUserState = (user: any): UserState => {
  return {
    full_name: user.user_metadata.full_name,
    point: user.app_metadata.point,
    last_login_datetime: user.last_login_at,
    known_words: user.app_metadata.known_words,
    unknown_words: user.app_metadata.unknown_words,
    streak_count: user.app_metadata.streak_count,
    id: user.id,
  };
};

const initialState: UserState = {
  full_name: '',
  point: 0,
  last_login_datetime: '',
  known_words: 0,
  unknown_words: 0,
  streak_count: 0,
  id: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setReduxUser: (state, action: PayloadAction<UserState>) => {
      return action.payload;
    },
    clearReduxUser: () => initialState,
    updateUserStats: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
  }
});

export const { setReduxUser, clearReduxUser, updateUserStats } = userSlice.actions;
export default userSlice.reducer;
