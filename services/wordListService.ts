import { supabase } from '@/lib/supabase';

// learn/index.tsx'teki ApiWordList ile uyumlu hale getirelim
export interface ApiWordList {
  id: number;
  name: string;
  description: string; // desc_tr'yi buraya map edeceğiz
  image: string;
  total_words: number; // Kelime sayısı için
}

export const getWordLists = async (): Promise<ApiWordList[]> => {
  try {
    // Sorguyu güncelleyelim:
    // - Gerekli alanları (id, name, desc_tr, image) seçelim.
    // - WordListItems ilişkisi üzerinden count(*) alalım.
    const { data, error } = await supabase
      .from('WordLists')
      .select(`
        id,
        desc_tr,
        image,
        WordListItems(count)
      `);

    if (error) {
      console.error('Supabase query error:', error); // Daha detaylı loglama
      throw error;
    }

    // Gelen veriyi ApiWordList arayüzüne map edelim
    const mappedData = data.map(item => ({
      id: item.id,
      description: item.desc_tr, // desc_tr'yi description'a atayalım
      image: item.image,
      // Supabase'den gelen count yapısı { count: number }[] şeklindedir.
      total_words: item.WordListItems[0]?.count || 0
    }));

    return mappedData;

  } catch (error) {
    // Hatanın zaten loglandığını varsayalım, tekrar loglamaya gerek yok
    // console.error('Error fetching word lists:', error);
    throw error; // Hatanın yukarıya iletilmesi önemli
  }
};
