import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from '@/utils/audio';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, Dimensions, StatusBar, Platform, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getRandomWord } from '@/services/wordService';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ICON_SIZE, MARGIN } from '@/constants/AppConstants';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updateUserStats, incrementWordStatusCounter } from '@/store/userSlice';
import { updateGameTimestamp } from '@/services/gameRequestServices';
import { useAuth } from '@/context/SupabaseProvider';


// Klavye düzeni ve tuş renk paleti her render'da (her harf tahmininde) yeniden
// allocate edilmesin diye modül seviyesinde sabit tutuluyor.
const KEYBOARD_LAYOUT_TR = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'ı', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş', 'i'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'ö', 'ç', 'ğ', 'ü'],
];
const KEYBOARD_LAYOUT_EN = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];
// Pastel ve mavi tonları ağırlıklı renk paleti (kırmızı ve yeşil tonları yok)
const KEYBOARD_BUTTON_COLORS = [
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
  const [dynamicScoreValue, setDynamicScoreValue] = useState(0); // Dinamik skor değerini tutan state
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [loading, setLoading] = useState(true);
  const [scoreAnimation] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5); // Kalan hak sayısı
  const [attemptAnimation] = useState(new Animated.Value(0)); // Hak azalma animasyonu için
  const { t, i18n } = useTranslation();
  
  // Redux'tan kullanıcı bilgilerini al
  const userState = useSelector((state: RootState) => state.user);
  const { id: userId, point: currentPoint = 0 } = userState;
  const dispatch = useDispatch();
  const { user } = useAuth();

  // Ekrandan çıkıldığında unmount sonrası setState/animasyon çağrısı olmaması
  // için bekleyen tüm timeout'ları takip edip cleanup'ta temizliyoruz.
  const pendingTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const trackTimeout = (fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      pendingTimeoutsRef.current = pendingTimeoutsRef.current.filter(t => t !== id);
      fn();
    }, delay);
    pendingTimeoutsRef.current.push(id);
    return id;
  };
  useEffect(() => {
    return () => {
      pendingTimeoutsRef.current.forEach(clearTimeout);
      pendingTimeoutsRef.current = [];
    };
  }, []);

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
      console.log('randomWord', randomWord);
      
      if (randomWord) {
        // Mevcut kültüre göre çeviriyi filtrele
        const wordTranslation = randomWord.WordTranslations.find(
          translation => translation.language_code === i18n.language
        );
        
        const newCard: FlashCard = {
          id: randomWord.id.toString(),
          word: randomWord.name,
          translation: Array.isArray(wordTranslation?.mean) ? wordTranslation.mean[0] || '' : wordTranslation?.mean || '',
          description: Array.isArray(wordTranslation?.example_translated) ? wordTranslation.example_translated[0] || '' : wordTranslation?.example_translated || '',
          example: Array.isArray(wordTranslation?.example_original) ? wordTranslation.example_original[0] || '' : wordTranslation?.example_original || '',
        };
        setCurrentWord(newCard);
        console.log('Yeni kelime:', newCard);
      } 
      setGuessedLetters(new Set());
      setGameStatus('playing');
      // Yeni kelime yüklendiğinde fade-in efekti
      trackTimeout(() => {
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

  // İlk açılışta otomatik kelime seçimi ve animasyon ayarı — mount'ta veri
  // çekme (selectRandomWord async olup setState içeriyor), React docs'un
  // "Fetching data" örneğiyle aynı, geçerli bir effect kullanımı.
  useEffect(() => {
    // İlk açılışta animasyonu başlat
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();

    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount'ta veri çekme; render sırasında türetilemez
    selectRandomWord();
    
    // Kullanıcının daha önce info modalı görüp görmediğini kontrol et
    const checkInfoModalShown = async () => {
      try {
        const hasSeenInfoModal = await AsyncStorage.getItem('hasSeenWritingInfoModal');
        
        // Eğer kullanıcı daha önce modalı görmemişse göster
        if (hasSeenInfoModal === null) {
          trackTimeout(() => {
            setShowInfoModal(true);
          }, 500);
        }
      } catch (error) {
        console.error('AsyncStorage okuma hatası:', error);
        // Hata durumunda modalı göster
        trackTimeout(() => {
          setShowInfoModal(true);
        }, 500);
      }
    };
    
    checkInfoModalShown();
  }, []);

  useEffect(() => {
    // Timestamp güncelle
    if (user?.id) {
      updateGameTimestamp(user.id, 'wordguess');
    }
  }, [user]);

  useEffect(() => {
    // Unmount'ta da timestamp güncelle
    return () => {
      if (user?.id) {
        updateGameTimestamp(user.id, 'wordguess');
      }
    };
  }, [user]);

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
        
        return newValue;
      });
    }
  };

  // Audio API başlatma işlemi için useEffect
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Audio API'yi başlat
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
        console.log('Audio modülü başarıyla başlatıldı');
      } catch (error) {
        console.error('Audio modülü başlatma hatası:', error);
      }
    };
    
    initAudio();
  }, []);

  // Ses dosyalarını çalmak için fonksiyon
  // Her çağrıda yeni bir ses nesnesi oluşturur ve çalar
  const playSound = async (soundType: 'win' | 'lose') => {
    try {
      console.log(`Ses çalınıyor: ${soundType}`);
      
      let soundSource;
      if (soundType === 'win') {
        soundSource = require('@/assets/audio/success-end.mp3');
      } else if (soundType === 'lose') {
        soundSource = require('@/assets/audio/fail-end.mp3');
      } else {
        console.log(`Geçersiz ses tipi: ${soundType}`);
        return;
      }
      
      // Yeni bir ses nesnesi oluştur ve çal
      const { sound } = await Audio.Sound.createAsync(
        soundSource,
        { shouldPlay: true }
      );
      
      // Ses çalındığında unload et
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && 'didJustFinish' in status && status.didJustFinish) {
          console.log(`${soundType} sesi tamamlandı, temizleniyor...`);
          await sound.unloadAsync();
        }
      });
      
      console.log(`${soundType} sesi başarıyla çalınıyor`);
    } catch (error) {
      console.error(`Ses çalma hatası (${soundType}):`, error);
    }
  };

  // Kelime tamamlama ve oyun durumu kontrolü için useEffect.
  // Not: Gerçek düzeltme bu mantığı guessLetter handler'ına taşımak olurdu
  // (kazanma/kaybetme sesini tetikleyen ayrı effect'le birlikte); burada
  // oyun akışını riske atmamak için effect deseni bilinçli olarak korunuyor.
  useEffect(() => {
    if (!currentWord || gameStatus !== 'playing') return; // Sadece oyun devam ediyorsa ve kelime varsa kontrol et

    const translationLetters = new Set(currentWord.translation.toLowerCase().split(''));
    const isComplete = Array.from(translationLetters).every(letter =>
      guessedLetters.has(letter)
    );

    // Kazanma durumu kontrolü
    if (isComplete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Dinamik skor hesapla
      const totalLetters = currentWord.translation.length;
      const wrongGuesses = Array.from(guessedLetters).filter(
        letter => !currentWord.translation.toLowerCase().includes(letter)
      ).length;
      const dynamicScore = Math.max(1, totalLetters - wrongGuesses); // Minimum 1 puan
      // eslint-disable-next-line react-hooks/set-state-in-effect -- state değişimine tepki veren oyun mantığı, event handler'a taşınması ayrı bir refactor gerektirir
      setDynamicScoreValue(dynamicScore);
      setScore(prev => prev + dynamicScore);

      // Fade-out animasyonu
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true
      }).start(() => {
        // Oyun durumunu değiştir - ses çalma işlemi ayrı bir useEffect'te yapılacak
        setGameStatus('won');

        if (userId) {
          dispatch(updateUserStats({
            point: (userState.point || 0) + dynamicScore,
          }));
          dispatch(incrementWordStatusCounter());
        }

        // Fade-in animasyonu
        trackTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }).start();
        }, 100);
      });
    }
    // Kaybetme durumu kontrolü (remainingAttempts güncellendiğinde çalışır)
    else if (remainingAttempts <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.log('Oyun kaybedildi (useEffect)');

      // Fade-out animasyonu
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true
      }).start(() => {
        // Oyun durumunu değiştir - ses çalma işlemi ayrı bir useEffect'te yapılacak
        setGameStatus('lost');

        // Fade-in animasyonu
        trackTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }).start();
        }, 100);
      });
    }
  }, [guessedLetters, remainingAttempts, currentWord, gameStatus, userId, userState.point, dispatch, fadeAnim, dynamicScoreValue]);
  
  // Oyun durumu değişikliklerini izleyip ses çalma işlemini yapan ayrı bir useEffect
  // Bu sayede ses çalma işlemi sadece bir kez gerçekleşecek
  useEffect(() => {
    // Sadece durum değiştiğinde çalış
    if (gameStatus === 'won') {
      // Kazanma durumunda ses çal
      console.log('Kazanma durumu tespit edildi, ses çalınıyor...');
      // setTimeout kullanarak işlemi sıraya koy
      trackTimeout(() => {
        playSound('win');
      }, 0);
    } else if (gameStatus === 'lost') {
      // Kaybetme durumunda ses çal
      console.log('Kaybetme durumu tespit edildi, ses çalınıyor...');
      // setTimeout kullanarak işlemi sıraya koy
      trackTimeout(() => {
        playSound('lose');
      }, 0);
    }
  }, [gameStatus]); // Sadece gameStatus değiştiğinde çalış

  const CompletionView = () => {
    // Win ve loss durumlarına göre farklı renkler ve içerik
    const isWin = gameStatus === 'won';
    const gradientColors = isWin ? ["#e0ffe8", "#f6fafd"] as const : ["#ffe0e0", "#fdf6fa"] as const;
    const iconName = isWin ? "trophy" : "close-circle";
    const iconColor = isWin ? "#4CAF50" : "#E53935";
    const titleText = isWin ? t('wordMatching.congratulations') : "";
    const messageText = isWin ? t('wordMatching.allMatched') : t('common.betterLuckNextTime');
    const pointsValue = isWin ? dynamicScoreValue : 0;
    const rewardText = isWin ? t('wordMatching.earnedPoints') : '';
    
    return (
      <View style={[styles.container, {backgroundColor: 'transparent'}]}>
        <Image 
          source={require('../assets/images/game-background.png')} 
          style={styles.backgroundImage} 
          resizeMode="cover"
        />
   
        <LinearGradient
          colors={gradientColors}
          style={styles.completionGradient}
        >
          <View style={styles.completionCard}>
            <View style={[styles.completionIconCircle, !isWin && {borderColor: '#E53935'}]}>
              <Ionicons name={iconName} size={64} color={iconColor} />
            </View>
            {isWin && <Text style={styles.completionTitle}>{titleText}</Text>}
            <Text style={styles.completionMessage}>{messageText}</Text>
            
            {isWin ? (
              <>
                {/* Puan göstergesi - Kazanma durumu */}
                <View style={styles.pointContainerCompletion}>
                  <View style={styles.pointIconWrapper}>
                    <Ionicons
                      name="water-outline"
                      size={ICON_SIZE.sm}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.pointText}>+{pointsValue}</Text>
                </View>
                
                <Text style={styles.rewardMessage}>{rewardText}</Text>
              </>
            ) : (
              // Kaybetme durumunda sadece doğru cevabı göster, çerçeve ve gri arka plan olmadan
              <View style={styles.correctAnswerContainerSimple}>
                <Text style={styles.correctAnswerLabel}>{t('common.correctAnswer')}:</Text>
                <Text style={styles.correctAnswerText}>{currentWord?.translation}</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.backButton, !isWin && {backgroundColor: '#E53935'}]}
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
  };
  if (gameStatus === "won" || gameStatus === "lost") return CompletionView();
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
            <TouchableOpacity style={styles.headerBackButton} onPress={() => {
              router.replace('/');
            }}>
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.titleContainerCenter}>
              <Text style={styles.title}>{t('writing.title')}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.infoButton} 
              onPress={() => setShowInfoModal(true)}
            >
              <Icon name="info-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          { currentWord && (
            <Animated.View 
              style={[
                styles.gameContainer,
                { opacity: fadeAnim }
              ]}
            >
              <View style={styles.hintContainer}>
                <Text style={styles.hintLabel}>{t('writing.englishWordLabel')}</Text>
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
                {(i18n.language === 'tr' ? KEYBOARD_LAYOUT_TR : KEYBOARD_LAYOUT_EN).map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.keyboardRow}>
                    {row.map((letter, index) => {
                      // Hafif dalgalanma için harf indeksine göre renk seçimi
                      const colorIndex = (rowIndex * 10 + index) % KEYBOARD_BUTTON_COLORS.length;
                      const buttonColor = KEYBOARD_BUTTON_COLORS[colorIndex];
                      
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
                          disabled={guessedLetters.has(letter)}
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
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={showInfoModal}
        onRequestClose={() => {
          setShowInfoModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('writing.infoTitle') || "Kelime Tahmin Oyunu"}</Text>
            <Text style={styles.modalDescription}>
              {t('writing.infoDescription') || "Maksimum kazanabileceğin puan kelimedeki harf sayısı kadardır. Her bilemediğin harf için kazanacağın puan 1 eksilir. Daha çok puan kazanmak için kelimeyi hatasız tahmin etmeye çalış. Bol şans!"}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                // Modalı kapat
                setShowInfoModal(false);
                
                // AsyncStorage'a kullanıcının modalı gördüğünü kaydet
                AsyncStorage.setItem('hasSeenWritingInfoModal', 'true')
                  .catch(error => console.error('AsyncStorage yazma hatası:', error));
              }}
            >
              <Text style={styles.modalButtonText}>{t('buttons.okay') || "Anladım"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const { width, height } = Dimensions.get('window');
// Ekran genişliğine göre buton boyutunu ayarla
const buttonSize = Math.min(28, width / 14); // Daha küçük buton boyutu
const isSmallDevice = width < 375;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4361EE',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
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
    marginTop: MARGIN.lg,
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(73, 151, 229, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  backButton: {
    width: 160,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4361EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  completionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
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
  backButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 5,
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
  
  // Doğru cevap gösterimi için stil tanımlamaları
  correctAnswerContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E53935',
  },
  // Sade doğru cevap gösterimi için stil tanımı (kırmızı çerçeve ve gri arka plan olmadan)
  correctAnswerContainerSimple: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 16,
    padding: 10,
  },
  correctAnswerLabel: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 8,
    fontWeight: '600',
  },
  correctAnswerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E53935',
    marginBottom: 16,
  },
  wordMeaningContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  wordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 8,
  },
  meaningText: {
    fontSize: 16,
    color: '#4361EE',
    textAlign: 'center',
  },
});

export default HangmanGame;
