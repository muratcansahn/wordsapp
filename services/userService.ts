import { supabase } from '@/lib/supabase';

interface WordStatusResult {
  knownCount: number;
  unknownCount: number;
}

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
    // Bilinen kelimeleri say (status = 1)
    const { data: knownData, error: knownError } = await supabase
      .from('UserWordStatuses')
      .select('*', { count: 'exact', head: false })
      .eq('user_id', userId)
      .eq('status', 1);
    
    if (knownError) {
      console.error('Bilinen kelimeler çekilirken hata:', knownError);
    }
    
    // Bilinmeyen kelimeleri say (status = 2)
    const { data: unknownData, error: unknownError } = await supabase
      .from('UserWordStatuses')
      .select('*', { count: 'exact', head: false })
      .eq('user_id', userId)
      .eq('status', 2);
    
    if (unknownError) {
      console.error('Bilinmeyen kelimeler çekilirken hata:', unknownError);
    }
    
    // Sayıları al
    const knownCount = knownData?.length || 0;
    const unknownCount = unknownData?.length || 0;
    
    return { knownCount, unknownCount };
  } catch (error) {
    console.error('Kelime durumları işlenirken hata:', error);
    return { knownCount: 0, unknownCount: 0 };
  }
};
