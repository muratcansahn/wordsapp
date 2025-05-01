import React, { useState, useEffect, useRef } from 'react';
import { addSkippedWordListId } from '@/services/gameRequestServices';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, ActivityIndicator, Image, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeOut,
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { fetchWordListItems, FlashCard, WordListWithItems } from '@/services/flashcardsService';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PADDING, MARGIN } from '@/constants/AppConstants';
import { incrementUserPointWithRedux } from '@/services/userService';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

// Quiz sorusu arayüzü
interface QuizQuestion {
  id: string;
  word: string;
  correctAnswer: string;
  options: string[];
}

export default function QuizPage() {
  const { t } = useTranslation();
  const { listId } = useLocalSearchParams();
  const router = useRouter();
  const { mode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const userPoint = useSelector((state: RootState) => state.user.point);
  const [wordList, setWordList] = useState<WordListWithItems | null>(null);

  const dispatch = useDispatch();
  const pointScale = useSharedValue(1);
  const pointOpacity = useSharedValue(1);
  useEffect(() => {
    const sendSkippedList = async () => {
      if (showResult && listId) {
        try {
          const user = await supabase.auth.getUser();
          if (user.data?.user && listId) {
            const result = await addSkippedWordListId(user.data.user.id, listId as string);
            if (!result.success) {
              alert('Kelime listesi güncellenemedi: ' + (result.error || 'Bilinmeyen hata'));
            }
          }
        } catch (err: any) {
          alert('Beklenmeyen bir hata oluştu: ' + err.message);
        }
      }
    };
    sendSkippedList();
    // showResult değiştiğinde tetiklenir
  }, [showResult, listId]);

  const pointAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pointScale.value }],
      opacity: pointOpacity.value,
    };
  });

  const animatePoint = () => {
    pointScale.value = withSequence(
      withSpring(1.3),
      withSpring(1)
    );
    pointOpacity.value = withSequence(
      withTiming(0.6, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  // Flashcardları çek
  useEffect(() => {
    const loadFlashcards = async () => {
      if (!listId) return;
      
      try {
        setLoading(true);
        const wordList = await fetchWordListItems(listId as string);
        setFlashcards(wordList.cards);
        setWordList(wordList);
        
        if (wordList.cards.length > 0) {
          // Flashcardlardan quiz soruları oluştur
          const quizQuestions = generateQuizQuestions(wordList.cards);
          setQuestions(quizQuestions);
        }
      } catch (error) {
        console.error('Flashcard yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFlashcards();
  }, [listId]);
  
  // Flashcardlardan quiz soruları oluştur
  const generateQuizQuestions = (cards: FlashCard[]): QuizQuestion[] => {
    // Her kelime için bir soru oluştur
    return cards.map(card => {
      // Doğru cevap
      const correctAnswer = card.translation;
      
      // Yanlış cevaplar için diğer kelimelerin çevirilerinden rastgele 3 tane seç
      const otherTranslations = cards
        .filter(c => c.id !== card.id)
        .map(c => c.translation);
      
      // Rastgele 3 yanlış cevap seç (eğer yeterli sayıda kelime varsa)
      let wrongAnswers: string[] = [];
      
      // Yeterli sayıda farklı çeviri yoksa, mevcut olanları kullan
      if (otherTranslations.length >= 3) {
        // Çevirileri karıştır
        const shuffled = [...otherTranslations].sort(() => 0.5 - Math.random());
        wrongAnswers = shuffled.slice(0, 3);
      } else {
        // Mevcut tüm farklı çevirileri kullan
        wrongAnswers = [...otherTranslations];
        
        // Eksik kalan şıklar için varsayılan değerler ekle
        const defaultAnswers = ['Çeviri bulunamadı 1', 'Çeviri bulunamadı 2', 'Çeviri bulunamadı 3'];
        
        for (let i = wrongAnswers.length; i < 3; i++) {
          wrongAnswers.push(defaultAnswers[i]);
        }
      }
      
      // Tüm şıkları birleştir ve karıştır
      const allOptions = [correctAnswer, ...wrongAnswers].sort(() => 0.5 - Math.random());
      
      return {
        id: card.id,
        word: card.word,
        correctAnswer,
        options: allOptions
      };
    });
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleAnswerSelect = async (answer: string) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
      
      // Doğru cevap verildiğinde point'i artır
      const user = await supabase.auth.getUser();
      if (user.data?.user) {
        await incrementUserPointWithRedux(user.data.user.id, dispatch);
        animatePoint(); // Point artınca animasyonu başlat
      }
    }
    
    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };
  
  const handleRestart = async () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setShowResult(false);
  };

  
  const handleBackToStudyMode = () => {
    router.back();
  };
  
  // Yükleme durumu
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: mode === 'dark' ? Colors.dark.background : Colors.light.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </SafeAreaView>
    );
  }
  
  // Soru bulunamadı durumu
  if ((!currentQuestion && !showResult) || questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: mode === 'dark' ? Colors.dark.background : Colors.light.background }]}>
        <View style={styles.noQuestionsContainer}>
          <Text style={styles.noQuestionsText}>Bu liste için henüz soru bulunmamaktadır.</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToStudyMode}
          >
            <Text style={styles.buttonText}>{t('quiz.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Quiz bittiğinde addSkippedWordListId isteğini otomatik gönder


  if (showResult) {
    return (
      <View style={[styles.container, { backgroundColor: '#f6fafd' }]}> 
        <LinearGradient
          colors={["#e0ffe8", "#f6fafd"]}
          style={styles.completionGradient}
        >
          <View style={styles.completionCard}>
            <View style={styles.completionIconCircle}>
              <Icon name="check-circle" size={64} color="#4CAF50" />
            </View>
            <Text style={styles.resultTitle}>{t('quiz.resultTitle')}</Text>
            <Text style={styles.completionStats}>
              {score} / {questions.length} {t('quiz.scoreLabel')}
            </Text>
            <View style={styles.completionButtonContainer}>
  <TouchableOpacity
    style={[styles.completionButtonEqual, { backgroundColor: '#3B82F6' }]}
    onPress={handleBackToStudyMode}
    activeOpacity={0.85}
  >
    <Text style={styles.buttonText}>{t('quiz.back')}</Text>
  </TouchableOpacity>
</View>
          </View>
        </LinearGradient>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: mode === 'dark' ? Colors.dark.background : Colors.light.background }]}> 
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require('@/assets/images/game-background.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          <View style={styles.header}>
        

        <View>
          <Text style={styles.headerTitle}>{wordList?.title}</Text>
          <Text style={styles.headerSubtitle}>{wordList?.subtitle}</Text>
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
      
      
      <View style={styles.headerProgressCustom}>
        
        <Text style={styles.progressTextCustom}>{currentQuestionIndex + 1} / {questions.length}</Text>
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
              ]}
            />
          </View>
        </View>
      </View>
      
      <Animated.View 
        key={currentQuestionIndex}
        entering={FadeInDown}
        style={styles.questionContainer}
      >
        <Text style={styles.questionLabel}>{t('quiz.questionLabel')}</Text>
        <View style={styles.wordContainerCustom}>
          <Text style={styles.wordTextCustom}>{currentQuestion.word}</Text>
        </View>
        
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === option && (
                  option === currentQuestion.correctAnswer 
                    ? styles.correctOption 
                    : styles.incorrectOption
                )
              ]}
              onPress={() => handleAnswerSelect(option)}
              disabled={selectedAnswer !== null}
            >
              <Text 
                style={[
                  styles.optionText,
                  selectedAnswer === option && (
                    option === currentQuestion.correctAnswer 
                      ? styles.correctOptionText 
                      : styles.incorrectOptionText
                  )
                ]}
              >
                {option}
              </Text>
              
              {selectedAnswer === option && option === currentQuestion.correctAnswer && (
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={24} 
                  color="#FFFFFF" 
                  style={styles.optionIcon}
                />
              )}
              
              {selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                <MaterialCommunityIcons 
                  name="close-circle" 
                  size={24} 
                  color="#FFFFFF" 
                  style={styles.optionIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
      
      {selectedAnswer && (
        <Animated.View 
          entering={FadeInUp}
          style={[
            styles.feedbackContainer,
            isCorrect ? styles.correctFeedback : styles.incorrectFeedback
          ]}
        >
          <MaterialCommunityIcons 
            name={isCorrect ? "check-circle" : "close-circle"} 
            size={24} 
            color="#FFFFFF" 
          />
          <Text style={styles.feedbackText}>
            {isCorrect 
  ? t('quiz.correct') 
  : t('quiz.incorrect', { answer: currentQuestion.correctAnswer })}
          </Text>
        </Animated.View>
      )}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
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
  completionStats: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#4CAF50', // writing sayfasındaki gibi yeşil
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 4,
  },
  backButtonText: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  completionButtonEqual: {
    flex: 1,
    height: 48,
    marginHorizontal: 0,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4361EE', // Dolu ve belirgin mavi
    elevation: 0,
    borderWidth: 0,
    shadowColor: 'transparent',
  },
  restartButton: {
    backgroundColor: '#4361EE', // writing sayfasındaki gibi mavi
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 0,
    paddingBottom: 0,
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PADDING.md,
    paddingBottom: PADDING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: '#0006',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    textShadowColor: '#0004',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
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
  headerProgressCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING.md,
    marginTop: 10,
    marginBottom: 10,
  },
  progressTextCustom: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#0008',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressBarWrapper: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
    alignItems: 'flex-end',
  },
  progressBarBg: {
    width: '100%',
    height: 16,
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  progressBarFill: {
    height: 16,
    backgroundColor: '#29B6F6',
    borderRadius: 12,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: '#29B6F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: PADDING.md,
    paddingTop: PADDING.md,
    alignItems: 'center',
  },
  questionLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  wordContainerCustom: {
    backgroundColor: '#1E88E5',
    borderRadius: 32,
    paddingVertical: 24,
    paddingHorizontal: 32,
    marginBottom: 24,
    minWidth: width * 0.7,
    alignItems: 'center',
    shadowColor: '#1565c0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#90caf9',
  },
  wordTextCustom: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#0007',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  optionsContainer: {
    width: '100%',
    marginTop: PADDING.md,
  },
  optionButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: PADDING.md,
    paddingHorizontal: PADDING.lg,
    borderRadius: 12,
    marginBottom: PADDING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#F7A943',
  },
  correctOption: {
    backgroundColor: '#10B981',
  },
  incorrectOption: {
    backgroundColor: '#EF4444',
  },
  optionText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '500',
  },
  correctOptionText: {
    color: '#FFFFFF',
  },
  incorrectOptionText: {
    color: '#FFFFFF',
  },
  optionIcon: {
    marginLeft: PADDING.sm,
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: PADDING.md,
    left: PADDING.md,
    right: PADDING.md,
    padding: PADDING.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctFeedback: {
    backgroundColor: '#10B981',
  },
  incorrectFeedback: {
    backgroundColor: '#EF4444',
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: PADDING.sm,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: PADDING.md,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: PADDING.md,
    textAlign: 'center',
  },
  scoreContainer: {
    backgroundColor: '#6366F1',
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: PADDING.md,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: PADDING.sm,
  },
  resultMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: PADDING.md,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    paddingVertical: PADDING.sm,
    paddingHorizontal: PADDING.md,
    borderRadius: 8,
    marginHorizontal: PADDING.sm,
    minWidth: 120,
    alignItems: 'center',
  },
  noQuestionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: PADDING.md,
  },
  noQuestionsText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: PADDING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: PADDING.md,
  },
  loadingText: {
    fontSize: 18,
    marginTop: PADDING.sm,
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
});
