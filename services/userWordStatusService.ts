import { supabase } from '@/lib/supabase';

export interface WordStatus {
  word_id: number;
  status: number;
}

/**
 * Kullanıcının kelime durumunu günceller
 * @param wordId Kelime ID'si
 * @param userId Kullanıcı ID'si
 * @param status Durum (1: bilinen, 2: bilinmeyen, 3: favori)
 * @returns İşlem başarılı ise true, değilse false
 */
export const updateWordStatus = async (wordId: number, userId: string, status: number): Promise<boolean> => {
  try {
    // Önce mevcut durumu kontrol et
    const { data: existingStatus, error: checkError } = await supabase
      .from('UserWordStatuses')
      .select('*')
      .eq('word_id', wordId)
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116: Kayıt bulunamadı hatası
      throw checkError;
    }
    
    if (existingStatus) {
      // Mevcut kaydı güncelle
      const { error: updateError } = await supabase
        .from('UserWordStatuses')
        .update({ status })
        .eq('word_id', wordId)
        .eq('user_id', userId);
      
      if (updateError) throw updateError;
    } else {
      // Yeni kayıt oluştur
      const { error: insertError } = await supabase
        .from('UserWordStatuses')
        .insert([{ word_id: wordId, user_id: userId, status }]);
      
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error('Kelime durumu güncellenirken hata oluştu:', error);
    return false;
  }
};

/**
 * Kullanıcının kelime durumlarını çeker
 * @param userId Kullanıcı ID'si
 * @param status Durum filtresi (opsiyonel)
 * @returns Bilinen ve bilinmeyen kelime sayıları
 */
export const fetchWordStatuses = async (userId: string, status?: number): Promise<{knownCount: number, unknownCount: number}> => {
  try {
    // Bilinen kelimeler (status=1) — head:true ile satırlar değil sadece count dönülür
    const { count: knownCount, error: knownError } = await supabase
      .from('UserWordStatuses')
      .select('word_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 1);

    if (knownError) {
      console.error('Bilinen kelimeler çekilirken hata:', knownError);
      return { knownCount: 0, unknownCount: 0 };
    }

    // Bilinmeyen kelimeler (status=2)
    const { count: unknownCount, error: unknownError } = await supabase
      .from('UserWordStatuses')
      .select('word_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 2);

    if (unknownError) {
      console.error('Bilinmeyen kelimeler çekilirken hata:', unknownError);
      return { knownCount: knownCount || 0, unknownCount: 0 };
    }

    return {
      knownCount: knownCount || 0,
      unknownCount: unknownCount || 0
    };
  } catch (error) {
    console.error('Kelime istatistikleri çekilirken hata oluştu:', error);
    return { knownCount: 0, unknownCount: 0 };
  }
};

/**
 * Kullanıcının kelime istatistiklerini çeker
 * @param userId Kullanıcı ID'si
 * @returns Bilinen ve bilinmeyen kelime sayıları
 */
export const fetchWordStatusCounts = async (userId: string): Promise<{known: number, unknown: number}> => {
  try {
    // Bilinen kelimeler (status=1) — head:true ile satırlar değil sadece count dönülür
    const { count: known, error: knownError } = await supabase
      .from('UserWordStatuses')
      .select('word_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 1);

    if (knownError) {
      console.error('Bilinen kelimeler çekilirken hata:', knownError);
      return { known: 0, unknown: 0 };
    }

    // Bilinmeyen kelimeler (status=2)
    const { count: unknown, error: unknownError } = await supabase
      .from('UserWordStatuses')
      .select('word_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 2);

    if (unknownError) {
      console.error('Bilinmeyen kelimeler çekilirken hata:', unknownError);
      return { known: known || 0, unknown: 0 };
    }

    return {
      known: known || 0,
      unknown: unknown || 0
    };
  } catch (error) {
    console.error('Kelime istatistikleri çekilirken hata oluştu:', error);
    return { known: 0, unknown: 0 };
  }
};
