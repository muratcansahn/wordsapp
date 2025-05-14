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
  skipped_wordlist_ids?: string[];
}

/**
 * Kullanıcının skipped_wordlist_ids alanına bir wordListId ekler
 * @param userId Kullanıcı ID'si
 * @param wordListId Eklenecek kelime listesi ID'si
 */
export const addSkippedWordListId = async (userId: string, wordListId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Önce mevcut skipped_wordlist_ids dizisini al
    const { data, error } = await supabase
      .from('UserGameRequestDates')
      .select('skipped_wordlist_ids')
      .eq('user_id', userId)
      .single();

    let newSkippedIds: string[] = [];
    if (data && Array.isArray(data.skipped_wordlist_ids)) {
      // Zaten varsa, tekrar eklenmesin
      if (!data.skipped_wordlist_ids.includes(wordListId)) {
        newSkippedIds = [...data.skipped_wordlist_ids, wordListId];
      } else {
        newSkippedIds = data.skipped_wordlist_ids;
      }
    } else {
      newSkippedIds = [wordListId];
    }

    // upsert ile güncelle veya ekle
    const { error: upsertError } = await supabase
      .from('UserGameRequestDates')
      .upsert([
        {
          user_id: userId,
          skipped_wordlist_ids: newSkippedIds
        }
      ], { onConflict: 'user_id' });

    if (upsertError) {
      return { success: false, error: upsertError.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

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
      .maybeSingle(); // single yerine maybeSingle kullanıyoruz

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Son oyun zamanları getirilemedi:', error);
      return;
    }
    
    // Eğer kullanıcının oyun hakları kaydı yoksa yeni kayıt oluşturalım
    if (!lastRequests) {
      console.log('⚠️ Kullanıcının oyun hakları kaydı bulunamadı');
      
      // Önce kullanıcının Users tablosunda var olup olmadığını kontrol edelim
      const { data: userExists, error: userCheckError } = await supabase
        .from('Users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (userCheckError) {
        console.error('❌ Kullanıcı kontrolü yapılırken hata oluştu:', userCheckError);
        return;
      }
      
      if (!userExists) {
        console.error(`❌ Kullanıcı ID: ${userId} Users tablosunda bulunamadı. Önce kullanıcıyı oluşturmanız gerekiyor.`);
        return;
      }
      
      console.log('✅ Kullanıcı doğrulandı, oyun hakları kaydı oluşturuluyor');
      const currentDate = new Date().toISOString();
      
      try {
        const { error: insertError } = await supabase
          .from('UserGameRequestDates')
          .insert([
            {
              user_id: userId,
              dailywords: currentDate,
              wordguess: currentDate,
              wordmatching: currentDate,
              dailywords_remaining: 2,
              wordguess_remaining: 2,
              wordmatching_remaining: 2,
              skipped_wordlist_ids: [] // Boş array olarak başlat
            },
          ]);
        
        if (insertError) {
          console.error('❌ Oyun hakları kaydı oluşturulamadı:', insertError);
          return;
        }
        
        console.log('✅ Yeni oyun hakları kaydı oluşturuldu');
      } catch (insertCatchError) {
        console.error('❌ Beklenmeyen hata:', insertCatchError);
      }
      return; // İlk oluşturmadan sonra diğer kontrolleri atla
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
