import { supabase } from '@/lib/supabase';

export interface WordTranslation {
  word_id: number;
  culture?: string; // Eski veritabanı yapısı için opsiyonel
  language_code?: string; // Yeni veritabanı yapısı için opsiyonel
  mean: string;
  example_original: string;
  example_translated: string;
  pronunciation?: string; // Opsiyonel yaptım çünkü bazı sorgularda dönmüyor
}

export interface Word {
  id: number;
  name: string;
  WordTranslations: WordTranslation[];
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
          language_code,
          mean,
          example_original,
          example_translated
        )
      `)
      .range(randomOffset, randomOffset)
      .single();

    if (error) {
      console.error('Sorgu hatası:', error);
      return null;
    }

    // Tip uyumluluğunu sağlamak için Word tipine dönüştürüyoruz
    return data as Word;
  } catch (error) {
    console.error('Rastgele kelime getirme hatası:', error);
    return null;
  }
};

/**
 * Rastgele 5 kelime ve çevirilerini getirir
 * @returns Rastgele 5 kelime ve çevirileri
 */
export const getRandomWordsWithTranslations = async (culture: string): Promise<Word[]> => {
  try {
    console.log('Rastgele kelimeler getiriliyor... Dil:', culture);

    // Dil kodu dönüşümü yap
    // Veritabanında culture alanı muhtemelen "de", "en", "tr" gibi değerler bekliyor
    // Eğer veritabanında language_code alanı varsa, culture yerine onu kullanalım
    
    // Önce bu culture'a sahip çevirisi olan kelime sayısını öğrenelim
    const { count, error: countError } = await supabase
      .from('Words')
      .select('id,WordTranslations!inner(language_code)', {
        count: 'exact',
        head: true
      })
      .eq('WordTranslations.language_code', culture);

    if (countError) {
      console.error('Kelime sayısı sorgu hatası:', countError);
      return [];
    }

    if (!count || count === 0) {
      console.error('Veritabanında bu culture için kelime bulunamadı');
      return [];
    }

    console.log('Toplam culture uygun kelime sayısı:', count);

    // Rastgele 5 farklı offset değeri oluşturalım
    const randomOffsets: number[] = [];
    const maxOffset = count - 1;
    while (randomOffsets.length < 5 && randomOffsets.length < count) {
      const randomOffset = Math.floor(Math.random() * (maxOffset + 1));
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
          WordTranslations!inner(
            word_id,
            language_code,
            mean,
            example_original,
            example_translated
          )
        `)
        .eq('WordTranslations.language_code', culture)
        .range(offset, offset)
        .limit(1);

      if (error) {
        console.error(`Offset ${offset} için sorgu hatası:`, error);
        continue;
      }

      if (data && data.length > 0) {
        // Tip uyumluluğunu sağlamak için Word tipine dönüştürüyoruz
        const wordData = data[0] as Word;
        randomWords.push(wordData);
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