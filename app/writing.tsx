import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, Dimensions, StatusBar, Platform, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getRandomWord } from '@/services/wordService';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Animated } from 'react-native';
import { useTranslation } from 'react-i18next';

interface FlashCard {
  id: string;
  word: string; // İngilizce kelime
  translation: string; // Kullanıcının dilindeki çeviri
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
  const [remainingAttempts, setRemainingAttempts] = useState(5); // Kalan hak sayısı
  const [attemptAnimation] = useState(new Animated.Value(0)); // Hak azalma animasyonu için
  const { t, i18n } = useTranslation();

  const selectRandomWord = async () => {
    try {
      setLoading(true);
      // Yeni kelime için kalan hak sayısını sıfırla
      setRemainingAttempts(5);
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
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }).start();
      }, 300);
    } catch (error) {
      console.error('Kelime getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // İlk açılışta otomatik kelime seçimi ve animasyon ayarı
  useEffect(() => {
    // İlk açılışta animasyonu başlat
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
    
    selectRandomWord();
  }, []);

  const getMaskedWord = () => {
    if (!currentWord) return '';
    // Artık İngilizce kelimeyi gösteriyoruz, çeviriyi tahmin ettiriyoruz
    return currentWord.translation.toLowerCase().split('').map(letter => 
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

    if (currentWord?.translation.toLowerCase().includes(lowerLetter)) {
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
      
      // Kalan hak sayısını azalt ve animasyon göster
      setRemainingAttempts(prev => {
        const newValue = Math.max(0, prev - 1);
        // Hak azalma animasyonu - tek kalp atışı
        Animated.timing(attemptAnimation, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true
        }).start(() => {
          Animated.timing(attemptAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
          }).start();
        });
        
        // Kalan hak 0 olunca oyunu direkt bitir
        if (newValue === 0) {
          // Önce fade-out animasyonu
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 200,
            useNativeDriver: true
          }).start(() => {
            setGameStatus('lost');
            
            // Sonra fade-in animasyonu
            setTimeout(() => {
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true
              }).start();
            }, 100);
          });
        }
        
        return newValue;
      });
    }

    checkGameStatus(newGuessedLetters);
  };

  // Rastgele bir harf açma fonksiyonu
  const revealRandomLetter = () => {
    if (!currentWord || gameStatus !== 'playing') return;
    
    // Henüz tahmin edilmemiş harfleri bul
    const unrevealed = currentWord.translation.toLowerCase().split('')
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
    
    const translationLetters = new Set(currentWord.translation.toLowerCase().split(''));
    const isComplete = Array.from(translationLetters).every(letter => letters.has(letter));
    
    if (isComplete) {
      // Kelimeyi bildiğinde bonus puan ekle ve haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(prev => prev + 50);
      
      // Önce fade-out animasyonu
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true
      }).start(() => {
        setGameStatus('won');
        
        // Sonra fade-in animasyonu
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }).start();
        }, 100);
      });
    } else if (remainingAttempts <= 0 || letters.size > translationLetters.size + 5) {
      // Kalan hak kalmadığında veya çok fazla yanlış tahmin yapıldığında oyunu kaybet
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Önce fade-out animasyonu
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true
      }).start(() => {
        setGameStatus('lost');
        
        // Sonra fade-in animasyonu
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }).start();
        }, 100);
      });
    }
  };

  const endGame = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    // Önce fade-out animasyonu
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setGameStatus('ended');
      
      // Sonra fade-in animasyonu
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }).start();
      }, 100);
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4FB4E2" translucent={true} />
      <Image
        source={require('@/assets/images/game-background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      <SafeAreaView style={styles.contentContainer}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={endGame}>
              <Icon name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <View style={styles.titleContainerCenter}>
              <Text style={styles.title}>KELİME YAZMA</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4361EE" />
              <Text style={styles.loadingText}>{t('writing.loadingWord')}</Text>
            </View>
          ) : gameStatus === 'ended' ? (
            <Animated.View 
              style={[styles.gameEndContainer, { opacity: fadeAnim }]}
            >
              <LinearGradient
                colors={['#4361EE', '#3a56d4']}
                style={styles.gameEndBadge}
              >
                <Icon name="emoji-events" size={48} color="#FFF" />
              </LinearGradient>
              <Animated.Text 
                style={styles.gameEndTitle}
              >
                {t('writing.gameOver')}
              </Animated.Text>
              <Animated.Text 
                style={styles.gameEndScore}
              >
                {t('writing.totalScore', { score })}
              </Animated.Text>
              <View style={styles.gameEndButtonsContainer}>
                <TouchableOpacity
                  style={[styles.gameEndButton, styles.restartButton]}
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setScore(0);
                    selectRandomWord();
                  }}
                >
                  <Icon name="replay" size={20} color="#fff" />
                  <Text style={styles.buttonText}>{t('writing.restart')}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : currentWord && (
            <Animated.View 
              style={[
                styles.gameContainer,
                { opacity: fadeAnim }
              ]}
            >
              <View style={styles.hintContainer}>
                <Text style={styles.hintLabel}>İngilizce kelime:</Text>
                <Text style={styles.hintText}>{currentWord.word}</Text>
              </View>
              
              <View style={styles.wordContainer}>
                <Text style={styles.maskedWord}>{getMaskedWord()}</Text>
              </View>
              
              <Image 
                source={require('@/assets/images/game-screen-fish.png')} 
                style={styles.fishImage} 
                resizeMode="contain"
              />

              <View style={styles.keyboardContainer}>
                {(i18n.language === 'tr' ? [
                  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'ı', 'o', 'p'],
                  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş', 'i'],
                  ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'ö', 'ç', 'ğ', 'ü']
                ] : [
                  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
                  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
                ]).map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.keyboardRow}>
                    {row.map((letter, index) => {
                      // Pastel ve mavi tonları ağırlıklı renk paleti (kırmızı ve yeşil tonları yok)
                      const buttonColors = [
                        '#87CEEB', // Sky Blue
                        '#ADD8E6', // Light Blue
                        '#B0E0E6', // Powder Blue
                        '#AFEEEE', // Pale Turquoise
                        '#E0FFFF', // Light Cyan
                        '#B0C4DE', // Light Steel Blue
                        '#BCD2EE', // Light Sky Blue
                        '#C6E2FF', // Slate Blue 1
                        '#CAE1FF', // Light Steel Blue 1
                        '#F0F8FF', // Alice Blue
                        '#FFDAB9', // Peach Puff
                        '#FFE4B5', // Moccasin
                        '#D8BFD8', // Thistle
                      ];
                      
                      // Hafif dalgalanma için harf indeksine göre renk seçimi
                      const colorIndex = (rowIndex * 10 + index) % buttonColors.length;
                      const buttonColor = buttonColors[colorIndex];
                      
                      return (
                        <TouchableOpacity
                          key={letter}
                          style={[
                            styles.letterButton,
                            { backgroundColor: guessedLetters.has(letter) ? 
                              (currentWord.translation.toLowerCase().includes(letter) ? '#4CAF50' : '#FF69B4') : 
                              buttonColor },
                            guessedLetters.has(letter) && (
                              currentWord.translation.toLowerCase().includes(letter)
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
                              currentWord.translation.toLowerCase().includes(letter)
                                ? styles.correctLetterText
                                : styles.wrongLetterText
                            )
                          ]}>
                            {letter.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
                
                {gameStatus === 'playing' && (
                  <Animated.View 
                    style={[styles.attemptsContainer, {
                      transform: [
                        { scale: attemptAnimation.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [1, 1.2, 1]
                        }) }
                      ]
                    }]}
                  >
                    <Icon name="favorite" size={18} color="#FF5252" />
                    <Text style={styles.attemptsText}>
                      {t('writing.remainingAttempts', { attempts: remainingAttempts })}
                    </Text>
                  </Animated.View>
                )}
              </View>

              {gameStatus !== 'playing' && (
                <Animated.View 
                style={[styles.gameOverContainer, { opacity: fadeAnim }]}
              >
                  {gameStatus === 'won' && (
                    <LinearGradient
                      colors={['#e0f7e0', '#c8e6c9']}
                      style={[
                        styles.resultBadge,
                        styles.wonBadge
                      ]}
                    >
                      <Icon
                        name="emoji-events"
                        size={32}
                        color="#4CAF50"
                      />
                      <Text style={[
                        styles.gameOverText,
                        { color: '#4CAF50' }
                      ]}>
                        {t('writing.congratulations')}
                      </Text>
                    </LinearGradient>
                  )}
                  
                  <Animated.View 
                    style={styles.wordRevealContainer}
                  >
                    {gameStatus === 'lost' ? (
                      <View style={styles.lostContainer}>
                        <Icon name="favorite" size={36} color="#FF5252" />
                        <Text style={styles.lostText}>Kaybettiniz!</Text>
                      </View>
                    ) : (
                      <Text style={styles.wordRevealLabel}>{t('writing.youWon')}</Text>
                    )}
                    <Text style={styles.correctWordLabel}>{t('writing.correctWord')}:</Text>
                    <Text style={styles.wordRevealText}>{currentWord.translation}</Text>
                    <Text style={styles.wordRevealLabel}>{t('writing.englishWord')}:</Text>
                    <Text style={styles.translationText}>{currentWord.word}</Text>
                    {currentWord.example && (
                      <Text style={styles.exampleText}>{t('writing.example', { example: currentWord.example })}</Text>
                    )}
                  </Animated.View>

                  <Animated.View>
                    <TouchableOpacity
                      style={styles.newGameButton}
                      activeOpacity={0.8}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        selectRandomWord();
                      }}
                    >
                      <Icon name="play-arrow" size={20} color="#fff" style={{marginRight: 5}} />
                      <Text style={[styles.buttonText, {fontSize: 16, fontWeight: 'bold', color: '#fff', textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: {width: 0.5, height: 0.5}, textShadowRadius: 0.5}]}>Sonraki kelime</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </Animated.View>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const { width, height } = Dimensions.get('window');
// Ekran genişliğine göre buton boyutunu ayarla
const buttonSize = Math.min(28, width / 14); // Daha küçük buton boyutu
const isSmallDevice = width < 375;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    paddingBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 15,
    marginBottom: 20,
    marginTop: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginHorizontal: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6B3E26',
    textAlign: 'center',
  },

  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFDE59',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#F7A943',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B3E26',
    marginLeft: 8,
  },
  attemptsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#FF5252',
    marginTop: 15,
    alignSelf: 'center',
  },
  attemptsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 5,
  },
  attemptsResultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#FF5252',
    alignSelf: 'center',
  },
  attemptsResultText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF5252',
    marginLeft: 5,
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
    backgroundColor: 'transparent',
  },
  gameEndContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingVertical: height * 0.1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  gameEndTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#212121',
    marginVertical: 20,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  gameEndScore: {
    fontSize: 28,
    color: '#4361EE',
    marginBottom: 30,
    fontWeight: '600',
    textAlign: 'center',
  },
  wordInfoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  descriptionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 24,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#F7A943',
    alignSelf: 'center',
  },
  maskedWord: {
    fontSize: isSmallDevice ? 34 : 38,
    fontWeight: 'bold',
    letterSpacing: 12,
    color: '#6B3E26',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    marginTop: 15,
    borderRadius: 25,
    padding: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
    borderColor: '#F7A943',
    width: '110%',
    maxWidth: width - 10, // Ekran genişliğine göre maksimum genişlik
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
  },
  letterButton: {
    width: buttonSize,
    height: buttonSize * 1.2,
    margin: 2, // Daha az margin
    borderRadius: 15,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    borderWidth: 1.5, // Daha ince kenar
    borderColor: '#F7A943',
  },
  letterText: {
    fontSize: Math.min(16, buttonSize * 0.6),
    fontWeight: 'bold',
    color: '#6B3E26',
  },
  correctLetterText: {
    color: '#FFFFFF',
  },
  wrongLetterText: {
    color: '#FFFFFF',
  },
  correctLetter: {
    backgroundColor: '#4CAF50', // Koyu Yeşil
    borderColor: '#2E7D32', // Daha Koyu Yeşil
    borderWidth: 2,
  },
  wrongLetter: {
    backgroundColor: '#FF69B4', // Hot Pink
    borderColor: '#C71585', // Medium Violet Red
    borderWidth: 2,
  },
  gameOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(77, 208, 225, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  fishImage: {
    width: width ,
    height: width * 0.3,
    marginBottom: 10,
    alignSelf: 'center',
  },
  gameEndBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  gameEndButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
  gameEndButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    minWidth: 160,
    justifyContent: 'center',
  },
  restartButton: {
    backgroundColor: '#4361EE',
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  wonBadge: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  lostBadge: {
    backgroundColor: '#FF5252',
    borderWidth: 0,
  },
  failureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 50,
    marginBottom: 30,
    backgroundColor: '#FF5252',
    width: '70%',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  failureText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#FFFFFF',
  },
  lostText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF5252',
    marginVertical: 10,
    textAlign: 'center',
  },
  lostContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gameOverText: {
    fontSize: 26,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  wordRevealContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(77, 208, 225, 0.5)',
    maxWidth: width - 40, // Ekran genişliğine göre maksimum genişlik
  },
  wordRevealLabel: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 8,
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
  hintContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F7A943',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    width: '90%',
    alignSelf: 'center',
  },
  hintLabel: {
    fontSize: 16,
    color: '#6B3E26',
    marginBottom: 8,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B3E26',
    textAlign: 'center',
  },
  correctWordLabel: {
    fontSize: 16,
    color: '#757575',
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '500',
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
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginTop: 15,
    borderWidth: 0,
    width: 200,
  },
});

export default HangmanGame;
