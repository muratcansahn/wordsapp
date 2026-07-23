import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/common/typography';
import { ThemedView } from '@/components/common/view';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-root-toast';
import { RootState } from '@/store';
import { supabase } from '@/lib/supabase';
import { fetchWordStatuses, updateWordStatus } from '@/services/userWordStatusService';
import { updateUserStats, incrementWordStatusCounter } from '@/store/userSlice';
import { Colors } from '@/constants/Colors';
import { FLEX, FONT_SIZE, ICON_SIZE, MARGIN, PADDING } from '@/constants/AppConstants';
import { useTheme } from '@/hooks/theme/useTheme';
import NativeLoader from '@/components/common/loader/native-loader';
import { buildWordItems, WordItem } from '@/utils/word-list-utils';

export default function WordListScreen() {
  const { mode } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const title = typeof params.title === 'string' ? params.title : '';
  
  // Redux'tan kullanıcı bilgilerini al
  const { id: userId } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  
  // Kelime durumlarını saklamak için state
  const [words, setWords] = useState<WordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ekrandan çıkıldığında devam eden fetch'lerin unmount sonrası setState
  // yapmaması için basit bir mounted guard.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Kelime detaylarını çek
  const fetchWordDetails = useCallback(async (wordStatuses: any[]) => {
    try {
      // Kelime ID'lerini al
      const wordIds = wordStatuses.map(status => status.word_id);
      
      // Words tablosundan kelime bilgilerini çek
      const { data: wordsData, error: wordsError } = await supabase
        .from('Words')
        .select('id, name')
        .in('id', wordIds)

      if (!isMountedRef.current) return;
      if (wordsError) {
        console.error('Kelimeler çekilirken hata:', wordsError);
        setIsLoading(false);
        return;
      }

      // WordTranslations tablosundan çevirileri çek
      const { data: translationsData, error: translationsError } = await supabase
      .from('WordTranslations')
      .select('word_id, mean, example_translated, example_original')
      .in('word_id', wordIds)
      .eq('language_code', i18n.language)

      if (!isMountedRef.current) return;
      if (translationsError) {
        console.error('Çeviriler çekilirken hata:', translationsError);
        setIsLoading(false);
        return;
      }

      setWords(buildWordItems(wordsData || [], translationsData || [], wordStatuses));
    } catch (error) {
      console.error('Kelime detayları çekilirken beklenmeyen hata:', error);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [i18n.language]);

  // Sayfa yüklendiğinde kelime durumlarını çek
  useEffect(() => {
    const fetchUserWordStatuses = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('UserWordStatuses')
          .select('*')
          .eq('user_id', userId).eq('status', params.id)
        if (!isMountedRef.current) return;
        if (error) {
          console.error('Kelime durumları çekilirken hata:', error);
          setIsLoading(false);
          return;
        }
        // Kelime durumları alındıktan sonra kelime detaylarını çek
        if (data && data.length > 0) {
          await fetchWordDetails(data);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Kelime durumları çekilirken beklenmeyen hata:', error);
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    if (userId && params.id) {
      fetchUserWordStatuses();
    } else {
      Promise.resolve().then(() => setIsLoading(false));
    }
  }, [userId, params.id, fetchWordDetails]);

  // Kelime durumunu güncelle
  const handleUpdateStatus = useCallback(async (wordId: number, newStatus: number) => {
    // Hafif haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          containerStyle: {
            marginTop: 20, // Üstten boşluk ekle
            borderRadius: 15, // Daha yuvarlak köşeler
            paddingHorizontal: 16,
            paddingVertical: 10,
          }
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
  }, [dispatch, t, userId]);
   
  // Kelime kartını render et
  const renderWordItem = useCallback(({ item }: { item: WordItem }) => (
  <View style={styles.wordCardModern}>
    <View style={styles.cardHeader}>
      <View style={styles.wordContentModern}>
        <ThemedText style={styles.wordTextModern}>{item.text}</ThemedText>
        <ThemedText style={styles.translationTextModern}>{item.translation}</ThemedText>
      </View>
      <View style={styles.actionButtonsRow}>
        {item.status !== 1 && (
          <TouchableOpacity
            style={styles.actionButtonModernGreen}
            onPress={() => handleUpdateStatus(item.id, 1)}
            activeOpacity={0.85}
          >
            <ThemedText style={styles.actionButtonModernText}>{t('wordListKnownButton')}</ThemedText>
          </TouchableOpacity>
        )}
        {item.status !== 2 && (
          <TouchableOpacity
            style={styles.actionButtonModernRed}
            onPress={() => handleUpdateStatus(item.id, 2)}
            activeOpacity={0.85}
          >
            <ThemedText style={styles.actionButtonModernText}>{t('wordListUnknownButton')}</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
    <View style={styles.exampleContainer}>
      {item.example ? (
        <ThemedText style={styles.exampleTextModern}>{item.example}</ThemedText>
      ) : null}
      {item.example_original ? (
        <ThemedText style={styles.exampleOriginalTextModern}>{item.example_original}</ThemedText>
      ) : null}
    </View>
  </View>
), [handleUpdateStatus, t]);
  
  return (
    <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainerCenter}>
            <ThemedText style={styles.title}>{title}</ThemedText>
          </View>
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
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews
          />
        ) : (
          <View style={styles.emptyContainerModern}>
            <View style={styles.emptyCardBox}>
              <ThemedText style={[
                styles.emptyTitle,
                { color: mode === 'dark' ? Colors.dark.text : Colors.light.text }
              ]}>
                {t('emptyTitle')}
              </ThemedText>
              <ThemedText style={[
                styles.emptyDesc,
                { color: mode === 'dark' ? Colors.dark.text : Colors.light.text }
              ]}>
                {t('emptyDesc')}
              </ThemedText>
              <TouchableOpacity
                style={[
                  styles.emptyAddButton,
                  { backgroundColor: mode === 'dark' ? Colors.dark.secondary : Colors.light.secondary }
                ]}
                onPress={() => router.back()}
              >
                <ThemedText style={[
                  styles.emptyAddButtonText,
                  { color: mode === 'dark' ? Colors.dark.background : Colors.light.background }
                ]}>
                  Geri Dön
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');

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
    marginTop: MARGIN.xl,
    marginBottom: MARGIN.md,
  },
  headerBackButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#00A3FF',
    marginLeft: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  titleContainerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  placeholder: {
    width: ICON_SIZE.sm + PADDING.xs * 2,
  },
  listContent: {
    padding: PADDING.sm,
    paddingBottom: PADDING.xl * 2,
  },
  wordCardModern: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: MARGIN.md,
    marginHorizontal: 4,
    padding: PADDING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.12)',
    maxWidth: width - PADDING.md * 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  wordContentModern: {
    flex: 1,
  },
  exampleContainer: {
    width: '100%',
    marginTop: 6,
  },
  wordTextModern: {
    fontSize: FONT_SIZE.md + 1,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 3,
  },
  translationTextModern: {
    fontSize: FONT_SIZE.sm + 1,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 2,
  },
  exampleTextModern: {
    fontSize: FONT_SIZE.sm - 1,
    color: '#374151',
    opacity: 0.85,
    marginBottom: 2,
  },
  exampleOriginalTextModern: {
    fontSize: FONT_SIZE.sm - 1,
    color: '#6B7280',
    opacity: 0.7,
    marginBottom: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButtonModernGreen: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
    marginLeft: 0,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonModernRed: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
    marginLeft: 0,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonModernText: {
    color: '#fff',
    fontSize: FONT_SIZE.sm + 1,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  emptyContainerModern: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  emptyCardBox: {
    width: '90%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderColor: Colors.light.primary,
    borderWidth: 2,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg + 4,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: FONT_SIZE.md + 1,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  emptyAddButton: {
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyAddButtonText: {
    fontWeight: 'bold',
    fontSize: FONT_SIZE.md + 1,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
