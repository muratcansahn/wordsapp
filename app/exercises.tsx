import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Exercise {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  type: 'listening' | 'writing' | 'speaking' | 'quiz';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
}

const EXERCISES: Exercise[] = [
  {
    id: '1',
    title: 'Temel Dinleme',
    description: 'Günlük konuşmaları dinleyin ve anlayın',
    icon: 'headphones',
    type: 'listening',
    difficulty: 'beginner',
    xpReward: 50,
  },
  {
    id: '2',
    title: 'Kelime Yazma',
    description: 'Kelimeleri doğru şekilde yazın',
    icon: 'pencil',
    type: 'writing',
    difficulty: 'beginner',
    xpReward: 30,
  },
  {
    id: '3',
    title: 'Konuşma Pratiği',
    description: 'Telaffuzunuzu geliştirin',
    icon: 'microphone',
    type: 'speaking',
    difficulty: 'intermediate',
    xpReward: 70,
  },
  {
    id: '4',
    title: 'Gramer Quiz',
    description: 'Gramer bilginizi test edin',
    icon: 'format-list-checks',
    type: 'quiz',
    difficulty: 'advanced',
    xpReward: 100,
  },
];

export default function ExercisesScreen() {
  const router = useRouter();

  const getDifficultyColor = (difficulty: Exercise['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FFC107';
      case 'advanced':
        return '#F44336';
      default:
        return '#4c669f';
    }
  };

  const renderExerciseCard = (exercise: Exercise) => (
    <TouchableOpacity
      key={exercise.id}
      style={styles.exerciseCard}
      onPress={() => router.push(`/exercise/${exercise.id}`)}
    >
      <View style={styles.exerciseHeader}>
        <MaterialCommunityIcons
          name={exercise.icon}
          size={32}
          color="#4c669f"
        />
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseTitle}>{exercise.title}</Text>
          <Text style={styles.exerciseDescription}>
            {exercise.description}
          </Text>
        </View>
      </View>

      <View style={styles.exerciseFooter}>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(exercise.difficulty) },
          ]}
        >
          <Text style={styles.difficultyText}>
            {exercise.difficulty.charAt(0).toUpperCase() +
              exercise.difficulty.slice(1)}
          </Text>
        </View>

        <View style={styles.xpContainer}>
          <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
          <Text style={styles.xpText}>{exercise.xpReward} XP</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Alıştırmalar</Text>
      <Text style={styles.subHeaderText}>
        Seviyenize uygun alıştırmaları seçin
      </Text>

      <View style={styles.exercisesContainer}>
        {EXERCISES.map(renderExerciseCard)}
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
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  exercisesContainer: {
    gap: 20,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  exerciseInfo: {
    marginLeft: 15,
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
  },
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
