import { supabase } from '@/lib/supabase';

export interface Word {
  id: number;
  name: string;
  WordTranslations: {
    word_id: number;
    culture: string;
    mean: string;
    example_original: string;
    example_translated: string;
    pronunciation: string;
  }[];
}

/**
 * Rastgele bir kelime getirir
 * @returns Rastgele bir kelime ve çevirileri
 */
export const getRandomWord = async (): Promise<Word | null> => {
  try {
    // Önce toplam kelime sayısını öğrenelim
    const { count, error: countError } = await supabase
      .from('Words')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Kelime sayısı sorgu hatası:', countError);
      return null;
    }

    if (!count || count === 0) {
      console.error('Veritabanında kelime bulunamadı');
      return null;
    }

    // Rastgele bir offset değeri hesaplayalım
    const randomOffset = Math.floor(Math.random() * count);

    // Rastgele kelimeyi getirelim
    const { data, error } = await supabase
      .from('Words')
      .select(`
        id,
        name,
        WordTranslations (
          word_id,
          culture,
          mean,
          example_original,
          example_translated,
          pronunciation
        )
      `)
      .range(randomOffset, randomOffset)
      .single();

    if (error) {
      console.error('Sorgu hatası:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Rastgele kelime getirme hatası:', error);
    return null;
  }
};