import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import Animated, { FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { fetchWordListItems, FlashCard } from '@/services/flashcardsService';

const { width } = Dimensions.get('window');

// Quiz sorusu arayüzü
interface QuizQuestion {
  id: string;
  word: string;
  correctAnswer: string;
  options: string[];
}

export default function QuizPage() {
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
  
  // Flashcardları çek
  useEffect(() => {
    const loadFlashcards = async () => {
      if (!listId) return;
      
      try {
        setLoading(true);
        const cards = await fetchWordListItems(listId as string);
        setFlashcards(cards);
        
        if (cards.length > 0) {
          // Flashcardlardan quiz soruları oluştur
          const quizQuestions = generateQuizQuestions(cards);
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
  
  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
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
  
  const handleRestart = () => {
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
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[mode].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={[styles.loadingText, { color: Colors[mode].text }]}>
            Sorular yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Soru bulunamadı durumu
  if ((!currentQuestion && !showResult) || questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[mode].background }]}>
        <View style={styles.noQuestionsContainer}>
          <Text style={[styles.noQuestionsText, { color: Colors[mode].text }]}>
            Bu liste için henüz soru bulunmamaktadır.
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToStudyMode}
          >
            <Text style={styles.buttonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  if (showResult) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[mode].background }]}>
        <Animated.View 
          entering={FadeInUp}
          style={styles.resultContainer}
        >
          <Text style={[styles.resultTitle, { color: Colors[mode].text }]}>
            Test Tamamlandı!
          </Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>
              {score} / {questions.length}
            </Text>
            <Text style={styles.scoreLabel}>
              Doğru Cevap
            </Text>
          </View>
          
          <Text style={[styles.resultMessage, { color: Colors[mode].text }]}>
            {score === questions.length 
              ? 'Mükemmel! Tüm soruları doğru cevapladınız.' 
              : score >= questions.length / 2 
                ? 'İyi iş! Çoğu soruyu doğru cevapladınız.' 
                : 'Daha fazla pratik yaparak gelişebilirsiniz.'}
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.restartButton]}
              onPress={handleRestart}
            >
              <Text style={styles.buttonText}>Tekrar Dene</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.backButton]}
              onPress={handleBackToStudyMode}
            >
              <Text style={styles.buttonText}>Geri Dön</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[mode].background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backIcon}
          onPress={handleBackToStudyMode}
        >
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color={Colors[mode].text} 
          />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: Colors[mode].text }]}>
            {currentQuestionIndex + 1} / {questions.length}
          </Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
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
        <Text style={styles.questionLabel}>Aşağıdaki kelimenin anlamı nedir?</Text>
        <View style={styles.wordContainer}>
          <Text style={styles.wordText}>{currentQuestion.word}</Text>
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
            {isCorrect ? "Doğru!" : `Yanlış! Doğru cevap: ${currentQuestion.correctAnswer}`}
          </Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backIcon: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    marginLeft: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  questionLabel: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  wordContainer: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 40,
    minWidth: width * 0.7,
    alignItems: 'center',
  },
  wordText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  optionsContainer: {
    width: '100%',
    marginTop: 16,
  },
  optionButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginLeft: 8,
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    padding: 16,
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
    marginLeft: 8,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  scoreContainer: {
    backgroundColor: '#6366F1',
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  resultMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  restartButton: {
    backgroundColor: '#6366F1',
  },
  backButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noQuestionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noQuestionsText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
  },
});
