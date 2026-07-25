import { supabase } from '@/lib/supabase';

// learn/index.tsx'teki ApiWordList ile uyumlu hale getirelim
export interface ApiWordList {
  id: number;
  description: string; // desc_tr'yi buraya map edeceğiz
  image: string;
  total_words: number; // Kelime sayısı için
}

// "Ücretsiz liste" (free-tier'da erişilebilir tek liste) her zaman en düşük
// numaralı WordLists.id olarak sabitlenir. Bunu, sayfalanmış/grup RPC'lerinin
// döndürdüğü ilk satıra (`wordLists[0]?.id`) güvenerek belirlemiyoruz; o sıra
// backend/dil/sayfa değişikliğiyle sessizce değişebilir. Şemada is_free gibi
// bir kolon yok, bu yüzden en düşük id istemci tarafında açıkça sorgulanıp
// sabitleniyor.
export const getFreeWordListId = async (): Promise<number | undefined> => {
  const { data, error } = await supabase
    .from('WordLists')
    .select('id')
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Ücretsiz liste id\'si alınırken hata:', error);
    return undefined;
  }

  return data?.id;
};

export const getWordLists = async (): Promise<ApiWordList[]> => {
  try {
    // Performans iyileştirmesi:
    // 1. name alanını ekledik (eksikti)
    // 2. Sorguyu daha verimli hale getirdik
    // 3. Supabase'de bu alanlar için indeks oluşturulmalı
    const { data, error } = await supabase
      .from('WordLists')
      .select(`
        id,
                desc_tr,
        image,
        WordListItems(count)
      `)
      .order('id'); // Tutarlı sıralama için

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    // Gelen veriyi ApiWordList arayüzüne map edelim
    const mappedData = data.map(item => ({
      id: item.id,
      description: item.desc_tr,
      image: item.image,
      total_words: item.WordListItems[0]?.count || 0
    }));

    return mappedData;

  } catch (error) {
    console.error('Error fetching word lists:', error);
    throw error;
  }
};

// Sayfalama ile kelime listelerini getiren daha verimli bir fonksiyon
// Bu fonksiyon, büyük veri setleri için daha iyi performans sağlar
export const getWordListsPaginated = async (
  page: number = 1,
  pageSize: number = 50
): Promise<{ data: ApiWordList[]; total: number }> => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    console.log('Fetching word lists from', from, 'to', to);

    // 1. İlk olarak toplam sayıyı ve sayfalama yapılacak ID'leri al
    const { data: listData, count, error: listError } = await supabase
      .from('WordLists')
      .select('id', { count: 'exact' })
      .order('id')
      .range(from, to);

    console.log('List data:', listData);
    console.log('List error:', listError);

    if (listError) {
      console.error('Error fetching word lists:', listError);
      throw new Error(`Error fetching word lists: ${listError.message}`);
    }

    // 2. Eğer hiç veri yoksa erken dönüş yap
    if (!listData || listData.length === 0) {
      console.log('No word lists found');
      return { data: [], total: 0 };
    }

    // 3. Toplu olarak kelime sayılarını al
    const listIds = listData.map(item => item.id);
    console.log('List IDs for word counts:', listIds);
    
    // Önce tablonun yapısını kontrol etmek için bilgi alalım
    const { data: tableInfo } = await supabase
      .from('WordListItems')
      .select('*')
      .limit(1);
      
    console.log('WordListItems table sample:', tableInfo);
    
    // Sütun adlarını kontrol edip uygun sütun adını kullanalım
    const wordCounts: Array<{list_id: number, word_count: number}> = [];
    
    // Her liste için ayrı ayrı sorgu yapalım
    for (const listId of listIds) {
      try {
        const { count, error: countError } = await supabase
          .from('WordListItems')
          .select('*', { count: 'exact', head: true })
          .eq('list_id', listId); // list_id veya listId olabilir
          
        if (countError) {
          console.error(`Error counting words for list ${listId}:`, countError);
          // Hata olsa bile devam et, sadece 0 olarak işaretle
          wordCounts.push({
            list_id: listId,
            word_count: 0
          });
          continue;
        }
        
        wordCounts.push({
          list_id: listId,
          word_count: count || 0
        });
      } catch (error) {
        console.error(`Unexpected error processing list ${listId}:`, error);
        wordCounts.push({
          list_id: listId,
          word_count: 0
        });
      }
    }

    console.log('Word counts response:', wordCounts);

    console.log('Word counts:', wordCounts);
    console.log('List IDs:', listIds);


    // 4. Kelime sayılarını wordCounts'tan al
    const wordCountMap = new Map<number, number>();
    
    // Her liste için hesaplanan kelime sayılarını ata
    wordCounts.forEach(item => {
      wordCountMap.set(item.list_id, item.word_count);
    });
    
    // Eğer herhangi bir liste için veri yoksa 0 olarak ayarla
    listIds.forEach(id => {
      if (!wordCountMap.has(id)) {
        wordCountMap.set(id, 0);
      }
    });

    console.log('Word count map:', Object.fromEntries(wordCountMap));

    // 5. Son olarak tüm detayları tek seferde al
    const { data: fullData, error: detailError } = await supabase
      .from('WordLists')
      .select('id, desc_tr, image')
      .in('id', listIds)
      .order('id');

    console.log('Full data:', fullData);

    if (detailError) {
      console.error('Error fetching word list details:', detailError);
      throw new Error(`Error fetching word list details: ${detailError.message}`);
    }

    // 6. Verileri birleştir
    const mappedData = fullData.map(item => ({
      id: item.id,
      description: item.desc_tr,
      image: item.image,
      total_words: wordCountMap.get(item.id) || 0
    }));

    return {
      data: mappedData,
      total: count || 0
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Bilinmeyen bir hata oluştu';
      
    console.error('Error in getWordListsPaginated:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'UnknownError'
    });
    
    throw new Error(`Kelime listeleri alınırken hata oluştu: ${errorMessage}`);
  }
};
export const getWordListsPaginatedWithGroupBy = async (
  page: number = 1,
  pageSize: number = 10,
  language: string = 'tr'
): Promise<any> => {
  try {
    const from = (page - 1) * pageSize;
    
    // 1. Toplam kayıt sayısını al
    const { count, error: countError } = await supabase
      .from('WordLists')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // 2. Dil parametresine göre uygun RPC fonksiyonunu çağır
    let rpcName = '';
    
    // Desteklenen diller
    const supportedLanguages = ['tr', 'de', 'es'];
    
    // Dil parametresini normalize et (tr-TR -> tr)
    const normalizedLanguage = language.split('-')[0].toLowerCase();
    
    // Dil parametresine göre uygun RPC fonksiyonunu belirle
    if (supportedLanguages.includes(normalizedLanguage)) {
      rpcName = `get_word_lists_with_counts_${normalizedLanguage}`;
    } else {
      // Desteklenmeyen dil için varsayılan olarak Türkçe kullan
      console.warn(`Desteklenmeyen dil: ${language}, varsayılan olarak 'tr' kullanılıyor`);
      rpcName = 'get_word_lists_with_counts_tr';
    }
    
    // Seçilen RPC fonksiyonunu çağır
    const { data, error } = await supabase
      .rpc(rpcName, {
        offset_param: from,
        limit_param: pageSize
      });

    if (error) throw error;
    console.log('Kelime listeleri:', data);

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: data || [],
      page,
      pageSize,
      totalItems,
      totalPages
    };

  } catch (error) {
    console.error('Kelime listeleri çekilirken hata oluştu:', error);
    throw error;
  }
};
export interface WordStatus {
  word_id: number;
  word_name: string;
  status: number; // 0: bilinmiyor, 1: biliniyor, 2: öğreniliyor
  word_list_id: number;
  word_list_description: string;
  translation_mean?: string;
  translation_example?: string;
}

export interface WordStatusResponse {
  data: WordStatus[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}



