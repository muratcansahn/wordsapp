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

/**
 * Rastgele 5 kelime ve çevirilerini getirir
 * @returns Rastgele 5 kelime ve çevirileri
 */
export const getRandomWordsWithTranslations = async (): Promise<Word[]> => {
  try {
    console.log('Rastgele kelimeler getiriliyor...');
    
    // Önce toplam kelime sayısını öğrenelim
    const { count, error: countError } = await supabase
      .from('Words')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Kelime sayısı sorgu hatası:', countError);
      return [];
    }
    
    if (!count || count === 0) {
      console.error('Veritabanında kelime bulunamadı');
      return [];
    }
    
    console.log('Toplam kelime sayısı:', count);

    // Gerçekten rastgele kelimeler seçmek için
    // Rastgele 5 farklı offset değeri oluşturalım
    const randomOffsets: number[] = [];
    const maxOffset = count - 1;
    
    // 5 benzersiz rastgele offset değeri oluştur
    while (randomOffsets.length < 5) {
      const randomOffset = Math.floor(Math.random() * maxOffset);
      if (!randomOffsets.includes(randomOffset)) {
        randomOffsets.push(randomOffset);
      }
    }
    
    // Her offset için ayrı sorgu yapıp sonuçları birleştirelim
    const randomWords: Word[] = [];
    
    for (const offset of randomOffsets) {
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
        .range(offset, offset)
        .limit(1);
      
      if (error) {
        console.error(`Offset ${offset} için sorgu hatası:`, error);
        continue;
      }
      
      if (data && data.length > 0) {
        randomWords.push(data[0]);
      }
    }
    
    // Son bir kez daha karıştıralım
    const shuffledWords = [...randomWords].sort(() => Math.random() - 0.5);
    
    console.log('Çekilen kelime sayısı:', shuffledWords.length);
    return shuffledWords;
  } catch (error) {
    console.error('Rastgele kelimeler getirme hatası:', error);
    return [];
  }
};