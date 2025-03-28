import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/common/typography';
import { ThemedView } from '@/components/common/view';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-root-toast';
import { RootState } from '@/store';
import { supabase } from '@/lib/supabase';
import { fetchWordStatuses, updateWordStatus } from '@/services/userWordStatusService';
import { updateUserStats, incrementWordStatusCounter } from '@/store/userSlice';
import { Colors } from '@/constants/Colors';
import { BORDER_RADIUS, FLEX, FONT_SIZE, ICON_SIZE, MARGIN, PADDING } from '@/constants/AppConstants';
import { useTheme } from '@/hooks/theme/useTheme';
import NativeLoader from '@/components/common/loader/native-loader';

// Kelime tipi tanımı
interface WordItem {
  id: number;
  text: string;
  translation: string;
  example: string;
  example_original: string;
  status: number;
}

export default function WordListScreen() {
  const { mode } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { type } = params;
  
  const [title, setTitle] = useState('');
  
  // Redux'tan kullanıcı bilgilerini al
  const { id: userId } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  
  // Sayfa yüklendiğinde title parametresini al
  useEffect(() => {
    if (params.title) {
      setTitle(params.title as string);
    }
  }, [params]);
  console.log(params)
  
  // Kelime durumlarını saklamak için state
  const [userWordStatuses, setUserWordStatuses] = useState<any[]>([]);
  const [words, setWords] = useState<WordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sayfa yüklendiğinde kelime durumlarını çek
  useEffect(() => {
    const fetchUserWordStatuses = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('UserWordStatuses')
          .select('*')
          .eq('user_id', userId).eq('status', params.id)
        if (error) {
          console.error('Kelime durumları çekilirken hata:', error);
          setIsLoading(false);
          return;
        }
        console.log('Kelime durumları:', data);
        
        setUserWordStatuses(data || []);
        
        // Kelime durumları alındıktan sonra kelime detaylarını çek
        if (data && data.length > 0) {
          await fetchWordDetails(data);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Kelime durumları çekilirken beklenmeyen hata:', error);
        setIsLoading(false);
      }
    };

    if (userId && params.id) {
      fetchUserWordStatuses();
    } else {
      setIsLoading(false);
    }
  }, [userId, params.id, i18n.language]);

  // Kelime detaylarını çek
  const fetchWordDetails = async (wordStatuses: any[]) => {
    try {
      // Kelime ID'lerini al
      const wordIds = wordStatuses.map(status => status.word_id);
      
      // Words tablosundan kelime bilgilerini çek
      const { data: wordsData, error: wordsError } = await supabase
        .from('Words')
        .select('id, name')
        .in('id', wordIds)
      
      
      if (wordsError) {
        console.error('Kelimeler çekilirken hata:', wordsError);
        setIsLoading(false);
        return;
      }
      
      // WordTranslations tablosundan çevirileri çek
      const { data: translationsData, error: translationsError } = await supabase
      .from('WordTranslations')
      .select('word_id, mean, example_mean, example_original')
      .in('word_id', wordIds)
      .eq('culture', i18n.language)
      
      if (translationsError) {
        console.error('Çeviriler çekilirken hata:', translationsError);
        setIsLoading(false);
        return;
      }
      
      // Verileri birleştir
      const combinedWords: WordItem[] = wordsData.map(word => {
        // Kelimeye ait çeviriyi bul
        const translation = translationsData.find(t => t.word_id === word.id)?.mean || '';
        const example = translationsData.find(t => t.word_id === word.id)?.example_mean || '';
        const example_original = translationsData.find(t => t.word_id === word.id)?.example_original || '';
        
        // Kelimeye ait durumu bul
        const status = wordStatuses.find(s => s.word_id === word.id)?.status || 0;
        
        return {
          id: word.id,
          text: word.name,
          translation,
          example,
          example_original,
          status
        };
      });
      
      setWords(combinedWords);
    } catch (error) {
      console.error('Kelime detayları çekilirken beklenmeyen hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Kelime durumunu güncelle
  const handleUpdateStatus = async (wordId: number, newStatus: number) => {
    const success = await updateWordStatus(wordId, userId, newStatus);
    
    if (success) {
      // Kelimeyi listeden kaldır
      setWords(prevWords => {
        const updatedWords = prevWords.filter(word => word.id !== wordId);
        // Eğer kalan kelime yoksa, loading durumunu kapat
        if (updatedWords.length === 0) {
          setIsLoading(false);
        }
        return updatedWords;
      });
      
      // Toast bildirimi göster
      Toast.show(
        newStatus === 1 
          ? t('wordMarkedAsKnown') 
          : newStatus === 2 
            ? t('wordMarkedAsUnknown')
            : t('wordMarkedAsFavorite'), 
        {
          duration: Toast.durations.SHORT,
          position: Toast.positions.TOP,
          shadow: true,
          animation: true,
          hideOnPress: true,
          backgroundColor: '#10B981', // Yeşil renk (success)
          textColor: '#FFFFFF',
          delay: 0,
        }
      );
      
      // Dashboard'daki kelime istatistiklerini güncelle
      try {
        const { knownCount, unknownCount } = await fetchWordStatuses(userId);
        dispatch(updateUserStats({
          known_words: knownCount,
          unknown_words: unknownCount
        }));
        
        // Kelime durumu sayacını artır
        dispatch(incrementWordStatusCounter());
      } catch (error) {
        console.error('Dashboard istatistikleri güncellenirken hata:', error);
      }
    } else {
      // Hata durumunda Toast bildirimi göster
      Toast.show(t('failedToUpdateWordStatus'), {
        duration: Toast.durations.LONG,
        position: Toast.positions.TOP,
        shadow: true,
        animation: true,
        hideOnPress: true,
        backgroundColor: '#EF4444', // Kırmızı renk
        textColor: '#FFFFFF',
        delay: 0,
      });
    }
  };
   
  // Kelime kartını render et
  const renderWordItem = ({ item }: { item: WordItem }) => (
    <View style={[styles.wordCard, { backgroundColor: Colors[mode].card }]}>
      <View style={styles.wordContent}>
        <ThemedText style={styles.wordText}>{item.text}</ThemedText>
        <ThemedText style={styles.translationText}>{item.translation}</ThemedText>
        <ThemedText style={styles.exampleText}>{item.example}</ThemedText>
        <ThemedText style={styles.exampleOriginalText}>{item.example_original}</ThemedText>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {item.status !== 1 && (
          <TouchableOpacity
            style={styles.actionButtonGreen}
            onPress={() => handleUpdateStatus(item.id, 1)}
          >
            <ThemedText style={styles.actionButtonText}>{t('known')}</ThemedText>
          </TouchableOpacity>
        )}
        {item.status !== 2 && (
          <TouchableOpacity
            style={styles.actionButtonRed}
            onPress={() => handleUpdateStatus(item.id, 2)}
          >
            <ThemedText style={styles.actionButtonText}>{t('unknown')}</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={ICON_SIZE.sm} color={Colors[mode].text} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <View style={styles.placeholder} />
      </View>
      
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <NativeLoader />
        </View>
      ) : words.length > 0 ? (
        <FlatList
          data={words}
          renderItem={renderWordItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            {t('noWordsFound')}
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
    paddingTop: PADDING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING.md,
    marginBottom: MARGIN.md,
  },
  backButton: {
    padding: PADDING.xs,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  placeholder: {
    width: ICON_SIZE.sm + PADDING.xs * 2,
  },
  listContent: {
    padding: PADDING.md,
    paddingBottom: PADDING.xl * 2,
  },
  wordCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: PADDING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: MARGIN.md,
    marginHorizontal: MARGIN.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  wordContent: {
    flex: 1,
  },
  wordText: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    marginBottom: MARGIN.xxs,
  },
  translationText: {
    fontSize: FONT_SIZE.sm,
    opacity: 0.7,
  },
  exampleText: {
    fontSize: FONT_SIZE.sm,
    opacity: 0.7,
  },
  exampleOriginalText: {
    fontSize: FONT_SIZE.sm,
    opacity: 0.7,
  },
  actionButtonGreen: {
    backgroundColor: '#10B981',
    paddingVertical: PADDING.xs,
    paddingHorizontal: PADDING.sm,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonRed: {
    backgroundColor: '#EF4444',
    paddingVertical: PADDING.xs,
    paddingHorizontal: PADDING.sm,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: PADDING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    opacity: 0.7,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
