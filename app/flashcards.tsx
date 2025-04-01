import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Share, 
  ScrollView,
  Animated as RNAnimated,
  PanResponder,
  PanResponderGestureState
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BORDER_RADIUS, PADDING, MARGIN, FONT_SIZE } from '@/constants/AppConstants';
import { supabase } from '@/lib/supabase';
import Loader from '@/components/common/loader/native-loader';
import { FlashCard, WordListWithItems, fetchWordListItems } from '@/services/flashcardsService';
import { updateWordStatus } from '@/services/userWordStatusService';
import { useDispatch, useSelector } from 'react-redux';
import { incrementWordStatusCounter, incrementPoint } from '@/store/userSlice';
import { incrementUserPointWithRedux } from '@/services/userService';
import { RootState } from '@/store';
import { ThemedText } from '@/components/common/typography';
import { useTheme } from '@/hooks/theme/useTheme';
import Animated, { 
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
  withTiming,
  AnimatedProps
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.1 * SCREEN_WIDTH;

export default function FlashcardsScreen() {
  const params = useLocalSearchParams();
  const [selectedList, setSelectedList] = useState<WordListWithItems | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [knownWordCount, setKnownWordCount] = useState(0);
  const [unknownWordCount, setUnknownWordCount] = useState(0);
  const [allWordsMarked, setAllWordsMarked] = useState(false);
  const position = useRef(new RNAnimated.ValueXY()).current;
  const newCardAnimation = useRef(new RNAnimated.Value(0)).current;
  const dispatch = useDispatch();
  const { mode } = useTheme();
  const userPoint = useSelector((state: RootState) => state.user.point);
  
  const pointScale = useSharedValue(1);
  const pointOpacity = useSharedValue(1);

  const pointAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pointScale.value }],
    opacity: pointOpacity.value,
  }));

  const animatePoint = () => {
    pointScale.value = withSequence(
      withSpring(1.3, { damping: 10, stiffness: 100 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );
    pointOpacity.value = withSequence(
      withTiming(0.6, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (params.listId) {
          const listId = String(params.listId);
          const wordList = await fetchWordListItems(listId);
          
          if (wordList.cards && wordList.cards.length > 0) {
            // Sadece işaretlenmemiş kelimeleri filtrele (status=0)
            const unmarkedWords = wordList.cards.filter((word: FlashCard) => word.status !== 1 && word.status !== 2);
            
            if (unmarkedWords.length === 0) {
              // Tüm kelimeler işaretlenmiş, tebrik mesajı göster
              const known = wordList.cards.filter((word: FlashCard) => word.status === 1).length;
              const unknown = wordList.cards.filter((word: FlashCard) => word.status === 2).length;
              setKnownWordCount(known);
              setUnknownWordCount(unknown);
              setAllWordsMarked(true);
              
              setSelectedList({
                ...wordList,
                cards: []
              });
              
              setIsLoading(false);
              setIsInitialized(true);
              return;
            }
            
            setSelectedList({
              ...wordList,
              cards: unmarkedWords
            });

            const known = wordList.cards.filter((word: FlashCard) => word.status === 1).length;
            const unknown = wordList.cards.filter((word: FlashCard) => word.status === 2).length;
            setKnownWordCount(known);
            setUnknownWordCount(unknown);
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

  useEffect(() => {
    resetNewCard();
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_: any, gesture: PanResponderGestureState) => {
      position.setValue({ x: gesture.dx, y: 0 }); 
    },
    onPanResponderRelease: async (_: any, gesture: PanResponderGestureState) => {
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
    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    RNAnimated.timing(position, {
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
    } else {
      newStatus = 2; // Bilinmeyen
      
      // Bilinmeyen kelime sayısını artır
      setUnknownWordCount(prevCount => prevCount + 1);
      
      // Eğer daha önce bilinen olarak işaretlendiyse, bilinen sayısını azalt
      if (item.status === 1) {
        setKnownWordCount(prevCount => Math.max(0, prevCount - 1));
      }
    }
    
    // Kullanıcı giriş yapmışsa kelime durumunu güncelle
    const user = await supabase.auth.getUser();
    if (user.data?.user && item.id) {
      const success = await updateWordStatus(parseInt(item.id), user.data.user.id, newStatus);
      
      if (success) {
        // Redux'taki wordStatusUpdateCounter'ı artır
        dispatch(incrementWordStatusCounter());
        
        // Kullanıcının point değerini artır ve animasyonu başlat
        await incrementUserPointWithRedux(user.data.user.id, dispatch);
        animatePoint(); // Animasyonu başlat
        
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
    resetNewCard();
  };

  const resetPosition = () => {
    RNAnimated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: false,
    }).start();
  };

  const resetNewCard = () => {
    position.setValue({ x: 0, y: 0 });
    newCardAnimation.setValue(0);
    RNAnimated.timing(newCardAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const cardStyle = {
    ...position.getLayout(),
    opacity: newCardAnimation,
    transform: [
      ...position.getTranslateTransform(),
      {
        scale: newCardAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1]
        })
      }
    ]
  };

  const renderCard = () => {
    if (!selectedList || !selectedList.cards || selectedList.cards.length === 0) {
      return (
        <View style={styles.noCardsContainer}>
          <Text style={styles.noCardsText}>Bu listede kart bulunmuyor</Text>
        </View>
      );
    }

    const rightOpacity = position.x.interpolate({
      inputRange: [0, SCREEN_WIDTH * 0.3],
      outputRange: [0, 1]
    });

    const leftOpacity = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 0.3, 0],
      outputRange: [1, 0]
    });

    return (
      <View style={styles.cardContainer}>
        <RNAnimated.View
          style={[styles.card, cardStyle]}
          {...panResponder.panHandlers}
        >
          <RNAnimated.View style={[styles.statusOverlay, styles.knowOverlay, { opacity: rightOpacity }]}>
            <Text style={styles.statusText}>Biliyorum</Text>
          </RNAnimated.View>
          <RNAnimated.View style={[styles.statusOverlay, styles.dontKnowOverlay, { opacity: leftOpacity }]}>
            <Text style={styles.statusText}>Bilmiyorum</Text>
          </RNAnimated.View>
          <LinearGradient
            colors={['#6366F1', '#A5B4FC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientContainer}
          >
            <View style={styles.cardContent}>
              <Text style={styles.wordText}>{selectedList.cards[currentIndex].word}</Text>
              {showTranslation && (
                <View style={styles.translationWrapper}>
                  <Text style={styles.translationText}>{selectedList.cards[currentIndex].translation}</Text>
                  <Text style={styles.exampleText}>{selectedList.cards[currentIndex].example_original || selectedList.cards[currentIndex].example}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </RNAnimated.View>
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
        <View style={styles.pointContainer}>
          <View style={styles.pointIconWrapper}>
            <Icon
              name="water"
              size={24}
              color="#FFFFFF"
            />
          </View>
          <Animated.Text style={[styles.pointText, pointAnimatedStyle]}>
            {userPoint}
          </Animated.Text>
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
    paddingTop: PADDING.xxxl,

  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  pointContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a85e5',
    borderRadius: 25,
    padding: 8,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pointIconWrapper: {
    backgroundColor: '#3a75d5',
    borderRadius: 20,
    padding: 5,
    marginRight: 8,
  },
  pointText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
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
    fontSize: FONT_SIZE.md,
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
  noMoreCards: {
    fontSize: FONT_SIZE.xl,
    color: '#1F2937',
    textAlign: 'center',
    marginTop: MARGIN.lg,
    marginBottom: MARGIN.md,
    fontWeight: '700',
  },
  completionStats: {
    fontSize: FONT_SIZE.md,
    color: '#6B7280',
    marginBottom: MARGIN.md,
  },
  backButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: PADDING.md,
    paddingVertical: PADDING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  backButtonText: {
    fontSize: FONT_SIZE.md,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: PADDING.lg,
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: MARGIN.md,
  },
  noCardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: BORDER_RADIUS.lg,
  },
  noCardsText: {
    fontSize: FONT_SIZE.md,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: MARGIN.md,
    fontSize: FONT_SIZE.md,
    color: '#6B7280',
  },
  statusOverlay: {
    position: 'absolute',
    top: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 999,
  },
  knowOverlay: {
    left: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  dontKnowOverlay: {
    right: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
