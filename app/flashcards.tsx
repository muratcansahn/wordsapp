import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Audio } from '@/utils/audio';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Share, 
  ScrollView,
  Animated as RNAnimated,
  Image,
  SafeAreaView,
  Modal,
  InteractionManager
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BORDER_RADIUS, PADDING, MARGIN, FONT_SIZE } from '@/constants/AppConstants';
import { supabase } from '@/lib/supabase';
import Loader from '@/components/common/loader/native-loader';
import { FlashCard, WordListWithItems, fetchWordListItems } from '@/services/flashcardsService';
import { updateWordStatus } from '@/services/userWordStatusService';
import { useDispatch, useSelector } from 'react-redux';
import { incrementWordStatusCounter } from '@/store/userSlice';
import { incrementUserPointWithRedux } from '@/services/userService';
import { RootState } from '@/store';
import { useTheme } from '@/hooks/theme/useTheme';
import { PointContainer } from '@/components/common/point-container';
import { useTranslation } from 'react-i18next';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Ses havuzu için tip tanımları
interface SoundPool {
  knownSound: any | null;
  unknownSound: any | null;
  successSound: any | null;
}

// Oyun state'i için tip tanımı
interface GameState {
  currentIndex: number;
  showTranslation: boolean;
  knownWordCount: number;
  unknownWordCount: number;
  allWordsMarked: boolean;
  successSoundPlayed: boolean;
}

// Tamamlanma görünümü bileşeni
const CompletionView = React.memo(({ 
  knownWordCount, 
  unknownWordCount, 
  t 
}: {
  knownWordCount: number;
  unknownWordCount: number;
  t: any;
}) => (
  <View style={[styles.container, {backgroundColor: '#f6fafd'}]}>
    <LinearGradient
      colors={["#e0ffe8", "#f6fafd"]}
      style={styles.completionGradient}
    >
      <View style={styles.completionCard}>
        <View style={styles.completionIconCircle}>
          <Icon name="check-circle" size={64} color="#4CAF50" />
        </View>
        <Text style={styles.noMoreCards}>{t('flashcards.allMarked')}</Text>
        <Text style={styles.completionStats}>
          {knownWordCount} {t('flashcards.knownWords')}, {unknownWordCount} {t('flashcards.unknownWords')}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/')}
          activeOpacity={0.85}
        >
          <Text style={styles.backButtonText}>{t('flashcards.backToHome')}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  </View>
));

// İstatistik konteyner bileşeni
const StatsContainer = React.memo(({ 
  knownWordCount, 
  unknownWordCount, 
  t 
}: {
  knownWordCount: number;
  unknownWordCount: number;
  t: any;
}) => (
  <View style={styles.statsContainer}>
    <View style={styles.statItem}>
      <View style={[styles.statIconContainer, { backgroundColor: '#4CD964' }]}>
        <Icon name="check" size={24} color="#FFFFFF" />
      </View>
      <View style={styles.statTextContainer}>
        <Text style={styles.statValue}>{knownWordCount}</Text>
        <Text style={styles.statLabel}>{t('flashcards.known')}</Text>
      </View>
    </View>
    <View style={[styles.statDivider, { backgroundColor: '#FFFFFF', opacity: 0.3 }]} />
    <View style={styles.statItem}>
      <View style={[styles.statIconContainer, { backgroundColor: '#FF3B30' }]}>
        <Icon name="close" size={24} color="#FFFFFF" />
      </View>
      <View style={styles.statTextContainer}>
        <Text style={styles.statValue}>{unknownWordCount}</Text>
        <Text style={styles.statLabel}>{t('flashcards.unknown')}</Text>
      </View>
    </View>
  </View>
));

// Flash kart bileşeni
const FlashCardComponent = React.memo(({ 
  card, 
  showTranslation, 
  translationAnim, 
  cardOpacity,
  t 
}: {
  card: FlashCard;
  showTranslation: boolean;
  translationAnim: RNAnimated.Value;
  cardOpacity: RNAnimated.Value;
  t: any;
}) => (
  <View style={styles.cardContainer}>
    <RNAnimated.View
      style={[styles.card, { opacity: cardOpacity }]}
    >
      <LinearGradient
        colors={['#6366F1', '#A5B4FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.cardContent}>
          <Text style={styles.wordText}>
            {card.word.charAt(0).toUpperCase() + card.word.slice(1).toLowerCase()}
          </Text>
          {showTranslation && (
            <RNAnimated.View
              style={[
                styles.translationWrapper,
                {
                  opacity: translationAnim,
                  transform: [
                    {
                      scale: translationAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1]
                      })
                    }
                  ]
                }
              ]}
            >
              <Text style={styles.translationText}>{card.translation}</Text>
              <Text style={styles.exampleText}>{card.example_original}</Text>
              <Text style={styles.exampleText}>{card.example_translated}</Text>
            </RNAnimated.View>
          )}
        </View>
      </LinearGradient>
    </RNAnimated.View>
  </View>
));

export default function FlashcardsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  const { mode } = useTheme();
  const userPoint = useSelector((state: RootState) => state.user.point);
  
  // Birleştirilmiş state
  const [gameState, setGameState] = useState<GameState>({
    currentIndex: 0,
    showTranslation: false,
    knownWordCount: 0,
    unknownWordCount: 0,
    allWordsMarked: false,
    successSoundPlayed: false
  });
  
  // Diğer state'ler
  const [selectedList, setSelectedList] = useState<WordListWithItems | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Animation refs
  const translationAnim = useRef(new RNAnimated.Value(0)).current;
  const cardOpacity = useRef(new RNAnimated.Value(1)).current;
  const pointContainerRef = useRef<any>(null);
  const infoModalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (infoModalTimeoutRef.current) clearTimeout(infoModalTimeoutRef.current);
    };
  }, []);

  // Ses havuzu
  const soundPoolRef = useRef<SoundPool>({
    knownSound: null,
    unknownSound: null,
    successSound: null
  });

  // Ses çalma fonksiyonu - optimize edildi
  const playSound = useCallback(async (soundType: 'known' | 'unknown' | 'success') => {
    try {
      const soundObject = soundPoolRef.current[`${soundType}Sound`];
      if (soundObject) {
        await soundObject.setPositionAsync(0);
        await soundObject.playAsync();
      }
    } catch (error) {
      console.error(`Ses çalma hatası (${soundType}):`, error);
    }
  }, []);

  // Puan animasyonu
  const animatePoint = useCallback(() => {
    if (pointContainerRef.current?.animatePoint) {
      pointContainerRef.current.animatePoint();
    }
  }, []);

  // Kart geçiş animasyonu
  const animateCardTransition = useCallback((onFadeOut?: () => void) => {
    return new Promise<void>((resolve) => {
      // Kartı kaybet
      RNAnimated.timing(cardOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        // Fade-out tamamlandığında callback'i çağır
        if (onFadeOut) onFadeOut();
        
        // Yeni kartı göster
        RNAnimated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          resolve();
        });
      });
    });
  }, [cardOpacity]);

  // Buton tıklama işlemi - optimize edildi
  const onButtonPress = useCallback(async (isKnown: boolean) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    const item = selectedList?.cards[gameState.currentIndex];
    if (!item) {
      setIsProcessing(false);
      return;
    }

    const newStatus = isKnown ? 1 : 2;
    const currentCardIndex = gameState.currentIndex;
    const nextIndex = gameState.currentIndex + 1;
    
    // İstatistik güncellemeleri
    let newKnownCount = gameState.knownWordCount;
    let newUnknownCount = gameState.unknownWordCount;
    
    if (isKnown) {
      newKnownCount += 1;
      if (item.status === 2) newUnknownCount = Math.max(0, newUnknownCount - 1);
    } else {
      newUnknownCount += 1;
      if (item.status === 1) newKnownCount = Math.max(0, newKnownCount - 1);
    }
    
    // Ses çalma
    playSound(isKnown ? 'known' : 'unknown');
    
    // Önce kart güncellemesi yap
    if (selectedList) {
      const updatedCards = [...selectedList.cards];
      updatedCards[currentCardIndex] = {
        ...updatedCards[currentCardIndex],
        status: newStatus
      };
      
      // Liste güncellemesi
      setSelectedList({
        ...selectedList,
        cards: updatedCards
      });
    }
    
    // Kart geçiş animasyonunu başlat ve fade-out tamamlandığında kelimeyi değiştir
    await animateCardTransition(() => {
      // Çeviriyi gizle ve kelimeyi değiştir (fade-out tamamlandığında)
      setGameState(prev => ({
        ...prev,
        currentIndex: nextIndex,
        showTranslation: false,
        knownWordCount: newKnownCount,
        unknownWordCount: newUnknownCount
      }));
      
      // Çeviri animasyonunu sıfırla
      translationAnim.setValue(0);
    });
    
    // Backend güncelleme - arka planda
    InteractionManager.runAfterInteractions(async () => {
      try {
        const user = await supabase.auth.getUser();
        if (user.data?.user && item.id) {
          const success = await updateWordStatus(parseInt(item.id), user.data.user.id, newStatus);
          if (success) {
            dispatch(incrementWordStatusCounter());
            await incrementUserPointWithRedux(user.data.user.id, dispatch);
            animatePoint();
          }
        }
      } catch (error) {
        console.error('Backend güncelleme hatası:', error);
      }
    });
    
    setIsProcessing(false);
  }, [gameState.currentIndex, selectedList, dispatch, playSound, animateCardTransition, translationAnim, isProcessing, animatePoint]);

  // Çeviri gösterme/gizleme
  const toggleTranslation = useCallback(() => {
    if (!gameState.showTranslation) {
      setGameState(prev => ({ ...prev, showTranslation: true }));
      RNAnimated.timing(translationAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      RNAnimated.timing(translationAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setGameState(prev => ({ ...prev, showTranslation: false })));
    }
  }, [gameState.showTranslation, translationAnim]);

  // Ses yükleme ve temizleme
  useEffect(() => {
    let isMounted = true;
    
    const loadSounds = async () => {
      try {
        const [knownResult, unknownResult, successResult] = await Promise.all([
          Audio.Sound.createAsync(require('@/assets/audio/known.mp3')),
          Audio.Sound.createAsync(require('@/assets/audio/unknown.mp3')),
          Audio.Sound.createAsync(require('@/assets/audio/success-end.mp3'))
        ]);
        
        if (isMounted) {
          soundPoolRef.current = {
            knownSound: knownResult.sound,
            unknownSound: unknownResult.sound,
            successSound: successResult.sound
          };
        }
      } catch (error) {
        console.error('Ses yükleme hatası:', error);
      }
    };

    InteractionManager.runAfterInteractions(loadSounds);

    return () => {
      isMounted = false;
      Object.values(soundPoolRef.current).forEach(sound => {
        sound?.unloadAsync();
      });
    };
  }, []);

  // Başarı sesi çalma
  useEffect(() => {
    if (gameState.allWordsMarked && !gameState.successSoundPlayed && soundPoolRef.current.successSound) {
      InteractionManager.runAfterInteractions(() => {
        playSound('success');
        setGameState(prev => ({ ...prev, successSoundPlayed: true }));
      });
    }
  }, [gameState.allWordsMarked, gameState.successSoundPlayed, playSound]);

  // Veri yükleme
  useEffect(() => {
    if (isInitialized) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!params.listId) {
          setError("Liste ID'si belirtilmedi.");
          return;
        }

        const listId = String(params.listId);
        const wordList = await fetchWordListItems(listId);
        
        if (!wordList.cards || wordList.cards.length === 0) {
          setError("Bu listede kelime bulunamadı.");
          return;
        }

        const unmarkedWords = wordList.cards.filter((word: FlashCard) => 
          word.status !== 1 && word.status !== 2
        );
        
        const known = wordList.cards.filter((word: FlashCard) => word.status === 1).length;
        const unknown = wordList.cards.filter((word: FlashCard) => word.status === 2).length;
        
        setGameState(prev => ({
          ...prev,
          knownWordCount: known,
          unknownWordCount: unknown,
          allWordsMarked: unmarkedWords.length === 0
        }));

        setSelectedList({
          ...wordList,
          cards: unmarkedWords
        });

      } catch (err) {
        setError("Veri yüklenirken bir hata oluştu.");
        console.error(err);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };
    
    loadData();

    // Info modal kontrolü
    const checkInfoModal = async () => {
      try {
        const hasSeenInfoModal = await AsyncStorage.getItem('hasSeenFlashcardsInfoModal');
        if (hasSeenInfoModal === null) {
          infoModalTimeoutRef.current = setTimeout(() => setShowInfoModal(true), 500);
        }
      } catch (error) {
        infoModalTimeoutRef.current = setTimeout(() => setShowInfoModal(true), 500);
      }
    };
    
    checkInfoModal();
  }, [params, isInitialized]);

  // Kart render fonksiyonu - memoized ve optimize edildi
  const renderCard = useCallback(() => {
    if (!selectedList?.cards) {
      return null;
    }
    
    if (selectedList.cards.length === 0) {
      return (
        <View style={styles.noCardsContainer}>
          <Text style={styles.noCardsText}>{t('flashcards.noCards')}</Text>
        </View>
      );
    }

    // Geçerli indeks kontrolü
    if (gameState.currentIndex >= selectedList.cards.length) {
      // Tüm kartlar tamamlandı
      return null;
    }

    const currentCard = selectedList.cards[gameState.currentIndex];
    if (!currentCard) return null;

    return (
      <FlashCardComponent
        card={currentCard}
        showTranslation={gameState.showTranslation}
        translationAnim={translationAnim}
        cardOpacity={cardOpacity}
        t={t}
      />
    );
  }, [selectedList, gameState.currentIndex, gameState.showTranslation, translationAnim, cardOpacity, t]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Loader size="large" />
        <Text style={styles.loadingText}>{t('flashcards.loading')}</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon name="alert-circle" size={50} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // List not found
  if (!selectedList) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon name="alert-circle" size={50} color="#F44336" />
        <Text style={styles.errorText}>{t('flashcards.listNotFound')}</Text>
      </View>
    );
  }

  // Completion state
  if (gameState.allWordsMarked || gameState.currentIndex >= selectedList.cards.length) {
    return (
      <CompletionView 
        knownWordCount={gameState.knownWordCount}
        unknownWordCount={gameState.unknownWordCount}
        t={t}
      />
    );
  }

  // Main render
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/game-background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <SafeAreaView style={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerBackButton} 
            onPress={() => router.replace('/')}
          >
            <Icon name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {selectedList.title}
          </Text>
          
          <View style={styles.headerRightContainer}>
            <TouchableOpacity 
              style={styles.infoButton} 
              onPress={() => setShowInfoModal(true)}
            >
              <Icon name="information-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            
            <PointContainer ref={pointContainerRef} />
          </View>
        </View>

        <StatsContainer 
          knownWordCount={gameState.knownWordCount}
          unknownWordCount={gameState.unknownWordCount}
          t={t}
        />

        <View style={styles.cardControlsContainer}>
          <View style={styles.counterCircle}>
            <Text style={styles.counterText}>
              {gameState.currentIndex + 1} / {selectedList.cards.length}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={toggleTranslation}
          >
            <Icon name={gameState.showTranslation ? 'eye-off' : 'eye'} size={22} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>{t('flashcards.show')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardWrapper}>
          {renderCard()}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.dontKnowButton,
              isProcessing && styles.disabledButton
            ]}
            onPress={() => onButtonPress(false)}
            disabled={isProcessing}
          >
            <Icon name="close" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>{t('flashcards.dontKnow')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.knowButton,
              isProcessing && styles.disabledButton
            ]}
            onPress={() => onButtonPress(true)}
            disabled={isProcessing}
          >
            <Icon name="check" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>{t('flashcards.know')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      
      {/* Info Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showInfoModal}
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('flashcards.infoTitle') || "Kelime Kartı Oyunu"}
              </Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                {t('flashcards.infoDescription') || "Alttaki butonları kullanarak kelimeleri biliyorum/bilmiyorum olarak işaretleyebilirsiniz. Göz ikonuna basarak kelimenin çevirisini görebilirsiniz. Bol şans!"}
              </Text>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => {
                  setShowInfoModal(false);
                  AsyncStorage.setItem('hasSeenFlashcardsInfoModal', 'true')
                    .catch(error => console.error('AsyncStorage yazma hatası:', error));
                }}
              >
                <Text style={styles.modalButtonText}>
                  {t('buttons.okay') || "Anladım"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Styles - sürükleme ile ilgili stiller kaldırıldı
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4361EE',
    textAlign: 'center',
  },
  modalBody: {
    width: '100%',
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalFooter: {
    width: '100%',
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#4361EE',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    zIndex: 1,
    paddingTop: PADDING.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PADDING.sm,
    paddingVertical: PADDING.sm,
    marginBottom: MARGIN.sm,
    width: '100%',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerBackButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#00A3FF',
    marginRight: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(73, 151, 229, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    flex: 1,
    marginHorizontal: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: PADDING.md,
    paddingHorizontal: PADDING.lg,
    backgroundColor: 'rgba(100, 180, 255, 0.8)',
    borderRadius: 30,
    marginTop: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MARGIN.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: '70%',
    marginHorizontal: MARGIN.lg,
    opacity: 0.2,
  },
  cardControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PADDING.lg,
    paddingVertical: PADDING.md,
    borderRadius: 30,
    marginTop: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PADDING.md,
    paddingVertical: PADDING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(150, 170, 200, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: MARGIN.xs,
  },
  counterCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginRight: 8,
  },
  counterText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '600',
    textAlign: 'center',
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
    fontSize: 48,
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
    backgroundColor: 'transparent',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PADDING.lg,
    paddingVertical: PADDING.md,
    borderRadius: 25,
    flex: 0.48,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  completionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: PADDING.lg,
  },
  completionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 320,
    maxWidth: '90%',
  },
  completionIconCircle: {
    backgroundColor: '#e8f5e9',
    borderRadius: 50,
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  noMoreCards: {
    fontSize: FONT_SIZE.xl + 2,
    color: '#22223b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  completionStats: {
    fontSize: FONT_SIZE.md,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 4,
  },
  backButtonText: {
    fontSize: FONT_SIZE.md + 1,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
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
