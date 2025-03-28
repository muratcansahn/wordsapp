import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, TouchableOpacity, Share, FlatList, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BORDER_RADIUS, PADDING, MARGIN } from '@/constants/AppConstants';
import { supabase } from '@/lib/supabase';
import Loader from '@/components/common/loader/native-loader';
import { FlashCard, fetchWordListItems } from '@/services/flashcardsService';
import { updateWordStatus } from '@/services/userWordStatusService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

// WordList arayüzünü tanımlayalım
interface WordList {
  id: string;
  title: string;
  subtitle: string;
  level: string;
  cards: FlashCard[];
  name?: string;
  description?: string;
}

export default function FlashcardsScreen() {
  const params = useLocalSearchParams();
  const [selectedList, setSelectedList] = useState<WordList | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [knownWordCount, setKnownWordCount] = useState(0);
  const [unknownWordCount, setUnknownWordCount] = useState(0);
  const [allWordsMarked, setAllWordsMarked] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;

 
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (params.listId) {
          const listId = String(params.listId);

          // Doğrudan liste ID'sine ait kelimeleri çek
          const words = await fetchWordListItems(listId);
          
          if (words && words.length > 0) {
            // Sadece işaretlenmemiş kelimeleri filtrele (status=0)
            const unmarkedWords = words.filter(word => word.status !== 1 && word.status !== 2 );
            
            if (unmarkedWords.length === 0) {
              // Tüm kelimeler işaretlenmiş, tebrik mesajı göster
              const known = words.filter(word => word.status === 1).length;
              const unknown = words.filter(word => word.status === 2).length;
              setKnownWordCount(known);
              setUnknownWordCount(unknown);
              setAllWordsMarked(true);
              
              // Boş liste oluştur
              setSelectedList({
                id: listId,
                title: 'Kelime Listesi',
                subtitle: 'Özel kelime listesi',
                level: 'B1',
                cards: []
              });
              
              setIsLoading(false);
              setIsInitialized(true);
              return;
            }
            
            // Liste bilgilerini oluştur
            const completeList: WordList = {
              id: listId,
              title: 'Kelime Listesi',
              subtitle: 'Özel kelime listesi',
              level: 'B1',
              cards: unmarkedWords
            };
            
            const known = words.filter(word => word.status === 1).length;
            const unknown = words.filter(word => word.status === 2).length;
            setKnownWordCount(known);
            setUnknownWordCount(unknown);
            setSelectedList(completeList);
          } else {
            setError("Bu listede kelime bulunamadı.");
          }
        } else {
          setError("Liste ID'si belirtilmedi.");
        }
      } catch (err) {
        setError("Veri yüklenirken bir hata oluştu.");
        console.error(err);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };
    
    if (!isInitialized) {
      loadData();
    }
  }, [params, isInitialized]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: 0 }); 
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        forceSwipe('right');
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        forceSwipe('left');
      } else {
        resetPosition();
      }
    },
  });

  const forceSwipe = (direction: 'right' | 'left') => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 500,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = async (direction: 'right' | 'left') => {
    const item = selectedList?.cards[currentIndex];
    
    if (!item) return;
    
    let newStatus = 0;
    if (direction === 'right') {
      newStatus = 1; // Bilinen
      
      // Bilinen kelime sayısını artır
      setKnownWordCount(prevCount => prevCount + 1);
      
      // Eğer daha önce bilinmeyen olarak işaretlendiyse, bilinmeyen sayısını azalt
      if (item.status === 2) {
        setUnknownWordCount(prevCount => Math.max(0, prevCount - 1));
      }
      // Eğer daha önce favori olarak işaretlendiyse, favori sayısını azalt
      else if (item.status === 3) {
        // Favori işlemi burada
      }
    } else {
      newStatus = 2; // Bilinmeyen
      
      // Bilinmeyen kelime sayısını artır
      setUnknownWordCount(prevCount => prevCount + 1);
      
      // Eğer daha önce bilinen olarak işaretlendiyse, bilinen sayısını azalt
      if (item.status === 1) {
        setKnownWordCount(prevCount => Math.max(0, prevCount - 1));
      }
      // Eğer daha önce favori olarak işaretlendiyse, favori sayısını azalt
      else if (item.status === 3) {
        // Favori işlemi burada
      }
    }
    
    // Kullanıcı giriş yapmışsa kelime durumunu güncelle
    const user = await supabase.auth.getUser();
    if (user.data?.user && item.id) {
      const success = await updateWordStatus(parseInt(item.id), user.data.user.id, newStatus);
      
      if (success) {
        // Kartın statüsünü güncelle
        if (selectedList) {
          const updatedCards = [...selectedList.cards];
          updatedCards[currentIndex] = {
            ...updatedCards[currentIndex],
            status: newStatus
          };
          
          setSelectedList({
            ...selectedList,
            cards: updatedCards
          });
        }
      }
    }
    
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(currentIndex + 1);
    setShowTranslation(false);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 5,
      tension: 40
    }).start();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-30deg', '0deg', '30deg'],
    });

    const borderColor = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 0.5, 0, SCREEN_WIDTH * 0.5],
      outputRange: ['#F44336', 'transparent', '#4CAF50'],
    });

    const borderWidth = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 0.5, -50, 0, 50, SCREEN_WIDTH * 0.5],
      outputRange: [15, 0, 0, 0, 15],
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
      borderColor,
      borderWidth,
    };
  };

  const renderCard = () => {
    if (!selectedList || !selectedList.cards || selectedList.cards.length === 0) {
      return (
        <View style={styles.emptyCardContainer}>
          <Text style={styles.emptyCardText}>Bu listede kelime bulunmuyor.</Text>
        </View>
      );
    }
    
    const card = selectedList.cards[currentIndex];

    return (
      <View style={styles.cardContainer}>
        <Animated.View
          style={[styles.card, getCardStyle()]}
          {...panResponder.panHandlers}
        >
          <LinearGradient
            colors={['#6366F1', '#A5B4FC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientContainer}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Icon name="book-open-page-variant" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.cardHeaderText}>Kelime Kartı</Text>
            </View>
            
            <View style={styles.cardContent}>
              <Text style={styles.wordText}>{card.word}</Text>
              {showTranslation && (
                <View style={styles.translationWrapper}>
                  <Text style={styles.translationText}>{card.translation}</Text>
                  <Text style={styles.exampleText}>{card.example_original || card.example}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Loader size="large" />
        <Text style={styles.loadingText}>Kelime listesi yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon name="alert-circle" size={50} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!selectedList) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon name="alert-circle" size={50} color="#F44336" />
        <Text style={styles.errorText}>Liste bulunamadı.</Text>
      </View>
    );
  }

  if (allWordsMarked) {
    return (
      <View style={styles.container}>
        <View style={styles.completionContainer}>
          <Icon name="check-circle" size={80} color="#4CAF50" />
          <Text style={styles.noMoreCards}>
            Tebrikler, bu listedeki tüm kelimeleri işaretlediniz!
          </Text>
          <Text style={styles.completionStats}>
            {knownWordCount} bilinen, {unknownWordCount} bilinmeyen kelime
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              // Ana sayfaya yönlendir
              router.replace('/');
            }}
          >
            <Text style={styles.backButtonText}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (currentIndex >= selectedList.cards.length) {
    // Listedeki tüm kelimelerin işaretlenip işaretlenmediğini kontrol et
    const totalWords = knownWordCount + unknownWordCount;
    const allWordsMarked = totalWords === selectedList.cards.length;
    
    return (
      <View style={styles.container}>
        <View style={styles.completionContainer}>
          <Icon name="check-circle" size={80} color="#4CAF50" />
          <Text style={styles.noMoreCards}>
            {allWordsMarked 
              ? "Tebrikler, bu listedeki tüm kelimeleri işaretlediniz!" 
              : "Tüm kartları tamamladınız!"}
          </Text>
          <Text style={styles.completionStats}>
            {knownWordCount} bilinen, {unknownWordCount} bilinmeyen kelime
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              // Ana sayfaya yönlendir
              router.replace('/');
            }}
          >
            <Text style={styles.backButtonText}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{selectedList.title}</Text>
          <Text style={styles.headerSubtitle}>{selectedList.subtitle}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{selectedList.level}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
            <Icon name="check-circle" size={24} color="#4CAF50" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{knownWordCount}</Text>
            <Text style={styles.statLabel}>Bilinen</Text>
          </View>
        </View>
        <View style={[styles.statDivider, { backgroundColor: '#eee' }]} />
        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}>
            <Icon name="close-circle" size={24} color="#F44336" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{unknownWordCount}</Text>
            <Text style={styles.statLabel}>Bilinmeyen</Text>
          </View>
        </View>
        <View style={[styles.statDivider, { backgroundColor: '#eee' }]} />
        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 193, 7, 0.1)' }]}>
            <Icon name="star" size={24} color="#FFC107" />
          </View>
        </View>
      </View>

      <View style={styles.cardControlsContainer}>
        <Text style={styles.counterText}>{currentIndex + 1} / {selectedList.cards.length}</Text>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => setShowTranslation(!showTranslation)}
        >
          <Icon name={showTranslation ? 'eye-off' : 'eye'} size={22} color="#6366F1" />
          <Text style={styles.controlButtonText}>{showTranslation ? 'Gizle' : 'Göster'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => {
            const card = selectedList.cards[currentIndex];
            Share.share({
              message: `${card.word} - ${card.translation}\n${card.example}`,
              title: 'Kelime Kartı Paylaş'
            });
          }}
        >
          <Icon name="share-variant" size={22} color="#6366F1" />
          <Text style={styles.controlButtonText}>Paylaş</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardWrapper}>
        {renderCard()}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.dontKnowButton]}
          onPress={() => forceSwipe('left')}
        >
          <Icon name="close" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Bilmiyorum</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.knowButton]}
          onPress={() => forceSwipe('right')}
        >
          <Icon name="check" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Biliyorum</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: PADDING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PADDING.md,
    paddingBottom: PADDING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: MARGIN.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  levelBadge: {
    paddingHorizontal: PADDING.md,
    paddingVertical: PADDING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F3F4F6',
    minWidth: 42,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: PADDING.md,
    paddingHorizontal: PADDING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MARGIN.md,
  },
  statTextContainer: {
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: MARGIN.xxs,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: MARGIN.md,
  },
  cardControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PADDING.md,
    paddingVertical: PADDING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PADDING.sm,
    paddingVertical: PADDING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: MARGIN.xs,
  },
  counterText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: PADDING.md,
    paddingVertical: PADDING.md,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  gradientContainer: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: PADDING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: MARGIN.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: PADDING.lg,
  },
  wordText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: MARGIN.lg,
  },
  translationWrapper: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: PADDING.md,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
  },
  translationText: {
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: MARGIN.md,
    fontWeight: '600',
  },
  exampleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: PADDING.md,
    backgroundColor: '#FFFFFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PADDING.lg,
    paddingVertical: PADDING.md,
    borderRadius: BORDER_RADIUS.lg,
    flex: 0.48,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: MARGIN.sm,
  },
  knowButton: {
    backgroundColor: '#4CAF50',
  },
  dontKnowButton: {
    backgroundColor: '#F44336',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: PADDING.lg,
  },
  completionStats: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: MARGIN.lg,
    marginTop: MARGIN.md,
  },
  backButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: PADDING.lg,
    paddingVertical: PADDING.md,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noMoreCards: {
    fontSize: 24,
    color: '#1F2937',
    textAlign: 'center',
    marginTop: MARGIN.lg,
    marginBottom: MARGIN.md,
    fontWeight: '700',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: MARGIN.md,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    marginTop: MARGIN.md,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    paddingHorizontal: PADDING.lg,
  },
  emptyCardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyCardText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
