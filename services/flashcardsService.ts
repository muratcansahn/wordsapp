import { supabase } from '@/lib/supabase';

export interface FlashCard {
  id: string;
  word: string;
  translation: string;
  example: string;
  example_original?: string;
  status?: number;
}

export interface WordListWithItems {
  id: string;
  title: string;
  subtitle?: string;
  level?: string;
  cards: FlashCard[];
}

export const fetchWordListItems = async (listId: string): Promise<WordListWithItems> => {
  try {
    // Önce kelime listesinin detaylarını çek
    const { data: wordList, error: wordListError } = await supabase
      .from('WordLists')
      .select('id, name, description')
      .eq('id', listId)
      .single();

    if (wordListError) {
      throw new Error(`Liste detayları çekilirken hata: ${wordListError.message}`);
    }

    // Liste ID'sine ait kelime ID'lerini çek
    const { data: wordListItems, error: wordListItemsError } = await supabase
      .from('WordListItems')
      .select('word_id')
      .eq('word_list_id', listId);
    
    if (wordListItemsError) {
      throw new Error(`Liste kelimeleri çekilirken hata: ${wordListItemsError.message}`);
    }
    
    // Kelime ID'lerini al
    const wordIds = wordListItems.map(item => item.word_id);
    
    // Kelimeleri çek
    const { data: words, error: wordsError } = await supabase
      .from('Words')
      .select('id, name')
      .in('id', wordIds);
    
    if (wordsError) {
      throw new Error(`Kelimeler çekilirken hata: ${wordsError.message}`);
    }
    
    if (!words || words.length === 0) {
      return {
        id: listId,
        title: wordList.name,
        subtitle: wordList.description,
        cards: []
      };
    }
    
    // Kelimelerin çevirilerini çek
    const { data: translations, error: translationsError } = await supabase
      .from('WordTranslations')
      .select('word_id, mean, example_mean, example_original')
      .in('word_id', wordIds);
    
    if (translationsError) {
      throw new Error(`Çeviriler çekilirken hata: ${translationsError.message}`);
    }
    
    // Kullanıcının kelime durumlarını çek (eğer kullanıcı giriş yapmışsa)
    const user = await supabase.auth.getUser();
    let wordStatuses: any[] = [];
    
    if (user.data?.user) {
      const { data: statuses, error: statusesError } = await supabase
        .from('UserWordStatuses')
        .select('word_id, status')
        .eq('user_id', user.data.user.id)
        .in('word_id', wordIds);
        
      if (!statusesError && statuses) {
        wordStatuses = statuses;
      }
    }
    
    // Kelimeleri, çevirileri ve durumları birleştir
    const flashCards: FlashCard[] = words.map(word => {
      const wordTranslation = translations?.find(t => t.word_id === word.id);
      const wordStatus = wordStatuses.find(s => s.word_id === word.id);
      
      return {
        id: word.id.toString(),
        word: word.name,
        translation: wordTranslation?.mean || '',
        example: wordTranslation?.example_mean || '',
        example_original: wordTranslation?.example_original || '',
        status: wordStatus?.status || 0
      };
    });
    
    return {
      id: listId,
      title: wordList.name,
      subtitle: wordList.description,
      cards: flashCards
    };
  } catch (error) {
    console.error('Liste öğeleri çekilirken hata oluştu:', error);
    return {
      id: listId,
      title: 'Liste Yüklenemedi',
      subtitle: 'Bir hata oluştu',
      level: '-',
      cards: []
    };
  }
};
