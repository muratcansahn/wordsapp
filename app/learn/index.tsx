import { View, Text, StyleSheet, TouchableOpacity,StatusBar, ActivityIndicator, RefreshControl, Animated } from 'react-native';
import { Image } from 'expo-image';
import React, { memo, useEffect, useRef } from 'react';
import { BORDER_RADIUS, PADDING, MARGIN } from '@/constants/AppConstants';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useCallback } from 'react';
import i18n from '@/i18n';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/SupabaseProvider';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getWordListsPaginatedWithGroupBy, getFreeWordListId } from '@/services/wordListService';
import { supabase } from '@/lib/supabase';
import { usePremiumLimits } from '@/hooks/usePremiumLimits';

type MaterialIconName = 'book-open-page-variant' | 'briefcase' | 'airplane' | 'check-circle' | 'chevron-right' | 'star';

interface ApiWordList {
  id: number;
  description: string;
  image: string;
  total_words: number;
}

interface WordList extends ApiWordList {
  total_words: number;
  icon: MaterialIconName;
  gradient: readonly [string, string];
}

const defaultGradients: readonly [string, string][] = [
  ['#6366F1', '#A5B4FC'], // Mavi-Mor
  ['#EC4899', '#F9A8D4'], // Pembe
  ['#F59E0B', '#FCD34D'], // Turuncu-Sarı
  ['#10B981', '#6EE7B7'], // Yeşil
  ['#8B5CF6', '#C4B5FD'], // Mor
  ['#EF4444', '#FCA5A5'], // Kırmızı
  ['#06B6D4', '#67E8F9'], // Cyan
  ['#84CC16', '#BEF264'], // Lime
  ['#F97316', '#FDBA74'], // Turuncu
  ['#6B7280', '#D1D5DB'], // Gri
  ['#DC2626', '#FEE2E2'], // Koyu Kırmızı
  ['#7C3AED', '#DDD6FE'], // İndigo
] as const;

const ITEMS_PER_PAGE = 10;

export default function LearnPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const scrollY = React.useMemo(() => new Animated.Value(0), []);
  
  // State tanımlamaları
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [wordLists, setWordLists] = useState<WordList[]>([]);
  const [knownUnknownMap, setKnownUnknownMap] = useState<Record<number, { biliyorum: number; bilmiyorum: number }>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [freeListId, setFreeListId] = useState<number | undefined>(undefined);

  const { user } = useAuth();
  const { canAccessList } = usePremiumLimits();

  // "Ücretsiz liste" her zaman en düşük id'li liste olarak sabitlenir; bu,
  // sayfalanmış RPC'nin ilk döndürdüğü listeye (wordLists[0]) güvenmekten
  // daha kararlıdır.
  useEffect(() => {
    getFreeWordListId().then(setFreeListId);
  }, []);
  const wordStatusUpdateCounter = useSelector((state: RootState) => state.user.wordStatusUpdateCounter);
  
  // Ref'ler - gereksiz çağrıları önlemek için
  const isInitialLoad = useRef(true);
  const loadingMoreRef = useRef(false);
  const lastWordStatusUpdateCounter = useRef(wordStatusUpdateCounter);
  const isDataFetching = useRef(false);

  // Kelime listelerini getir
  const getUserWordListProgress = useCallback(async (userId: string, wordListIds: number[]) => {
    try {
      const { data, error } = await supabase.rpc('get_all_word_list_data', {
        p_user_id: userId,
        p_list_ids: wordListIds
      });
      
      if (error) throw error;      
      
      if (data) {
        // Toplam kelime sayılarını al
        const totalWordsMap: Record<number, number> = {};
        if (data.counts) {
          data.counts.forEach((item: { total_words: number; word_list_id: number }) => {
            totalWordsMap[item.word_list_id] = item.total_words;
          });
        }
        console.log("totalWordsMap", totalWordsMap);
        
        // Biliyorum/bilmiyorum sayılarını hesapla
        const updatedKnownUnknownMap: Record<number, { biliyorum: number; bilmiyorum: number }> = {};
        
        // Önce tüm kelime listeleri için boş değerler oluştur
        wordListIds.forEach(listId => {
          updatedKnownUnknownMap[listId] = { biliyorum: 0, bilmiyorum: 0 };
        });
        
        if (data.status_counts) {
          data.status_counts.forEach((item: { count: number; status: number; word_list_id: number }) => {
            if (item.status === 1) {
              updatedKnownUnknownMap[item.word_list_id].biliyorum = item.count;
            } else if (item.status === 2) {
              updatedKnownUnknownMap[item.word_list_id].bilmiyorum = item.count;
            }
          });
        }
        
        // State'leri güncelle
        setKnownUnknownMap(prev => ({ ...prev, ...updatedKnownUnknownMap }));
        
        // Kelime listelerini güncelle
        setWordLists(prevLists => 
          prevLists.map(list => {
            if (totalWordsMap[list.id]) {
              return { ...list, total_words: totalWordsMap[list.id] };
            }
            return list;
          })
        );
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching word list progress:', err);
      throw err;
    }
  }, []);

  // İlk veri yükleme fonksiyonu
  const fetchInitialData = useCallback(async () => {
    if (!user || isDataFetching.current) return;
    
    isDataFetching.current = true;
    setLoading(true);

    try {
      // Mevcut dili i18n'den al
      const currentLanguage = i18n.language.split('-')[0]; // 'tr-TR' -> 'tr'
      const result = await getWordListsPaginatedWithGroupBy(1, ITEMS_PER_PAGE, currentLanguage);
      
      if (result.data && result.data.length > 0) {
        setWordLists(result.data.map((list: ApiWordList, index: number) => ({ 
          ...list, 
          icon: 'book-open-page-variant' as MaterialIconName,
          gradient: defaultGradients[index % defaultGradients.length] 
        })));
        setCurrentPage(1);
        setHasMore(result.page < result.totalPages);
        
        const wordListIds = result.data.map((list: WordList) => list.id);
        await getUserWordListProgress(user.id, wordListIds);
      }
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
      isDataFetching.current = false;
    }
  }, [user, getUserWordListProgress]);

  // Daha fazla veri yükleme fonksiyonu - debounced
  const loadMoreData = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || loading || !user) return;
    
    loadingMoreRef.current = true;
    setLoadingMore(true);
    
    try {
      const nextPage = currentPage + 1;
      // Mevcut dili i18n'den al
      const currentLanguage = i18n.language.split('-')[0]; // 'tr-TR' -> 'tr'
      const result = await getWordListsPaginatedWithGroupBy(nextPage, ITEMS_PER_PAGE, currentLanguage);
      
      if (result.data && result.data.length > 0) {
        let newLists: ApiWordList[] = [];
        setWordLists(prevLists => {
          // Mevcut ID'leri al
          const existingIds = new Set(prevLists.map(list => list.id));
          // Sadece yeni ID'lere sahip öğeleri filtrele
          newLists = result.data.filter((list: ApiWordList) => !existingIds.has(list.id));
          // Yeni öğelere renk gradyanı ekle
          const listsWithGradients = newLists.map((list: ApiWordList, index: number) => ({ 
            ...list, 
            icon: 'book-open-page-variant' as MaterialIconName,
            gradient: defaultGradients[(prevLists.length + index) % defaultGradients.length] 
          }));
          return [...prevLists, ...listsWithGradients];
        });
        setCurrentPage(nextPage);
        setHasMore(result.page < result.totalPages);
        
        // Sadece yeni eklenen listelerin ID'lerini kullan
        if (newLists.length > 0) {
          const wordListIds = newLists.map((list: ApiWordList) => list.id);
          await getUserWordListProgress(user.id, wordListIds);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Daha fazla veri yüklenirken hata:', error);
    } finally {
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [currentPage, hasMore, loading, user, getUserWordListProgress]);

  // Refresh fonksiyonu
  const handleRefresh = useCallback(async () => {
    if (!user) return;
    
    setRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);
    setWordLists([]);
    setKnownUnknownMap({});

    try {
      await fetchInitialData();
    } finally {
      setRefreshing(false);
    }
  }, [user, fetchInitialData]);

  // İlk yükleme useEffect'i - sadece user değiştiğinde
  useEffect(() => {
    if (user && isInitialLoad.current) {
      fetchInitialData();
      isInitialLoad.current = false;
    }
  }, [user]); // Sadece user bağımlılığı

  // Word status update counter değiştiğinde - sadece gerçekten değişmişse
  useEffect(() => {
    if (wordStatusUpdateCounter !== lastWordStatusUpdateCounter.current && user && wordLists.length > 0) {
      lastWordStatusUpdateCounter.current = wordStatusUpdateCounter;
      
      // Mevcut kelime listelerinin ID'lerini al
      const wordListIds = wordLists.map(list => list.id);
      getUserWordListProgress(user.id, wordListIds);
    }
  }, [wordStatusUpdateCounter, user, wordLists, getUserWordListProgress]);

  const handleListSelect = useCallback((listId: number) => {
    if (!canAccessList(listId, freeListId)) {
      router.push('/paywall-double');
      return;
    }

    router.push({
      pathname: '/learn/study-mode',
      params: { listId: String(listId) }
    });
  }, [router, canAccessList, freeListId]);

  const headerAnimatedStyle = {
    opacity: scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0.9],
      extrapolate: 'clamp'
    }),
    transform: [{
      translateY: scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -10],
        extrapolate: 'clamp'
      })
    }]
  };

  const renderLoadingIndicator = useCallback(() => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    );
  }, [loadingMore]);
  
  const renderFooter = useCallback(() => {
    if (!hasMore && wordLists.length > 0) {
      return (
        <View style={styles.endOfListContainer}>
        </View>
      );
    }
    return renderLoadingIndicator();
  }, [hasMore, renderLoadingIndicator, wordLists.length]);

  const renderWordListItem = useCallback(({ item }: { item: WordList }) => (
    <WordListItem
      list={item}
      progress={knownUnknownMap[item.id]}
      onPress={handleListSelect}
      t={t}
    />
  ), [handleListSelect, knownUnknownMap, t]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.FlatList
        data={wordLists}
        renderItem={renderWordListItem}
        keyExtractor={(item) => String(item.id)}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { 
            useNativeDriver: true,
          }
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <Text style={styles.title}>{t('learnIndex.wordListsTitle')}</Text>
          </Animated.View>
        }
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.4}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6366F1']}
            tintColor="#6366F1"
          />
        }
      />
    </View>
  );
}

// Optimize edilmiş liste öğesi bileşeni
const WordListItem = memo(({ list, progress, onPress, t }: { 
  list: WordList; 
  progress?: { biliyorum: number; bilmiyorum: number }; 
  onPress: (id: number) => void;
  t: (key: string) => string;
}) => {
  const opacity = React.useMemo(() => new Animated.Value(1), []);
  const translateY = React.useMemo(() => new Animated.Value(0), []);
  const known = progress?.biliyorum || 0;
  const unknown = progress?.bilmiyorum || 0;
  const remaining = Math.max(0, list.total_words - unknown - known);
  const markedWords = known + unknown;
  const statusText = markedWords > 0
    ? `%${list.total_words > 0 ? Math.round((markedWords / list.total_words) * 100) : 0}`
    : t('learnIndex.notStarted');

  const handlePress = useCallback(() => {
    onPress(list.id);
  }, [onPress, list.id]);

  return (
    <Animated.View
      style={[styles.listItem, {
        opacity,
        transform: [{ translateY }]
      }]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.listItemTouchable}
        onPress={handlePress}
      >
        <LinearGradient
          colors={list.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          <View style={styles.cardContent}>
            <View style={styles.topRow}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: list.image }}
                  style={styles.listImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  recyclingKey={list.image}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.listTitle}>{list.description}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {list.description}
                </Text>
              </View>
            </View>
            
            <View style={styles.bottomRow}>
              <View style={styles.progressInfo}>
                <View style={styles.progressContainer}>
                  {/* Kelime sayıları */}
                  <View style={styles.wordCountsContainer}>
                    {/* Bilinen kelimeler */}
                    <View style={[styles.wordCountBadge, styles.knownWordBadge]}>
                      <Text style={styles.knownWordText}>
                        {known}
                      </Text>
                    </View>
                    
                    {/* Bilinmeyen kelimeler */}
                    <View style={[styles.wordCountBadge, styles.unknownWordBadge]}>
                      <Text style={styles.unknownWordText}>
                        {unknown}
                      </Text>
                    </View>
                    
                    {/* Kalan kelimeler */}
                    <View style={[styles.wordCountBadge, styles.remainingWordBadge]}>
                      <Text style={styles.remainingWordText}>
                        {remaining}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                  {statusText}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.list.id === nextProps.list.id &&
    prevProps.list.total_words === nextProps.list.total_words &&
    prevProps.list.description === nextProps.list.description &&
    prevProps.list.image === nextProps.list.image &&
    prevProps.progress?.biliyorum === nextProps.progress?.biliyorum &&
    prevProps.progress?.bilmiyorum === nextProps.progress?.bilmiyorum
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: PADDING.lg,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: PADDING.lg,
    paddingTop: PADDING.xl,
    paddingBottom: PADDING.md,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: MARGIN.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: PADDING.lg,
    paddingHorizontal: PADDING.lg,
  },
  listItem: {
    marginBottom: MARGIN.md,
    borderRadius: BORDER_RADIUS.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  listItemTouchable: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  gradientContainer: {
    borderRadius: BORDER_RADIUS.lg,
    padding: PADDING.md,
  },
  cardContent: {
    gap: MARGIN.sm,
  },
  topRow: {
    flexDirection: 'row',
    gap: MARGIN.md,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    opacity: 0.9,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressInfo: {
    flex: 1,
  },

  progressContainer: {
    flexDirection: 'column',
    backgroundColor: 'rgb(255, 255, 255)',
    padding: 8,
    borderRadius: 12,
    marginTop: 8,

  },
  wordCountAndExploreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  rightSideContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  completionStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  notStartedStatus: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
 
  wordCountsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knownWordBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  knownWordText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  unknownWordBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  unknownWordText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  remainingWordBadge: {
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
  },
  remainingWordText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: PADDING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: PADDING.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    marginLeft: MARGIN.sm,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  endOfListContainer: {
    paddingVertical: PADDING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endOfListText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
});
