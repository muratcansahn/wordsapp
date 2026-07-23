import { supabase } from '@/lib/supabase';
import { incrementPoint } from '@/store/userSlice';

interface WordStatusResult {
  knownCount: number;
  unknownCount: number;
}

/**
 * Belirli bir kelime listesinde kullanıcının "biliyorum" ve "bilmiyorum" olarak işaretlediği kelime sayılarını döner
 * @param userId Kullanıcı ID'si
 * @param listId Kelime listesi ID'si
 * @returns Bilinen ve bilinmeyen kelime sayılarını içeren nesne
 */
/**
 * Tüm kelime listelerinin biliyorum/bilmiyorum istatistiklerini tek sorguda getirir
 * @param userId Kullanıcı ID'si
 * @returns Her liste için biliyorum/bilmiyorum sayılarını içeren nesne
 */
export const fetchAllListStats = async (
  userId: string
): Promise<Record<number, { biliyorum: number; bilmiyorum: number }>> => {
  if (!userId) {
    return {};
  }
  
  try {
    const { data, error } = await supabase.rpc('get_all_list_stats', { user_id: userId });
    
    if (error) {
      console.error('Tüm liste istatistikleri alınırken hata:', error);
      return {};
    }
    
    // Sonuçları list_id'ye göre bir nesneye dönüştür
    const statsMap: Record<number, { biliyorum: number; bilmiyorum: number }> = {};
    
    data.forEach((item: { list_id: number, biliyorum: any, bilmiyorum: any }) => {
      statsMap[item.list_id] = {
        biliyorum: Number(item.biliyorum) || 0,
        bilmiyorum: Number(item.bilmiyorum) || 0
      };
    });
    
    return statsMap;
  } catch (error) {
    console.error('Liste istatistikleri işlenirken hata:', error);
    return {};
  }
};

export const fetchKnownUnknownCounts = async (
  userId: string,
  listId: number
): Promise<{ biliyorum: number; bilmiyorum: number }> => {
  if (!userId || !listId) {
    return { biliyorum: 0, bilmiyorum: 0 };
  }
  try {
    // Önce ilgili kelime listesine ait word_id'leri al (WordListItems üzerinden)
    const { data: listItems, error: listItemsError } = await supabase
      .from('WordListItems')
      .select('word_id')
      .eq('word_list_id', listId);
  
    if (listItemsError || !listItems) {
      throw new Error('Kelime listesi itemları alınamadı');
    }
    const wordIds = listItems.map((item: { word_id: number }) => item.word_id);
    if (wordIds.length === 0) {
      return { biliyorum: 0, bilmiyorum: 0 };
    }
    // Kullanıcının bu kelimeler için işaretlediği durumları çek
    const { data: statuses, error: statusesError } = await supabase
      .from('UserWordStatuses')
      .select('status')
      .eq('user_id', userId)
      .in('word_id', wordIds);
    if (statusesError || !statuses) {
      throw new Error('Kullanıcı kelime durumları alınamadı');
    }
    // Durumlara göre sayım yap
    const biliyorum = statuses.filter((s: { status: number }) => s.status === 1).length;
    const bilmiyorum = statuses.filter((s: { status: number }) => s.status === 2).length;
    return { biliyorum, bilmiyorum };
  } catch (error) {
    console.error('Kullanıcı kelime listesi istatistiği alınırken hata:', error);
    return { biliyorum: 0, bilmiyorum: 0 };
  }
};

/**
 * UserWordStatuses tablosundan kullanıcının kelime durumlarını çeker
 * @param userId Kullanıcı ID'si
 * @returns Bilinen ve bilinmeyen kelime sayılarını içeren nesne
 */
export const fetchWordStatuses = async (userId: string): Promise<WordStatusResult> => {
  if (!userId) {
    return { knownCount: 0, unknownCount: 0 };
  }
  
  try {
    // Bilinen kelimeleri say (status = 1) — head:true ile sadece count
    // dönülür, satırların tamamı (tüm kolonlar) çekilmez.
    const { count: knownCount, error: knownError } = await supabase
      .from('UserWordStatuses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 1);

    if (knownError) {
      console.error('Bilinen kelimeler çekilirken hata:', knownError);
    }

    // Bilinmeyen kelimeleri say (status = 2)
    const { count: unknownCount, error: unknownError } = await supabase
      .from('UserWordStatuses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 2);

    if (unknownError) {
      console.error('Bilinmeyen kelimeler çekilirken hata:', unknownError);
    }

    return { knownCount: knownCount || 0, unknownCount: unknownCount || 0 };
  } catch (error) {
    console.error('Kelime durumları işlenirken hata:', error);
    return { knownCount: 0, unknownCount: 0 };
  }
};

/**
 * Kullanıcının point değerini bir artırır
 * @param userId Kullanıcı ID'si
 * @returns Başarılı olup olmadığını gösteren boolean değer
 */
export const incrementUserPoint = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Önce mevcut point değerini al
    const { data: userData, error: fetchError } = await supabase
      .from('Users')
      .select('point')
      .eq('id', userId)
      .single();
    
    if (fetchError) {
      console.error('Point değeri alınırken hata:', fetchError);
      return false;
    }
    
    // Mevcut point değerini bir artır
    const currentPoint = userData?.point || 0;
    const newPoint = currentPoint + 1;
    
    // Point değerini güncelle
    const { error: updateError } = await supabase
      .from('Users')
      .update({ point: newPoint })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Point güncellenirken hata:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Point artırılırken hata:', error);
    return false;
  }
};

/**
 * Kullanıcının point değerini hem veritabanında hem de Redux store'da artırır
 * @param userId Kullanıcı ID'si
 * @param dispatch Redux dispatch fonksiyonu
 * @returns Başarılı olup olmadığını gösteren boolean değer
 */
export const incrementUserPointWithRedux = async (
  userId: string,
  dispatch: any
): Promise<boolean> => {
  const success = await incrementUserPoint(userId);
  if (success) {
    dispatch(incrementPoint());
  }
  return success;
};

/**
 * Kullanıcının point değerini belirli bir miktar artırır
 * @param userId Kullanıcı ID'si
 * @param amount Artırılacak miktar (varsayılan: 1)
 * @returns Yeni puan değeri ve işlemin başarılı olup olmadığını içeren nesne
 */
export const incrementUserPointByAmount = async (
  userId: string,
  amount: number = 1
): Promise<{ success: boolean; newPoint: number }> => {
  if (!userId) return { success: false, newPoint: 0 };
  
  try {
    // Önce mevcut point değerini al
    const { data: userData, error: fetchError } = await supabase
      .from('Users')
      .select('point')
      .eq('id', userId)
      .single();
    
    if (fetchError) {
      console.error('Point değeri alınırken hata:', fetchError);
      return { success: false, newPoint: 0 };
    }
    
    // Mevcut point değerini belirtilen miktar kadar artır
    const currentPoint = userData?.point || 0;
    const newPoint = currentPoint + amount;
    
    // Point değerini güncelle
    const { error: updateError } = await supabase
      .from('Users')
      .update({ point: newPoint })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Point güncellenirken hata:', updateError);
      return { success: false, newPoint: currentPoint };
    }
    
    return { success: true, newPoint };
  } catch (error) {
    console.error('Point artırılırken hata:', error);
    return { success: false, newPoint: 0 };
  }
};

/**
 * Kullanıcının point değerini belirli bir miktar artırır ve Redux store'u günceller
 * @param userId Kullanıcı ID'si
 * @param dispatch Redux dispatch fonksiyonu
 * @param amount Artırılacak miktar (varsayılan: 1)
 * @returns Yeni puan değeri ve işlemin başarılı olup olmadığını içeren nesne
 */
export const incrementUserPointByAmountWithRedux = async (
  userId: string,
  dispatch: any,
  amount: number = 1
): Promise<{ success: boolean; newPoint: number }> => {
  const result = await incrementUserPointByAmount(userId, amount);
  if (result.success) {
    // Redux store'u güncelle - burada her 1 puan için bir kez dispatch çağrılır
    for (let i = 0; i < amount; i++) {
      dispatch(incrementPoint());
    }
  }
  return result;
};
