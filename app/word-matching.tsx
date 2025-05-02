import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import Loader from '@/components/common/loader/native-loader';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { ThemedView } from '@/components/common/view';
import { ThemedText } from '@/components/common/typography';
import { useTheme } from '@/hooks/theme/useTheme';
import { Colors } from '@/constants/Colors';
import { BORDER_RADIUS, FONT_SIZE, MARGIN, PADDING, ICON_SIZE } from '@/constants/AppConstants';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { getRandomWordsWithTranslations } from '@/services/wordService';
import { incrementUserPointByAmountWithRedux } from '@/services/userService';
import { Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Kelime eşleştirme oyunu için arayüz
interface MatchingWord {
  id: string;
  text: string;
  translation: string;
  matched: boolean;
  selected: boolean;
}

// Ekran genişliğini al
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WordMatchingScreen() {
  const router = useRouter();
  const { mode } = useTheme();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const userState = useSelector((state: RootState) => state.user);
  
  // Durum çubuğu yüksekliği
  
  // Oyun durumu
  const [matchingWords, setMatchingWords] = useState<MatchingWord[]>([]);
  const [shuffledTranslations, setShuffledTranslations] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(null);
  const [wrongMatch, setWrongMatch] = useState<boolean>(false);
  const [totalMatches, setTotalMatches] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPointModal, setShowPointModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [newTotalPoints, setNewTotalPoints] = useState(0);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Kelime ve çeviri pozisyonlarını tutmak için referanslar
  const wordPositions = useRef<{[key: string]: {x: number, y: number, width: number, height: number}}>({}).current;
  const translationPositions = useRef<{[key: string]: {x: number, y: number, width: number, height: number}}>({}).current;
  
  // Eşleşmiş kelime-çeviri çiftlerini tutmak için state
  const [matchedPairs, setMatchedPairs] = useState<{wordId: string, translation: string, word: string}[]>([]);
  
  // Sayfa yüklendiğinde oyunu başlat
  useEffect(() => {
    // Sayfa yüklendiğinde otomatik olarak oyunu başlat
    startNewGame();
  }, []);
  
  // Yeni oyun başlat
  const startNewGame = async () => {
    setIsLoading(true);
    try {
      
      // Rastgele 5 kelime çek
      const randomWords = await getRandomWordsWithTranslations(i18n.language);      
      if (!randomWords || randomWords.length === 0) {
        console.error('Kelime bulunamadı veya boş dizi döndü');
        Alert.alert(t('common.error'), t('wordMatching.wordsLoadError'));
        setIsLoading(false);
        return;
      }
      
      // Word tipinden MatchingWord tipine dönüştür
      const selectedWords: MatchingWord[] = randomWords.map(word => {
        if (!word || !word.WordTranslations || word.WordTranslations.length === 0) {
          console.error('Kelime veya çevirisi eksik:', word);
          return {
            id: word?.id?.toString() || Math.random().toString(),
            text: word?.name || 'Bilinmeyen kelime',
            translation: 'Çeviri bulunamadı',
            matched: false,
            selected: false
          };
        }
        
        return {
          id: word.id.toString(),
          text: word.name,
          translation: word.WordTranslations[0]?.mean || 'Çeviri bulunamadı',
          matched: false,
          selected: false
        };
      });
      
      console.log('Dönüştürülen kelimeler:', selectedWords);
      
      // Çevirileri karıştır
      const translations = selectedWords.map(word => word.translation);
      const shuffled = [...translations].sort(() => Math.random() - 0.5);
      
      setMatchingWords(selectedWords);
      setShuffledTranslations(shuffled);
      setSelectedWord(null);
      setSelectedTranslation(null);
      setTotalMatches(0);
      setGameCompleted(false);
      setMatchedPairs([]);
      setIsLoading(false);
      console.log('Oyun başlatıldı');
    } catch (error) {
      console.error('Oyun başlatma hatası:', error);
      Alert.alert(t('common.error'), t('wordMatching.gameStartError'));
      setIsLoading(false);
    }
  };
  
  // Kelime seçimi
  const handleWordSelect = (wordId: string) => {
    if (gameCompleted) return;
    
    // Eğer zaten eşleşmiş bir kelime ise işlem yapma
    const wordIndex = matchingWords.findIndex(w => w.id === wordId);
    if (matchingWords[wordIndex].matched) return;
    
    // Aynı kelimeye tekrar tıklanırsa seçimi kaldır
    if (selectedWord === wordId) {
      setSelectedWord(null);
      const updatedWords = matchingWords.map(word => ({
        ...word,
        selected: false
      }));
      setMatchingWords(updatedWords);
      return;
    }
    
    // Daha önce seçilmiş bir kelime varsa, seçimi kaldır
    const updatedWords = matchingWords.map(word => ({
      ...word,
      selected: word.id === wordId
    }));
    
    setMatchingWords(updatedWords);
    setSelectedWord(wordId);
    
    // Eğer bir çeviri de seçilmişse, eşleşme kontrolü yap
    if (selectedTranslation) {
      checkMatch(wordId, selectedTranslation);
    }
  };
  
  // Çeviri seçimi
  const handleTranslationSelect = (translation: string) => {
    if (gameCompleted) return;
    
    // Eğer zaten eşleşmiş bir çeviri ise işlem yapma
    const translationIndex = matchingWords.findIndex(w => w.translation === translation && w.matched);
    if (translationIndex !== -1) return;
    
    // Aynı çeviriye tekrar tıklanırsa seçimi kaldır
    if (selectedTranslation === translation) {
      setSelectedTranslation(null);
      return;
    }
    
    setSelectedTranslation(translation);
    
    // Eğer bir kelime de seçilmişse, eşleşme kontrolü yap
    if (selectedWord) {
      checkMatch(selectedWord, translation);
    }
  };
  
  // Kelime pozisyonunu kaydet
  const saveWordPosition = (wordId: string, position: { x: number, y: number, width: number, height: number }) => {
    wordPositions[wordId] = position;
  };
  
  // Çeviri pozisyonunu kaydet
  const saveTranslationPosition = (translation: string, position: { x: number, y: number, width: number, height: number }) => {
    translationPositions[translation] = position;
  };
  
  // Eşleşme kontrolü
  const checkMatch = (wordId: string, translation: string) => {
    const wordIndex = matchingWords.findIndex(w => w.id === wordId);
    const word = matchingWords[wordIndex];
    
    // Eşleşme doğru mu?
    const isMatch = word.translation === translation;
    
    if (isMatch) {
      // Doğru eşleşme
      const updatedWords = matchingWords.map(w => 
        w.id === wordId ? { ...w, matched: true, selected: false } : { ...w, selected: false }
      );
      
      setMatchingWords(updatedWords);
      setTotalMatches(prev => prev + 1);
      
      // Eşleşen çifti kaydet
      setMatchedPairs(prev => [...prev, { wordId, translation, word: word.text }]);
      
      // Eşleşme animasyonu
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
      
      // Tüm eşleşmeler tamamlandı mı?
      if (totalMatches + 1 === matchingWords.length) {
        setGameCompleted(true);
        
        // Oyun tamamlandı animasyonu
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.5,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
          })
        ]).start();
        
        // Oyun tamamlandığında puanı artır (5 puan)
        const pointsToAdd = 5;
        setEarnedPoints(pointsToAdd);
        
        // Kullanıcı ID'si varsa puanı artır
        if (userState.id) {
          incrementUserPointByAmountWithRedux(userState.id, dispatch, pointsToAdd)
            .then(result => {
              if (result.success) {
                setNewTotalPoints(result.newPoint);
                // Puanın artırıldığını gösteren modalı göster
                setShowPointModal(true);
              }
            })
            .catch(error => {
              console.error('Puan artırma hatası:', error);
            });
        }
      }
      
      // Seçimleri sıfırla ama kelimelerin seçili durumunu korumak için state'i güncelleme
      setSelectedWord(null);
      setSelectedTranslation(null);
      
      // Yeni kelime grubu çıkmasını engelle
      return;
    } else {
      // Yanlış eşleşme
      // Yanlış eşleşme durumunu aktifleştir
      setWrongMatch(true);
      
      // Kısa bir süre göster ve sonra seçimleri sıfırla
      setTimeout(() => {
        // Yanlış eşleşme durumunu kapat
        setWrongMatch(false);
        // Sadece yanlış eşleşme durumunda seçimleri sıfırla
        setSelectedWord(null);
        setSelectedTranslation(null);
      }, 800);
    }
    
    // Bu kısmı kaldırıyoruz çünkü doğru eşleşme durumunda zaten return ile fonksiyondan çıkıyoruz
    // Yanlış eşleşme durumunda ise setTimeout içinde sıfırlama yapılıyor
  };
  
  // Profesyonel tamamlanma ekranı fonksiyonu
  const CompletionView = () => (
    <View style={[styles.container, {backgroundColor: 'transparent'}]}>
      <Image 
        source={require('../assets/images/game-background.png')} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      />
      <LinearGradient
        colors={["#e0ffe8", "#f6fafd"]}
        style={styles.completionGradient}
      >
        <View style={styles.completionCard}>
          <View style={styles.completionIconCircle}>
            <Ionicons name="trophy" size={64} color="#4CAF50" />
          </View>
          <Text style={styles.completionTitle}>{t('wordMatching.congratulations')}</Text>
          <Text style={styles.completionMessage}>{t('wordMatching.allMatched')}</Text>
          
          {/* Puan göstergesi */}
          <View style={styles.pointContainerCompletion}>
            <View style={styles.pointIconWrapper}>
              <Ionicons
                name="water-outline"
                size={ICON_SIZE.sm}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.pointText}>+{earnedPoints}</Text>
          </View>
          
          <Text style={styles.rewardMessage}>{t('wordMatching.earnedPoints', 'Kazandınız')}</Text>
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              router.replace('/');
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.backButtonText}>{t('common.goBack')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  if (gameCompleted) {
    return <CompletionView />;
  }

  return (
    <ThemedView style={styles.container}>
      <Image 
        source={require('../assets/images/game-background.png')} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      />
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.headerBackButton} 
          onPress={() => router.replace('/')}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.titleContainerCenter}>
          <Text style={styles.title}>{t('wordMatching.title', 'KELİME EŞLEŞTİRME')}</Text>
        </View>
      </View>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.content}
      >
          {isLoading ? (
            <View style={[styles.container, styles.centerContent]}>
              <Loader size="large" />
              <Text style={styles.loadingText}>{t('flashcards.loading')}</Text>
            </View>
          ) : (
            
            <View style={styles.gameContainer}>
              <View style={styles.matchingLayout}>
                {/* Seçilen kelime ve çeviri arasında geçici çizgi */}
                {selectedWord && selectedTranslation && (
                  (() => {
                    const wordPos = wordPositions[selectedWord];
                    const translationPos = translationPositions[selectedTranslation];
                    
                    if (!wordPos || !translationPos) return null;
                    
                    const startX = wordPos.x + wordPos.width;
                    const startY = wordPos.y + wordPos.height / 2;
                    const endX = translationPos.x;
                    const endY = translationPos.y + translationPos.height / 2;
                    
                    return (
                      <View 
                        style={[
                          styles.connectionLine,
                          {
                            left: startX,
                            top: startY,
                            width: endX - startX,
                            transform: [{ rotate: Math.atan2(endY - startY, endX - startX) + 'rad' }],
                            backgroundColor: '#4facfe'
                          }
                        ]}
                      />
                    );
                  })()
                )}
                
                {/* Sol taraf - Eşleşmemiş İngilizce kelimeler */}
                <View style={styles.wordsColumn}>
                  <ThemedText style={styles.sectionTitle}>{t('wordMatching.english')}</ThemedText>
                  {matchingWords
                    .filter(word => !word.matched) // Sadece eşleşmemiş kelimeleri göster
                    .map((word) => {
                      const isSelected = word.id === selectedWord;
                      return (
                        <TouchableOpacity
                          key={word.id}
                          style={[
                            styles.wordCardVertical,
                            { backgroundColor: Colors[mode].card },
                            isSelected && styles.selectedCard
                          ]}
                          onPress={() => handleWordSelect(word.id)}
                          activeOpacity={0.7}
                          onLayout={(event) => {
                            const { x, y, width, height } = event.nativeEvent.layout;
                            saveWordPosition(word.id, { x, y, width, height });
                          }}
                        >
                          <LinearGradient
                            colors={isSelected ? 
                              (wrongMatch ? 
                                ['#ff9aa2', '#ffb7b2', '#ffdac1'] : 
                                ['#b5ead7', '#c7ceea', '#e2f0cb', '#ffdac1']) : 
                              ['transparent', 'transparent']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.cardGradientOverlay}
                          />
                          <ThemedText 
                            style={[
                              styles.wordText,
                              isSelected && styles.selectedWordText
                            ]}
                          >
                            {word.text.charAt(0).toUpperCase() + word.text.slice(1)}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                  })}
                </View>
                
                {/* Orta kısım - Boş alan */}
                <View style={styles.arrowsColumn}>
                  {/* Boş alan - Çizgiler bu alanın üzerinden geçecek */}
                </View>
                
                {/* Sağ taraf - Eşleşmemiş Türkçe anlamlar */}
                <View style={styles.translationsColumn}>
                  <ThemedText style={styles.sectionTitle}>{t('wordMatching.language')}</ThemedText>
                  {shuffledTranslations
                    .filter(translation => !matchingWords.some(w => w.translation === translation && w.matched)) // Sadece eşleşmemiş çevirileri göster
                    .map((translation, index) => {
                      const isSelected = selectedTranslation === translation;
                      
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.translationCardVertical,
                            { backgroundColor: Colors[mode].card },
                            isSelected && styles.selectedCard
                          ]}
                          onPress={() => handleTranslationSelect(translation)}
                          activeOpacity={0.7}
                          onLayout={(event) => {
                            const { x, y, width, height } = event.nativeEvent.layout;
                            saveTranslationPosition(translation, { x, y, width, height });
                          }}
                        >
                          <LinearGradient
                            colors={isSelected ? 
                              (wrongMatch ? 
                                ['#ff9aa2', '#ffb7b2', '#ffdac1'] : 
                                ['#b5ead7', '#c7ceea', '#e2f0cb', '#ffdac1']) : 
                              ['transparent', 'transparent']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.cardGradientOverlay}
                          />
                          <ThemedText 
                            style={[
                              styles.translationText,
                              isSelected && styles.selectedWordText
                            ]}
                          >
                            {translation}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              </View>
              
              {/* Eşleşen kelime-çeviri çiftleri - Alt kısım */}
              {matchedPairs.length > 0 && (
                <View style={styles.matchedPairsContainer}>
                  <View style={styles.matchedPairsTitleContainer}>
                    <LinearGradient
                      colors={['#6ee7b7', '#a7f3d0']}
                      style={styles.matchedPairsTitleGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="checkmark-done-circle" size={20} color="#FFFFFF" style={styles.matchedPairsIcon} />
                      <ThemedText style={styles.matchedPairsTitle}>{t('wordMatching.matchedWords')}</ThemedText>
                    </LinearGradient>
                  </View>
                  <View style={styles.matchedPairsGrid}>
                    {matchedPairs.map((pair, index) => (
                      <Animated.View 
                        key={index} 
                        style={styles.matchedPairCard}
                      >
                        <View style={styles.matchedPairWordContainer}>
                          <ThemedText style={styles.matchedPairWord}>{pair.word}</ThemedText>
                        </View>
                        <Ionicons name="arrow-forward" size={14} color="#10B981" style={styles.matchedPairArrow} />
                        <View style={styles.matchedPairTranslationContainer}>
                          <ThemedText style={styles.matchedPairTranslation}>{pair.translation}</ThemedText>
                        </View>
                      </Animated.View>
                    ))}
                  </View>
                </View>
              )}
            </View>
            
          )}
        </ScrollView>
    </ThemedView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  completionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: PADDING.xl * 4,
    backgroundColor: 'transparent',
    paddingHorizontal: PADDING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING.lg,
    marginBottom: MARGIN.md,
    paddingVertical: PADDING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e3e8ee',
    backgroundColor: '#fafdff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: '#22223b',
    letterSpacing: 0.2,
  },
  placeholder: {
    width: ICON_SIZE.sm + PADDING.xs * 2,
  },
  content: {
    padding: PADDING.lg,
    paddingBottom: PADDING.xl * 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: MARGIN.xl,
    paddingHorizontal: PADDING.md,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: '#4facfe',
    fontWeight: '500',
  },

  gameContainer: {
    marginBottom: MARGIN.lg,
    marginTop: MARGIN.md,
    alignItems: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: MARGIN.xl,
    textAlign: 'center',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  matchingLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    gap: 8,
    marginTop: MARGIN.md,
  },
  wordsColumn: {
    width: '44%',
    alignItems: 'stretch',
  },
  translationsColumn: {
    width: '44%',
    alignItems: 'stretch',
  },
  arrowsColumn: {
    width: '12%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: PADDING.xl,
  },
  wordCardVertical: {
    padding: PADDING.lg,
    borderRadius: 16,
    marginBottom: MARGIN.md,
    minHeight: 58,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#7cc0fb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    backgroundColor: '#fff',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F7A943',
  },

  translationCardVertical: {
    padding: PADDING.lg,
    borderRadius: 16,
    marginBottom: MARGIN.md,
    minHeight: 58,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#7cc0fb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    backgroundColor: '#fff',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F7A943',
    marginHorizontal: 2,
  },
  cardGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14, // Kartın iç kısmına tam oturması için border radius değerini azalttım
  },
  selectedCard: {
    backgroundColor: '#eaf1fb',
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    // Seçili kart için özel border
    borderColor: '#4361ee',
    borderWidth: 2,
  },

  selectedWordText: {
    color: '#4361ee',
    fontWeight: 'bold',
  },
  wordText: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    fontWeight: '600',
    color: '#22223b',
  },
  translationText: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    fontWeight: '600',
    color: '#22223b',
  },
  connectionLine: {
    position: 'absolute',
    height: 3,
    zIndex: 10,
    backgroundColor: '#4361ee',
    borderRadius: 2,
    opacity: 0.8,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  matchedPairsContainer: {
    marginTop: MARGIN.lg,
    width: '100%',
    paddingHorizontal: PADDING.lg,
  },
  matchedPairsTitleContainer: {
    marginBottom: MARGIN.md,
    alignItems: 'center',
  },
  matchedPairsTitleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: PADDING.sm,
    paddingHorizontal: PADDING.lg,
    borderRadius: 22,
  },
  matchedPairsIcon: {
    marginRight: MARGIN.xs,
  },
  matchedPairsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  matchedPairsGrid: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    gap: 2,
  },
  matchedPairCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eafbf4',
    borderRadius: 16,
    padding: PADDING.sm,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#6ee7b7',
    width: '94%',
    elevation: 2,
    shadowColor: '#6ee7b7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
  },
  matchedPairWordContainer: {
    flex: 1,
    padding: 2,
    alignItems: 'flex-end',
  },
  matchedPairWord: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
    color: '#10B981',
  },
  matchedPairArrow: {
    marginHorizontal: MARGIN.xs,
  },
  matchedPairTranslationContainer: {
    flex: 1,
    padding: 2,
    alignItems: 'flex-start',
  },
  matchedPairTranslation: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
    color: '#10B981',
  },
  matchedCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  matchedText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  newGameButton: {
    backgroundColor: '#4361ee',
    paddingVertical: PADDING.md,
    paddingHorizontal: PADDING.xl,
    borderRadius: 24,
    alignSelf: 'center',
    marginTop: MARGIN.xl,
    elevation: 4,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
  },
  newGameButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  // Flashcard CompletionView tarzı bitiş ekranı stilleri
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
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  completionMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  pointContainerCompletion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a85e5',
    borderRadius: 25,
    padding: 8,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rewardMessage: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal:15,
    marginBottom: 20,
    marginTop: 40,
    
  },
  titleContainerCenter: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#F7A943',
    marginHorizontal: 20,
  },
});
