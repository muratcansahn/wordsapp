import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

const QUESTIONS: Question[] = [
  {
    id: '1',
    question: 'What is the correct translation of "book"?',
    options: ['kalem', 'kitap', 'defter', 'silgi'],
    correctAnswer: 'kitap',
  },
  {
    id: '2',
    question: 'Choose the correct sentence:',
    options: [
      'I am student a.',
      'I am a student.',
      'I a student am.',
      'I student am a.',
    ],
    correctAnswer: 'I am a student.',
  },
  // Daha fazla soru eklenebilir
];

export default function LevelTestScreen() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleAnswer = (answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [QUESTIONS[currentQuestion].id]: answer,
    });

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    let correctCount = 0;
    Object.keys(selectedAnswers).forEach((questionId) => {
      const question = QUESTIONS.find((q) => q.id === questionId);
      if (question && selectedAnswers[questionId] === question.correctAnswer) {
        correctCount++;
      }
    });

    const percentage = (correctCount / QUESTIONS.length) * 100;
    setShowResult(true);
    // Seviye belirleme mantığı
    let level = '';
    if (percentage >= 80) {
      level = 'Advanced';
    } else if (percentage >= 50) {
      level = 'Intermediate';
    } else {
      level = 'Beginner';
    }

    // Seviye bilgisini kaydet ve ana sayfaya dön
    redirectTimeoutRef.current = setTimeout(() => {
      router.replace('/');
    }, 3000);
  };

  if (showResult) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="check-circle" size={64} color="#4CAF50" />
        <Text style={styles.resultText}>Test tamamlandı!</Text>
        <Text style={styles.resultDescription}>
          Sonuçlarınız değerlendiriliyor...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentQuestion + 1} / {QUESTIONS.length}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {QUESTIONS[currentQuestion].question}
        </Text>

        <View style={styles.optionsContainer}>
          {QUESTIONS[currentQuestion].options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswers[QUESTIONS[currentQuestion].id] === option &&
                  styles.selectedOption,
              ]}
              onPress={() => handleAnswer(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedAnswers[QUESTIONS[currentQuestion].id] === option &&
                    styles.selectedOptionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4c669f',
    borderRadius: 4,
  },
  questionContainer: {
    flex: 1,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 30,
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOption: {
    backgroundColor: '#4c669f',
    borderColor: '#4c669f',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  resultDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});
