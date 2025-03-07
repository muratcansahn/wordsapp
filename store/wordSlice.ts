import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Kelime tipi tanımı
export interface Word {
  id: string;
  text: string;
  translation: string;
  learned: boolean;
  unknown: boolean;
  lastReviewed: string;
}

// State tipi tanımı
export interface WordState {
  words: Word[];
  learnedCount: number;
  unknownCount: number;
  streakCount: number;
}

// Başlangıç durumu
const initialState: WordState = {
  words: [
    { id: '1', text: 'hello', translation: 'merhaba', learned: true, unknown: false, lastReviewed: '2025-03-05' },
    { id: '2', text: 'world', translation: 'dünya', learned: true, unknown: false, lastReviewed: '2025-03-05' },
    { id: '3', text: 'computer', translation: 'bilgisayar', learned: true, unknown: false, lastReviewed: '2025-03-04' },
    { id: '4', text: 'language', translation: 'dil', learned: true, unknown: false, lastReviewed: '2025-03-04' },
    { id: '5', text: 'keyboard', translation: 'klavye', learned: true, unknown: false, lastReviewed: '2025-03-03' },
    { id: '6', text: 'screen', translation: 'ekran', learned: true, unknown: false, lastReviewed: '2025-03-03' },
    { id: '7', text: 'mouse', translation: 'fare', learned: true, unknown: false, lastReviewed: '2025-03-02' },
    { id: '8', text: 'window', translation: 'pencere', learned: true, unknown: false, lastReviewed: '2025-03-02' },
    { id: '9', text: 'door', translation: 'kapı', learned: true, unknown: false, lastReviewed: '2025-03-01' },
    { id: '10', text: 'table', translation: 'masa', learned: true, unknown: false, lastReviewed: '2025-03-01' },
    { id: '11', text: 'chair', translation: 'sandalye', learned: false, unknown: true, lastReviewed: '2025-03-05' },
    { id: '12', text: 'book', translation: 'kitap', learned: false, unknown: true, lastReviewed: '2025-03-05' },
    { id: '13', text: 'pen', translation: 'kalem', learned: false, unknown: true, lastReviewed: '2025-03-04' },
    { id: '14', text: 'paper', translation: 'kağıt', learned: false, unknown: true, lastReviewed: '2025-03-04' },
    { id: '15', text: 'phone', translation: 'telefon', learned: false, unknown: true, lastReviewed: '2025-03-03' },
    { id: '16', text: 'car', translation: 'araba', learned: false, unknown: true, lastReviewed: '2025-03-03' },
    { id: '17', text: 'bicycle', translation: 'bisiklet', learned: false, unknown: true, lastReviewed: '2025-03-02' },
    { id: '18', text: 'house', translation: 'ev', learned: false, unknown: true, lastReviewed: '2025-03-02' },
    { id: '19', text: 'street', translation: 'sokak', learned: false, unknown: true, lastReviewed: '2025-03-01' },
    { id: '20', text: 'city', translation: 'şehir', learned: false, unknown: true, lastReviewed: '2025-03-01' },
  ],
  learnedCount: 10,
  unknownCount: 10,
  streakCount: 7
};

// Slice oluşturma
export const wordSlice = createSlice({
  name: 'words',
  initialState,
  reducers: {
    markAsLearned: (state, action: PayloadAction<string>) => {
      const word = state.words.find(w => w.id === action.payload);
      if (word) {
        if (!word.learned && word.unknown) {
          state.unknownCount--;
        }
        word.learned = true;
        word.unknown = false;
        word.lastReviewed = new Date().toISOString().split('T')[0];
        state.learnedCount = state.words.filter(w => w.learned).length;
      }
    },
    markAsUnknown: (state, action: PayloadAction<string>) => {
      const word = state.words.find(w => w.id === action.payload);
      if (word) {
        if (word.learned && !word.unknown) {
          state.learnedCount--;
        }
        word.learned = false;
        word.unknown = true;
        word.lastReviewed = new Date().toISOString().split('T')[0];
        state.unknownCount = state.words.filter(w => w.unknown).length;
      }
    },
    incrementStreak: (state) => {
      state.streakCount += 1;
    }
  }
});

// Action'ları export etme
export const { markAsLearned, markAsUnknown, incrementStreak } = wordSlice.actions;

// Reducer'ı export etme
export default wordSlice.reducer;
