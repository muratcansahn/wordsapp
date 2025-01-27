// App.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Animated, 
  PanResponder, 
  Dimensions,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Image,
  GestureResponderEvent,
  PanResponderGestureState,
  Switch,
  TextInput
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Audio } from 'expo-av';

interface Category {
  id: number;
  name: string;
  icon: string;
  description: string;
  level: number;
  isLocked: boolean;
  requiredXP: number;
}

interface WordData {
  id: number;
  word: string;
  meaning: string;
  pronunciation: string;
  examples: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  audioUrl?: string;
}

interface UserProgress {
  level: number;
  xp: number;
  streak: number;
  lastStudyDate: string;
  completedCategories: number[];
  knownWords: number[];
  learningWords: number[];
  reviewDates: { [key: number]: string };
  dailyGoal: number;
  dailyProgress: number;
}

interface AppState {
  currentIndex: number;
  isFlipped: boolean;
  showExamples: boolean;
  showStats: boolean;
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
  showTutorial: boolean;
  soundEnabled: boolean;
  selectedCategory: number | null;
  userProgress: UserProgress;
  currentMode: 'learn' | 'review' | 'practice';
  showCategorySelect: boolean;
}

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Temel Kelimeler',
    icon: '🎯',
    description: 'Günlük hayatta en çok kullanılan kelimeler',
    level: 1,
    isLocked: false,
    requiredXP: 0
  },
  {
    id: 2,
    name: 'Seyahat',
    icon: '✈️',
    description: 'Seyahat ederken ihtiyacınız olacak kelimeler',
    level: 2,
    isLocked: true,
    requiredXP: 50
  },
  {
    id: 3,
    name: 'İş Hayatı',
    icon: '💼',
    description: 'İş hayatında kullanılan profesyonel kelimeler',
    level: 3,
    isLocked: true,
    requiredXP: 100
  },
  {
    id: 4,
    name: 'Sosyal Medya',
    icon: '📱',
    description: 'Modern iletişimde kullanılan kelimeler',
    level: 4,
    isLocked: true,
    requiredXP: 150
  },
  {
    id: 5,
    name: 'Akademik',
    icon: '📚',
    description: 'Akademik çalışmalarda kullanılan kelimeler',
    level: 5,
    isLocked: true,
    requiredXP: 200
  }
];

const INITIAL_USER_PROGRESS: UserProgress = {
  level: 1,
  xp: 0,
  streak: 0,
  lastStudyDate: new Date().toISOString(),
  completedCategories: [],
  knownWords: [],
  learningWords: [],
  reviewDates: {},
  dailyGoal: 20,
  dailyProgress: 0
};

// Kelime listesini kategorilere göre güncelliyoruz
const WORD_DATA: WordData[] = [
  { 
    id: 1, 
    word: 'Serendipity', 
    meaning: 'Şans eseri güzel bir şey bulmak',
    pronunciation: 'ˌserənˈdipədē',
    examples: [
      'Finding this book was pure serendipity.',
      'Their meeting was a serendipitous event.'
    ],
    category: 'Temel Kelimeler',
    difficulty: 'medium',
    imageUrl: 'https://example.com/serendipity.jpg',
    audioUrl: 'https://example.com/serendipity.mp3'
  },
  // ... Diğer kelimeler buraya eklenecek
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

export default function App() {
  const [state, setState] = useState<AppState>({
    currentIndex: 0,
    isFlipped: false,
    showExamples: false,
    showStats: false,
    difficulty: 'all',
    showTutorial: true,
    soundEnabled: true,
    selectedCategory: null,
    userProgress: INITIAL_USER_PROGRESS,
    currentMode: 'learn',
    showCategorySelect: true
  });

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserProgress();
    checkDailyStreak();
  }, []);

  const loadUserProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('userProgress');
      if (progress) {
        setState(prev => ({
          ...prev,
          userProgress: JSON.parse(progress)
        }));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveUserProgress = async (progress: UserProgress) => {
    try {
      await AsyncStorage.setItem('userProgress', JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const checkDailyStreak = () => {
    const lastStudy = new Date(state.userProgress.lastStudyDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Streak'i artır
      updateUserProgress({
        streak: state.userProgress.streak + 1,
        lastStudyDate: today.toISOString()
      });
    } else if (diffDays > 1) {
      // Streak'i sıfırla
      updateUserProgress({
        streak: 0,
        lastStudyDate: today.toISOString()
      });
    }
  };

  const updateUserProgress = (updates: Partial<UserProgress>) => {
    const newProgress = {
      ...state.userProgress,
      ...updates
    };
    setState(prev => ({
      ...prev,
      userProgress: newProgress
    }));
    saveUserProgress(newProgress);
  };

  const playSound = async (type: 'success' | 'error' | 'flip' | 'unlock' | 'pronunciation') => {
    if (!state.soundEnabled) return;
    
    let soundFile;
    // switch (type) {
    //   case 'success':
    //     soundFile = require('./assets/sounds/success.mp3');
    //     break;
    //   case 'error':
    //     soundFile = require('./assets/sounds/error.mp3');
    //     break;
    //   // ... diğer ses dosyaları
    // }

    try {
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const filteredWords = WORD_DATA.filter(word => 
    state.difficulty === 'all' || word.difficulty === state.difficulty
  );

  const renderTutorial = () => {
    if (!state.showTutorial) return null;
    return (
      <Modal
        transparent
        visible={state.showTutorial}
        animationType="fade"
      >
        <View style={styles.tutorialContainer}>
          <View style={styles.tutorialContent}>
            <Text style={styles.tutorialTitle}>Nasıl Kullanılır?</Text>
            <Text style={styles.tutorialText}>• Kartı çevirmek için dokun</Text>
            <Text style={styles.tutorialText}>• Bildiğin kelimeleri sağa kaydır</Text>
            <Text style={styles.tutorialText}>• Bilmediğin kelimeleri sola kaydır</Text>
            <Text style={styles.tutorialText}>• Örnek cümle için yukarı kaydır</Text>
            <TouchableOpacity 
              style={styles.tutorialButton}
              onPress={() => {
                setState(prev => ({ ...prev, showTutorial: false }));
              }}
            >
              <Text style={styles.tutorialButtonText}>Anladım</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderSettings = () => {
    return (
      <Modal
        transparent
        visible={state.showStats}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ayarlar</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Zorluk Seviyesi</Text>
              <View style={styles.difficultyButtons}>
                {['all', 'easy', 'medium', 'hard'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyButton,
                      state.difficulty === level && styles.difficultyButtonActive
                    ]}
                    onPress={() => {
                      setState(prev => ({ ...prev, difficulty: level as AppState['difficulty'] }));
                    }}
                  >
                    <Text style={[
                      styles.difficultyButtonText,
                      state.difficulty === level && styles.difficultyButtonTextActive
                    ]}>
                      {level === 'all' ? 'Hepsi' : 
                       level === 'easy' ? 'Kolay' :
                       level === 'medium' ? 'Orta' : 'Zor'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Ses Efektleri</Text>
              <Switch
                value={state.soundEnabled}
                onValueChange={(value) => {
                  setState(prev => ({ ...prev, soundEnabled: value }));
                }}
              />
            </View>

            <TouchableOpacity
              style={styles.tutorialButton}
              onPress={() => setState(prev => ({ ...prev, showTutorial: true }))}
            >
              <Text style={styles.tutorialButtonText}>Eğitimi Tekrar Göster</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setState(prev => ({ ...prev, showStats: false }))}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderCategorySelect = () => {
    if (!state.showCategorySelect) return null;

    return (
      <View style={styles.categoryContainer}>
        <View style={styles.levelHeader}>
          <View style={styles.levelInfo}>
            <Text style={styles.levelText}>Seviye {state.userProgress.level}</Text>
            <View style={styles.xpContainer}>
              <Text style={styles.xpText}>{state.userProgress.xp} XP</Text>
              <View style={styles.xpBar}>
                <View style={[styles.xpFill, { width: `${(state.userProgress.xp % 100) / 100 * 100}%` }]} />
              </View>
            </View>
          </View>
          <View style={styles.dailyProgress}>
            <Text style={styles.dailyGoalText}>
              Günlük Hedef: {state.userProgress.dailyProgress}/{state.userProgress.dailyGoal}
            </Text>
            <View style={styles.dailyProgressBar}>
              <View 
                style={[
                  styles.dailyProgressFill, 
                  { width: `${(state.userProgress.dailyProgress / state.userProgress.dailyGoal) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        <ScrollView style={styles.categoriesList}>
          {INITIAL_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                category.isLocked && styles.categoryCardLocked,
                state.selectedCategory === category.id && styles.categoryCardSelected
              ]}
              onPress={() => {
                if (!category.isLocked) {
                  setState(prev => ({
                    ...prev,
                    selectedCategory: category.id,
                    showCategorySelect: false
                  }));
                  playSound('unlock');
                } else {
                  Alert.alert(
                    'Kilitli Kategori',
                    `Bu kategoriyi açmak için ${category.requiredXP} XP'ye ihtiyacınız var.`
                  );
                }
              }}
            >
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </View>
                {category.isLocked && (
                  <View style={styles.lockContainer}>
                    <Text style={styles.lockIcon}>🔒</Text>
                    <Text style={styles.requiredXP}>{category.requiredXP} XP</Text>
                  </View>
                )}
              </View>
              {!category.isLocked && (
                <View style={styles.categoryProgress}>
                  <Text style={styles.progressText}>
                    {state.userProgress.completedCategories.includes(category.id) ? 
                      'Tamamlandı ✓' : 
                      'Devam Et →'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.statsOverview}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{state.userProgress.knownWords.length}</Text>
            <Text style={styles.statLabel}>Öğrenilen</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{state.userProgress.streak}</Text>
            <Text style={styles.statLabel}>Seri</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {state.userProgress.completedCategories.length}/{INITIAL_CATEGORIES.length}
            </Text>
            <Text style={styles.statLabel}>Kategori</Text>
          </View>
        </View>
      </View>
    );
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture: PanResponderGestureState) => {
      translateX.setValue(gesture.dx);
      translateY.setValue(gesture.dy);
    },
    onPanResponderRelease: (_, gesture: PanResponderGestureState) => {
      if (gesture.dy < -SWIPE_THRESHOLD) {
        // Yukarı kaydırma - örnek cümleleri göster
        setState(prev => ({ ...prev, showExamples: true }));
      } else if (gesture.dx > SWIPE_THRESHOLD) {
        forceSwipe('right');
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        forceSwipe('left');
      } else {
        resetCardPosition();
      }
    },
  });

  const forceSwipe = (direction: string) => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(translateX, {
      toValue: x,
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = async (direction: string) => {
    const currentWord = filteredWords[state.currentIndex];
    
    if (direction === 'right') {
      // Öğrenilen kelimeyi kaydet
      try {
        const learntWords = await AsyncStorage.getItem('learntWords') || '[]';
        const words: WordData[] = JSON.parse(learntWords);
        words.push(currentWord);
        await AsyncStorage.setItem('learntWords', JSON.stringify(words));
      } catch (error) {
        console.error('Error saving learnt word:', error);
      }
    }

    setState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));

    resetCardPosition();
  };

  const resetCardPosition = (): void => {
    translateX.setValue(0);
    translateY.setValue(0);
    setState(prev => ({ ...prev, isFlipped: false }));
    scale.setValue(1);
    setState(prev => ({ ...prev, showExamples: false }));

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      })
    ]).start();
  };

  const renderCard = () => {
    if (state.currentIndex >= filteredWords.length) {
      return (
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.word}>Tebrikler!</Text>
            <Text style={styles.meaning}>Tüm kelimeleri tamamladınız.</Text>
          </View>
        </View>
      );
    }

    const word = filteredWords[state.currentIndex];
    const rotateVal = translateX.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['10deg', '0deg', '-10deg']
    });

    const likeOpacity = translateX.interpolate({
      inputRange: [0, SCREEN_WIDTH / 4],
      outputRange: [0, 1]
    });

    const nopeOpacity = translateX.interpolate({
      inputRange: [-SCREEN_WIDTH / 4, 0],
      outputRange: [1, 0]
    });

    const cardStyle = {
      transform: [
        { translateX },
        { translateY },
        { rotate: rotateVal }
      ]
    };

    return (
      <Animated.View
        style={[styles.card, cardStyle]}
        {...panResponder.panHandlers}
      >
        <View style={styles.cardContent}>
          <Text style={styles.word}>{word.word}</Text>
          <Text style={styles.meaning}>{state.isFlipped ? word.meaning : '?'}</Text>
          {state.showExamples && (
            <Text style={styles.example}>{word.examples[0]}</Text>
          )}
        </View>

        <Animated.View style={[styles.overlay, { opacity: likeOpacity }]}>
          <Text style={[styles.overlayText, styles.likeText]}>BİLİYORUM</Text>
        </Animated.View>

        <Animated.View style={[styles.overlay, { opacity: nopeOpacity }]}>
          <Text style={[styles.overlayText, styles.nopeText]}>BİLMİYORUM</Text>
        </Animated.View>

        <TouchableOpacity
          style={styles.flipButton}
          onPress={() => setState(prev => ({ ...prev, isFlipped: !prev.isFlipped }))}
        >
          <Text style={styles.flipButtonText}>Çevir</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {state.showCategorySelect ? (
        renderCategorySelect()
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setState(prev => ({ ...prev, showCategorySelect: true }))}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.streakContainer}>
              <Text style={styles.streakText}>🔥 {state.userProgress.streak} gün</Text>
            </View>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => setState(prev => ({ ...prev, showStats: true }))}
            >
              <Text style={styles.settingsButtonText}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { 
                    width: progressWidth.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {state.currentIndex}/{filteredWords.length} kelime
            </Text>
          </View>

          {renderCard()}
          {renderTutorial()}
          {renderSettings()}

          <View style={styles.footer}>
            <Text style={styles.swipeHint}>
              Sola kaydır: Bilmiyorum • Sağa kaydır: Biliyorum
            </Text>
            <Text style={styles.difficultyText}>
              {state.difficulty === 'all' ? 'Tüm Seviyeler' :
               state.difficulty === 'easy' ? 'Kolay Seviye' :
               state.difficulty === 'medium' ? 'Orta Seviye' : 'Zor Seviye'}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  streakContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsButtonText: {
    fontSize: 20,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 110,
    left: 20,
    right: 20,
  },
  progressText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 5,
    fontSize: 12,
  },
  tutorialContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  tutorialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  tutorialText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  tutorialButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 20,
  },
  tutorialButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  difficultyButtonActive: {
    backgroundColor: '#2196F3',
  },
  difficultyButtonText: {
    fontSize: 14,
    color: '#666',
  },
  difficultyButtonTextActive: {
    color: 'white',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  difficultyText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 20,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  meaning: {
    fontSize: 24,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  example: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  swipeHint: {
    position: 'absolute',
    bottom: 20,
    fontSize: 14,
    color: '#999',
  },
  progressBar: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_WIDTH * 1.2,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 18,
    marginVertical: 10,
  },
  menuButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#ff4444',
  },
  resetButtonText: {
    color: 'white',
  },
  menuIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  menuIconText: {
    fontSize: 30,
    color: '#333',
  },
  categoryButton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedCategory: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    color: '#333',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  statsLabel: {
    fontSize: 16,
    color: '#666',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  examplesContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  difficultyBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  streakContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff8c00',
    marginLeft: 5,
  },
  finishText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  restartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 50,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  overlayText: {
    fontSize: 32,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  likeText: {
    color: '#4CAF50',
    borderColor: '#4CAF50',
  },
  nopeText: {
    color: '#FF5252',
    borderColor: '#FF5252',
  },
  flipButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
  },
  flipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  levelHeader: {
    marginBottom: 20,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpText: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  xpBar: {
    width: 100,
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  dailyProgress: {
    marginTop: 10,
  },
  dailyGoalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dailyProgressBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
  },
  dailyProgressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  categoriesList: {
    flex: 1,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryCardLocked: {
    opacity: 0.7,
  },
  categoryCardSelected: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  lockContainer: {
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  requiredXP: {
    fontSize: 12,
    color: '#666',
  },
  categoryProgress: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
});