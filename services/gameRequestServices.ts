import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export type GameType = 'dailywords' | 'wordguess' | 'wordmatching';

interface GameRequestUpdate {
  dailywords_remaining: number;
  wordguess_remaining: number;
  wordmatching_remaining: number;
}

interface GameRequestFields {
  dailywords: string | null;
  wordguess: string | null;
  wordmatching: string | null;
  dailywords_remaining: number;
  wordguess_remaining: number;
  wordmatching_remaining: number;
}

interface UserGameRequestDates {
  dailywords: string | null;
  wordguess: string | null;
  wordmatching: string | null;
  dailywords_remaining: number;
  wordguess_remaining: number;
  wordmatching_remaining: number;
}

/**
 * Kullanıcının oyun haklarını kontrol eder ve günceller
 * @param userId Kullanıcı ID'si
 */
export const checkAndUpdateGameRequests = async (userId: string) => {
  try {
    console.log('🎮 Oyun hakları kontrolü başlatıldı - Kullanıcı ID:', userId);

    const { data: lastRequests, error } = await supabase
      .from('UserGameRequestDates')
      .select('dailywords, wordguess, wordmatching, dailywords_remaining, wordguess_remaining, wordmatching_remaining')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Son oyun zamanları getirilemedi:', error);
      return;
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    const updates: Partial<GameRequestUpdate> = {};
    const gameTypes: GameType[] = ['dailywords', 'wordguess', 'wordmatching'];

    console.log(`🌍 Kullanıcı zaman dilimi: ${timeZone}`);

    for (const gameType of gameTypes) {
      const lastDate = lastRequests?.[gameType];
      const remainingField = `${gameType}_remaining` as keyof GameRequestUpdate;
      const currentRemaining = lastRequests?.[remainingField] ?? 0;

      if (!lastDate) {
        console.log(`⚠️ ${gameType} için son oyun tarihi bulunamadı`);
        continue;
      }

      // ISO string'i tarihe çevir ve local time olarak kullan
      const lastRequestDate = new Date(lastDate);
      const localLastRequestDate = new Date(lastRequestDate.getTime() - (lastRequestDate.getTimezoneOffset() * 60000));
      const hoursDiff = (now.getTime() - localLastRequestDate.getTime()) / (1000 * 60 * 60);

      console.log(`📅 Son oyun tarihi (yerel): ${format(localLastRequestDate, 'yyyy-MM-dd HH:mm:ss')}`);
      console.log(`⏰ Geçen saat: ${hoursDiff.toFixed(2)}`);
      console.log(`🎯 Mevcut hak: ${currentRemaining}`);

      if (hoursDiff >= 8) {
        // 8 saat geçmişse ve hak 0 ise 2 hak, 1 ise 1 hak ekle
        if (currentRemaining === 0) {
          updates[remainingField] = 2;
          console.log(`✨ 8+ saat geçmiş ve hak 0: 2 hak ekleniyor. Yeni hak: ${updates[remainingField]}`);
        } else if (currentRemaining === 1) {
          updates[remainingField] = 2;
          console.log(`✨ 8+ saat geçmiş ve hak 1: 1 hak ekleniyor. Yeni hak: ${updates[remainingField]}`);
        } else {
          console.log('ℹ️ Maksimum hak sayısına ulaşıldı (2)');
        }
      } else if (hoursDiff >= 4) {
        // 4 saat geçmişse ve hak 1'den azsa 1 hak ekle
        if (currentRemaining < 1) {
          updates[remainingField] = 1;
          console.log(`✨ 4+ saat geçmiş ve hak < 1: 1 hak ekleniyor. Yeni hak: ${updates[remainingField]}`);
        } else {
          console.log('ℹ️ Yeterli hak mevcut, ekleme yapılmayacak');
        }
      } else {
        console.log('ℹ️ Yeterli süre geçmemiş, hak eklenmeyecek');
      }
    }

    if (Object.keys(updates).length > 0) {
      console.log('\n📝 Güncellenecek haklar:', updates);
      const { error: updateError } = await supabase
        .from('UserGameRequestDates')
        .update(updates)
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Oyun hakları güncellenirken hata:', updateError);
      } else {
        console.log('✅ Oyun hakları başarıyla güncellendi');
      }
    } else {
      console.log('\n📝 Güncellenecek hak bulunmadı');
    }
  } catch (error) {
    console.error('❌ checkAndUpdateGameRequests hatası:', error);
  }
};

/**
 * Oyun hakkını azaltır ve timestamp'i günceller
 * @param userId Kullanıcı ID'si
 * @param gameType Oyun türü
 */
export const updateGameRequestAndTimestamp = async (userId: string, gameType: GameType) => {
  try {
    const remainingField = `${gameType}_remaining` as keyof GameRequestFields;
    const timestampField = gameType;

    // Önce mevcut durumu kontrol et
    const { data: current, error: fetchError } = await supabase
      .from('UserGameRequestDates')
      .select(`${remainingField}`)
      .eq('user_id', userId)
      .single<Pick<GameRequestFields, typeof remainingField>>();

    if (fetchError) {
      console.error('Mevcut durum getirilemedi:', fetchError);
      return;
    }

    if (!current) {
      console.error('Kullanıcı verisi bulunamadı');
      return;
    }

    const remaining = Number(current[remainingField]);
    if (isNaN(remaining) || remaining <= 0) {
      console.error('Kalan hak bulunamadı veya hak kalmadı');
      return;
    }

    // Timestamp'i ve kalan hakkı güncelle
    const updates: Partial<GameRequestFields> = {
      [remainingField]: remaining - 1,
      ...(remaining === 2 ? { [timestampField]: new Date().toISOString() } : {})
    };

    const { error: updateError } = await supabase
      .from('UserGameRequestDates')
      .update(updates)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Güncelleme hatası:', updateError);
      return;
    }

    return { success: true, remaining: remaining - 1 };
  } catch (error) {
    console.error('Oyun hakkı güncellenirken hata:', error);
    return { success: false, error };
  }
};
