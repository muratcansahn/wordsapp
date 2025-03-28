import { supabase } from '@/lib/supabase';

export interface WordList {
  id: number;
  title: string;
  wordCount: number;
  learnedCount: number;
  icon: 'book-open-page-variant' | 'briefcase' | 'airplane' | 'check-circle' | 'chevron-right' | 'star';
  gradient: [string, string];
  description?: string;
}

export const getWordLists = async (): Promise<WordList[]> => {
  try {
    const { data, error } = await supabase
      .from('WordLists')
      .select('*');

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching word lists:', error);
    throw error;
  }
};
