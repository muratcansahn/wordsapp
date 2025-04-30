import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, Dimensions, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getRandomWord } from '@/services/wordService';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Animated } from 'react-native';
import { useTranslation } from 'react-i18next';

interface FlashCard {
  id: string;
  word: string;
  translation: string;
  description: string;
  example: string;
}

interface WordList {
  id: string;
  title: string;
  subtitle: string;
  level: string;
  cards: FlashCard[];
}

const HangmanGame = () => {
  // Mevcut kültür değerini ayarlayın (varsayılan olarak Türkçe)  
  const [currentWord, setCurrentWord] = useState<FlashCard | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'ended'>('playing');
  const [loading, setLoading] = useState(true);
  const [scoreAnimation] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const { i18n } = useTranslation();

  const selectRandomWord = async () => {
    try {
      setLoading(true);
      // Yeni kelime yüklenirken fade efekti
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
      
      const randomWord = await getRandomWord();
      
      if (randomWord) {
        // Mevcut kültüre göre çeviriyi filtrele
        const wordTranslation = randomWord.WordTranslations.filter(
          translation => (
            translation.language_code === i18n.language
          )
        )[0] || randomWord.WordTranslations[0]; // Eğer filtreleme sonucu boşsa ilk çeviriyi kullan
        
        const newCard: FlashCard = {
          id: randomWord.id.toString(),
          word: randomWord.name,
          translation: wordTranslation.mean || '',
          description: wordTranslation.example_translated || '',
          example: wordTranslation.example_original || '',
        };
        setCurrentWord(newCard);
        console.log('Yeni kelime:', newCard);
      } 
      
      setGuessedLetters(new Set());
      setGameStatus('playing');
      
      // Yeni kelime yüklendiğinde fade-in efekti
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start();
    } catch (error) {
      console.error('Kelime getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // İlk açılışta otomatik kelime seçimi
  useEffect(() => {
    selectRandomWord();
  }, []);

  const getMaskedWord = () => {
    if (!currentWord) return '';
    return currentWord.word.toLowerCase().split('').map(letter => 
      guessedLetters.has(letter.toLowerCase()) ? letter : '_'
    ).join(' ');
  };

  const guessLetter = (letter: string) => {
    if (gameStatus !== 'playing') return;
    
    const lowerLetter = letter.toLowerCase();
    if (guessedLetters.has(lowerLetter)) return;

    const newGuessedLetters = new Set(guessedLetters);
    newGuessedLetters.add(lowerLetter);
    setGuessedLetters(newGuessedLetters);

    if (currentWord?.word.toLowerCase().includes(lowerLetter)) {
      // Doğru tahmin için puan ekle ve haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newScore = score + 10;
      setScore(newScore);
      
      // Skor animasyonu
      Animated.sequence([
        Animated.timing(scoreAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(scoreAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      // Yanlış tahmin için haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    checkGameStatus(newGuessedLetters);
  };

  // Rastgele bir harf açma fonksiyonu
  const revealRandomLetter = () => {
    if (!currentWord || gameStatus !== 'playing') return;
    
    // Henüz tahmin edilmemiş harfleri bul
    const unrevealed = currentWord.word.toLowerCase().split('')
      .filter(letter => !guessedLetters.has(letter.toLowerCase()));
    
    // Eğer tüm harfler zaten açıksa işlem yapma
    if (unrevealed.length === 0) return;
    
    // Rastgele bir harf seç
    const randomLetter = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    
    // Puanı düş ve haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setScore(prev => Math.max(0, prev - 15));
    guessLetter(randomLetter);
  };

  const checkGameStatus = (letters: Set<string>) => {
    if (!currentWord) return;
    
    const wordLetters = new Set(currentWord.word.toLowerCase().split(''));
    const isComplete = Array.from(wordLetters).every(letter => letters.has(letter));
    
    if (isComplete) {
      // Kelimeyi bildiğinde bonus puan ekle ve haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(prev => prev + 50);
      setGameStatus('won');
      // Artık otomatik olarak yeni kelimeye geçmiyoruz
    } else if (letters.size > wordLetters.size + 5) {
      // Çok fazla yanlış tahmin yapıldığında oyunu kaybet
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setGameStatus('lost');
    }
  };

  const endGame = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setGameStatus('ended');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
      <LinearGradient
        colors={['#f8f9fb', '#e6eaf0']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.scoreContainer}>
              <View style={styles.totalScoreContainer}>
                <Icon name="emoji-events" size={24} color="#FF9800" />
                <Animated.Text 
                  style={[
                    styles.scoreText,
                    {
                      transform: [
                        {
                          scale: scoreAnimation.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 1.2, 1]
                          })
                        }
                      ]
                    }
                  ]}
                >
                  Skor: {score}
                </Animated.Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={endGame} 
              style={styles.endButton}
              activeOpacity={0.8}
            >
              <Icon name="stop" size={20} color="#fff" />
              <Text style={styles.buttonText}>Bitir</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4361EE" />
              <Text style={styles.loadingText}>Kelime Yükleniyor...</Text>
            </View>
          ) : gameStatus === 'ended' ? (
            <View style={styles.gameEndContainer}>
              <Icon name="celebration" size={64} color="#4361EE" />
              <Text style={styles.gameEndTitle}>Oyun Bitti!</Text>
              <Text style={styles.gameEndScore}>Toplam Skor: {score}</Text>
              <TouchableOpacity
                style={styles.newGameButton}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setScore(0);
                  selectRandomWord();
                }}
              >
                <Icon name="replay" size={20} color="#fff" />
                <Text style={styles.buttonText}>Yeni Oyun</Text>
              </TouchableOpacity>
            </View>
          ) : currentWord && (
            <Animated.View 
              style={[
                styles.gameContainer,
                { opacity: fadeAnim }
              ]}
            >
              <View style={styles.wordInfoContainer}>
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionTitle}>Türkçe Karşılığı:</Text>
                  <Text style={styles.descriptionText}>{currentWord.translation}</Text>
                </View>
              </View>

              <View style={styles.wordContainer}>
                <Text style={styles.maskedWord}>{getMaskedWord()}</Text>
                <Text style={styles.wordHint}>Bu kelime {currentWord.word.length} harften oluşuyor</Text>
                
                <TouchableOpacity
                  style={styles.hintButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    revealRandomLetter();
                  }}
                  disabled={gameStatus !== 'playing'}
                >
                  <Icon name="lightbulb-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Harf Al (-15 Puan)</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.keyboardContainer}>
                {[
                  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
                  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
                ].map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.keyboardRow}>
                    {row.map(letter => (
                      <TouchableOpacity
                        key={letter}
                        style={[
                          styles.letterButton,
                          guessedLetters.has(letter) && (
                            currentWord.word.toLowerCase().includes(letter)
                              ? styles.correctLetter
                              : styles.wrongLetter
                          ),
                          gameStatus !== 'playing' && styles.disabledButton
                        ]}
                        activeOpacity={0.7}
                        onPress={() => {
                          Haptics.selectionAsync();
                          guessLetter(letter);
                        }}
                        disabled={guessedLetters.has(letter) || gameStatus !== 'playing'}
                      >
                        <Text style={[
                          styles.letterText,
                          guessedLetters.has(letter) && (
                            currentWord.word.toLowerCase().includes(letter)
                              ? styles.correctLetterText
                              : styles.wrongLetterText
                          )
                        ]}>
                          {letter.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>

              {gameStatus !== 'playing' && (
                <View style={styles.gameOverContainer}>
                  <LinearGradient
                    colors={gameStatus === 'won' ? ['#e0f7e0', '#c8e6c9'] : ['#ffebee', '#ffcdd2']}
                    style={[
                      styles.resultBadge,
                      gameStatus === 'won' ? styles.wonBadge : styles.lostBadge
                    ]}
                  >
                    <Icon
                      name={gameStatus === 'won' ? 'emoji-events' : 'sentiment-very-dissatisfied'}
                      size={32}
                      color={gameStatus === 'won' ? '#4CAF50' : '#F44336'}
                    />
                    <Text style={[
                      styles.gameOverText,
                      { color: gameStatus === 'won' ? '#4CAF50' : '#F44336' }
                    ]}>
                      {gameStatus === 'won' ? 'Tebrikler! 🎉' : 'Oyun Bitti!'}
                    </Text>
                  </LinearGradient>
                  
                  <View style={styles.wordRevealContainer}>
                    <Text style={styles.wordRevealLabel}>Kelime:</Text>
                    <Text style={styles.wordRevealText}>{currentWord.word}</Text>
                    <Text style={styles.translationText}>{currentWord.translation}</Text>
                    {currentWord.example && (
                      <Text style={styles.exampleText}>Örnek: "{currentWord.example}"</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.newGameButton}
                    activeOpacity={0.8}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      selectRandomWord();
                    }}
                  >
                    <Icon name="play-circle" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Yeni Kelime</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');
const buttonSize = Math.min(36, width / 11); // Ekran genişliğine göre buton boyutunu ayarla
const isSmallDevice = width < 375;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginLeft: 8,
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: height * 0.2,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#757575',
    fontWeight: '500',
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  gameEndContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingVertical: height * 0.15,
  },
  gameEndTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#212121',
    marginVertical: 20,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gameEndScore: {
    fontSize: 28,
    color: '#424242',
    marginBottom: 30,
    fontWeight: '500',
  },
  wordInfoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  descriptionContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4361EE',
    marginBottom: 12,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 20,
    color: '#424242',
    lineHeight: 26,
    textAlign: 'center',
    fontWeight: '500',
  },
  wordContainer: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  maskedWord: {
    fontSize: isSmallDevice ? 32 : 36,
    fontWeight: 'bold',
    letterSpacing: 10,
    color: '#212121',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  wordHint: {
    fontSize: 16,
    color: '#757575',
    marginTop: 12,
    fontWeight: '500',
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  keyboardContainer: {
    marginTop: 24,
    borderRadius: 16,
    padding: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  letterButton: {
    width: buttonSize,
    height: buttonSize * 1.2,
    margin: 3,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  letterText: {
    fontSize: Math.min(18, buttonSize * 0.6),
    fontWeight: 'bold',
    color: '#424242',
  },
  correctLetterText: {
    color: '#4CAF50',
  },
  wrongLetterText: {
    color: '#F44336',
  },
  correctLetter: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  wrongLetter: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  gameOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  wonBadge: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  lostBadge: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  gameOverText: {
    fontSize: 26,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  wordRevealContainer: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  wordRevealLabel: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 8,
    fontWeight: '500',
  },
  wordRevealText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  translationText: {
    fontSize: 22,
    color: '#4361EE',
    marginBottom: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  exampleText: {
    fontSize: 16,
    color: '#757575',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  newGameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4361EE',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

export default HangmanGame;
