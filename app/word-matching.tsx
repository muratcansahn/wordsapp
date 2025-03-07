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
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
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
  const { t } = useTranslation();
  const { words } = useSelector((state: RootState) => state.words);
  
  // Durum çubuğu yüksekliği
  const statusBarHeight = Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0;
  
  // Oyun durumu
  const [matchingWords, setMatchingWords] = useState<MatchingWord[]>([]);
  const [shuffledTranslations, setShuffledTranslations] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(null);
  const [wrongMatch, setWrongMatch] = useState<boolean>(false);
  const [score, setScore] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Kelime ve çeviri pozisyonlarını tutmak için referanslar
  const wordPositions = useRef<{[key: string]: {x: number, y: number, width: number, height: number}}>({}).current;
  const translationPositions = useRef<{[key: string]: {x: number, y: number, width: number, height: number}}>({}).current;
  
  // Eşleşmiş kelime-çeviri çiftlerini tutmak için state
  const [matchedPairs, setMatchedPairs] = useState<{wordId: string, translation: string, word: string}[]>([]);
  
  // Oyun için 5 rastgele kelime seç
  useEffect(() => {
    if (words.length > 0) {
      startNewGame();
    }
  }, [words]);
  
  // Yeni oyun başlat
  const startNewGame = () => {
    // Rastgele 5 kelime seç
    const availableWords = [...words];
    const selectedWords: MatchingWord[] = [];
    
    // En az 5 kelime varsa
    const wordCount = Math.min(5, availableWords.length);
    
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableWords.length);
      const word = availableWords.splice(randomIndex, 1)[0];
      
      selectedWords.push({
        id: word.id,
        text: word.text,
        translation: word.translation,
        matched: false,
        selected: false
      });
    }
    
    // Çevirileri karıştır
    const translations = selectedWords.map(word => word.translation);
    const shuffled = [...translations].sort(() => Math.random() - 0.5);
    
    setMatchingWords(selectedWords);
    setShuffledTranslations(shuffled);
    setSelectedWord(null);
    setSelectedTranslation(null);
    setScore(0);
    setTotalMatches(0);
    setGameCompleted(false);
    setGameStarted(true);
    setMatchedPairs([]);
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
      setScore(prev => prev + 10);
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
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={ICON_SIZE.sm} color={Colors[mode].text} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Kelime Eşleştirme</ThemedText>
        <View style={styles.placeholder} />
      </View>
      
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!gameStarted ? (
          <View style={styles.startContainer}>
            <LinearGradient
              colors={['#7cc0fb', '#92e6fb']}
              style={styles.startGradient}
            >
              <MaterialCommunityIcons name="cards-outline" size={80} color="#FFFFFF" style={styles.startIcon} />
              <ThemedText style={styles.startTitle}>
                Kelime Eşleştirme Oyunu
              </ThemedText>
              <View style={styles.startInfoContainer}>
                <ThemedText style={styles.startDescription}>
                  5 kelimeyi doğru çevirileriyle eşleştirin. Doğru eşleştirmeler için puan kazanın.
                </ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.startButton} 
                onPress={startNewGame}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>Oyunu Başlat</Text>
                <Ionicons name="play" size={18} color="#FFFFFF" style={styles.startButtonIcon} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : gameCompleted ? (
          <Animated.View 
            style={[
              styles.completedContainer, 
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}
          >
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.completedGradient}
            >
              <Ionicons name="trophy" size={60} color="#FFFFFF" />
              <Text style={styles.completedTitle}>Tebrikler!</Text>
              <Text style={styles.completedScore}>Skorunuz: {score}</Text>
              <Text style={styles.completedMessage}>
                Tüm kelimeleri başarıyla eşleştirdiniz.
              </Text>
              <TouchableOpacity style={styles.newGameButton} onPress={startNewGame}>
                <Text style={styles.newGameButtonText}>Yeni Oyun</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        ) : (
          <>
            <View style={styles.scoreContainer}>
              <LinearGradient
                colors={['#7cc0fb', '#92e6fb']}
                style={styles.scoreGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.scoreItem}>
                  <Ionicons name="trophy-outline" size={24} color="#FFFFFF" />
                  <ThemedText style={styles.scoreText}>Skor: {score}</ThemedText>
                </View>
                <View style={styles.scoreItem}>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />
                  <ThemedText style={styles.matchesText}>
                    {totalMatches}/{matchingWords.length}
                  </ThemedText>
                </View>
              </LinearGradient>
            </View>
            
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
                  <ThemedText style={styles.sectionTitle}>İngilizce</ThemedText>
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
                            colors={isSelected ? (wrongMatch ? ['#ff6b6b', '#ff8787'] : ['#7cc0fb', '#92e6fb']) : ['transparent', 'transparent']}
                            style={styles.cardGradientOverlay}
                          />
                          <ThemedText 
                            style={[
                              styles.wordText,
                              isSelected && styles.selectedWordText
                            ]}
                          >
                            {word.text}
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
                  <ThemedText style={styles.sectionTitle}>Türkçe</ThemedText>
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
                            colors={isSelected ? (wrongMatch ? ['#ff6b6b', '#ff8787'] : ['#7cc0fb', '#92e6fb']) : ['transparent', 'transparent']}
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
                      <ThemedText style={styles.matchedPairsTitle}>Eşleşen Kelimeler</ThemedText>
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
            
            <TouchableOpacity style={styles.newGameButton} onPress={startNewGame}>
              <Text style={styles.newGameButtonText}>Yeni Oyun</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? PADDING.xl : PADDING.lg + (Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING.md,
    marginBottom: MARGIN.md,
    paddingVertical: PADDING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: PADDING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  placeholder: {
    width: ICON_SIZE.sm + PADDING.xs * 2,
  },
  content: {
    padding: PADDING.md,
    paddingBottom: PADDING.xl * 2,
  },
  startContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: MARGIN.xl,
    paddingHorizontal: PADDING.md,
  },
  startGradient: {
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    padding: PADDING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  startIcon: {
    marginBottom: MARGIN.md,
  },
  startTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    marginBottom: MARGIN.md,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  startInfoContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.md,
    padding: PADDING.md,
    width: '100%',
    marginBottom: MARGIN.lg,
  },
  startDescription: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 22,
    color: '#FFFFFF',
  },
  startButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: PADDING.md,
    paddingHorizontal: PADDING.lg,
    borderRadius: BORDER_RADIUS.full,
    marginTop: MARGIN.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    marginRight: MARGIN.xs,
  },
  startButtonIcon: {
    marginLeft: MARGIN.xs,
  },
  scoreContainer: {
    marginBottom: MARGIN.md,
  },
  scoreGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: BORDER_RADIUS.md,
    padding: PADDING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: MARGIN.xs,
  },
  matchesText: {
    fontSize: FONT_SIZE.md,
    color: '#FFFFFF',
    marginLeft: MARGIN.xs,
  },
  gameContainer: {
    marginBottom: MARGIN.lg,
    marginTop: MARGIN.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    marginBottom: MARGIN.md,
    textAlign: 'center',
    color: '#4facfe',
  },
  // Yeni düzen için stiller
  matchingLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  wordsColumn: {
    width: '40%',
    alignItems: 'stretch',
  },
  translationsColumn: {
    width: '40%',
    alignItems: 'stretch',
  },
  arrowsColumn: {
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: PADDING.xl, // Başlık yüksekliğini dengelemek için
  },
  wordCardVertical: {
    padding: PADDING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: MARGIN.sm,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  translationCardVertical: {
    padding: PADDING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: MARGIN.sm,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS.md,
  },
  selectedCard: {
    borderWidth: 0,
  },
  selectedWordText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  wordText: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  translationText: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  arrowContainer: {
    height: 60, // Kart yüksekliğiyle eşleşmeli
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: MARGIN.sm,
    position: 'relative',
  },
  arrowLine: {
    position: 'absolute',
    height: 2,
    width: '80%',
    backgroundColor: '#E5E7EB',
  },
  matchedArrowLine: {
    backgroundColor: '#10B981',
  },
  selectedArrowLine: {
    backgroundColor: '#4facfe',
  },
  arrowIcon: {
    position: 'absolute',
  },
  lottieArrow: {
    width: '100%',
    height: 60,
  },
  connectionLine: {
    position: 'absolute',
    height: 2,
    zIndex: 10,
    transformOrigin: 'left',
  },
  // Eşleşen çiftler için stiller
  matchedPairsContainer: {
    marginTop: MARGIN.lg,
    width: '100%',
    paddingHorizontal: PADDING.md,
  },
  matchedPairsTitleContainer: {
    marginBottom: MARGIN.md,
    alignItems: 'center',
  },
  matchedPairsTitleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: PADDING.xs,
    paddingHorizontal: PADDING.md,
    borderRadius: BORDER_RADIUS.full,
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
  },
  matchedPairCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#a7f3d020',
    borderRadius: BORDER_RADIUS.md,
    padding: PADDING.sm,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#6ee7b7',
    width: '90%',
    elevation: 1,
    shadowColor: '#6ee7b7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  matchedPairWordContainer: {
    flex: 1,
    padding: 2,
    alignItems: 'flex-end',
  },
  matchedPairWord: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
    color: '#6ee7b7',
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
    color: '#6ee7b7',
  },
  // Dikey kartlar için stiller
  wordCardVertical: {
    width: '100%',
    padding: PADDING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: MARGIN.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60, // Sabit yükseklik
  },
  translationCardVertical: {
    width: '100%',
    padding: PADDING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: MARGIN.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60, // Sabit yükseklik
  },
  wordText: {
    fontSize: FONT_SIZE.md,
    flex: 1,
  },
  translationText: {
    fontSize: FONT_SIZE.md,
    flex: 1,
  },
  matchedCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  matchedText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  selectedCard: {
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    borderColor: '#4facfe',
    borderWidth: 1,
  },
  matchIcon: {
    marginLeft: MARGIN.xs,
  },
  newGameButton: {
    backgroundColor: '#4facfe',
    paddingVertical: PADDING.md,
    paddingHorizontal: PADDING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'center',
    marginTop: MARGIN.lg,
  },
  newGameButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  completedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: MARGIN.xl,
    marginBottom: MARGIN.xl,
  },
  completedGradient: {
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    padding: PADDING.lg,
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: MARGIN.md,
  },
  completedScore: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: MARGIN.sm,
  },
  completedMessage: {
    fontSize: FONT_SIZE.md,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: MARGIN.md,
    marginBottom: MARGIN.lg,
  }
});
