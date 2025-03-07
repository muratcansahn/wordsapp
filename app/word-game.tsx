import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ThemedView } from '@/components/common/view';
import { ThemedText } from '@/components/common/typography';
import { useTheme } from '@/hooks/theme/useTheme';
import { Colors } from '@/constants/Colors';
import { BORDER_RADIUS, FONT_SIZE, MARGIN, PADDING } from '@/constants/AppConstants';

export default function WordGameScreen() {
  const router = useRouter();
  const { mode } = useTheme();
  const { words } = useSelector((state: RootState) => state.words);
  
  const [currentWord, setCurrentWord] = useState<string>('');
  const [hiddenWord, setHiddenWord] = useState<string>('');
  const [translation, setTranslation] = useState<string>('');
  const [userGuess, setUserGuess] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [hint, setHint] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  
  // Oyunu başlat
  useEffect(() => {
    startNewRound();
  }, []);
  
  // Yeni bir kelime seç
  const startNewRound = () => {
    if (words.length === 0) {
      Alert.alert('Hata', 'Kelime listesi boş!');
      return;
    }
    
    // Rastgele bir kelime seç
    const randomIndex = Math.floor(Math.random() * words.length);
    const selectedWord = words[randomIndex];
    
    setCurrentWord(selectedWord.text);
    setTranslation(selectedWord.translation);
    setHiddenWord(createHiddenWord(selectedWord.text));
    setUserGuess('');
    setAttempts(0);
    setHint(createHint(selectedWord.text));
    setShowHint(false);
    setGameOver(false);
  };
  
  // Gizli kelime oluştur (harflerin yerine _ koy)
  const createHiddenWord = (word: string) => {
    return word.replace(/[a-zA-Z]/g, '_ ');
  };
  
  // İpucu oluştur (kelimenin ilk ve son harfini göster)
  const createHint = (word: string) => {
    if (word.length <= 2) return word;
    return word[0] + '...' + word[word.length - 1];
  };
  
  // Kullanıcının tahminini kontrol et
  const checkGuess = () => {
    if (!userGuess) {
      Alert.alert('Uyarı', 'Lütfen bir tahmin girin!');
      return;
    }
    
    setAttempts(attempts + 1);
    
    if (userGuess.toLowerCase() === currentWord.toLowerCase()) {
      // Doğru tahmin
      setScore(score + 10);
      Alert.alert(
        'Tebrikler!', 
        `Doğru tahmin! Kelime: ${currentWord}`,
        [{ text: 'Sonraki Kelime', onPress: startNewRound }]
      );
    } else {
      // Yanlış tahmin
      if (attempts >= 2) {
        // 3 denemeden sonra oyun biter
        setGameOver(true);
        Alert.alert(
          'Oyun Bitti', 
          `Doğru kelime: ${currentWord}`,
          [{ text: 'Yeniden Başla', onPress: startNewRound }]
        );
      } else {
        Alert.alert('Yanlış Tahmin', 'Tekrar deneyin!');
      }
    }
  };
  
  // İpucu göster
  const showHintHandler = () => {
    setShowHint(true);
    // İpucu kullanıldığında puandan düşülür
    if (score > 0) {
      setScore(score - 2);
    }
  };
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerText}>Kelime Tahmin Oyunu</ThemedText>
        <View style={styles.scoreContainer}>
          <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
          <ThemedText style={styles.scoreText}>{score} Puan</ThemedText>
        </View>
      </View>
      
      <View style={[styles.gameContainer, { backgroundColor: Colors[mode].card }]}>
        <ThemedText style={styles.translationText}>Çeviri: {translation}</ThemedText>
        
        <View style={styles.wordContainer}>
          <ThemedText style={styles.hiddenWordText}>{hiddenWord}</ThemedText>
        </View>
        
        {showHint && (
          <View style={styles.hintContainer}>
            <ThemedText style={styles.hintText}>İpucu: {hint}</ThemedText>
          </View>
        )}
        
        <TextInput
          style={[styles.input, { backgroundColor: Colors[mode].background, color: Colors[mode].text }]}
          placeholder="Tahmininizi yazın..."
          placeholderTextColor={Colors[mode].text + '80'}
          value={userGuess}
          onChangeText={setUserGuess}
          autoCapitalize="none"
          editable={!gameOver}
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.guessButton]} 
            onPress={checkGuess}
            disabled={gameOver}
          >
            <Text style={styles.buttonText}>Tahmin Et</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.hintButton]} 
            onPress={showHintHandler}
            disabled={showHint || gameOver}
          >
            <Text style={styles.buttonText}>İpucu</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.attemptsContainer}>
          <ThemedText style={styles.attemptsText}>
            Deneme: {attempts}/3
          </ThemedText>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[mode].text} />
        <ThemedText style={styles.backButtonText}>Geri Dön</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: PADDING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MARGIN.lg,
  },
  headerText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    marginLeft: MARGIN.xs,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  gameContainer: {
    padding: PADDING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: MARGIN.lg,
  },
  translationText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: MARGIN.md,
    textAlign: 'center',
  },
  wordContainer: {
    alignItems: 'center',
    marginVertical: MARGIN.lg,
  },
  hiddenWordText: {
    fontSize: FONT_SIZE.xl,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  hintContainer: {
    alignItems: 'center',
    marginBottom: MARGIN.md,
  },
  hintText: {
    fontSize: FONT_SIZE.md,
    fontStyle: 'italic',
  },
  input: {
    width: '100%',
    padding: PADDING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: MARGIN.md,
    fontSize: FONT_SIZE.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: MARGIN.md,
  },
  button: {
    padding: PADDING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: MARGIN.xs,
  },
  guessButton: {
    backgroundColor: '#4facfe',
  },
  hintButton: {
    backgroundColor: '#43e97b',
  },
  buttonText: {
    color: 'white',
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  attemptsContainer: {
    alignItems: 'center',
  },
  attemptsText: {
    fontSize: FONT_SIZE.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: MARGIN.md,
  },
  backButtonText: {
    marginLeft: MARGIN.xs,
    fontSize: FONT_SIZE.md,
  },
});
