import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

const WORD_LISTS: WordList[] = [
  {
    id: '1',
    title: 'İş İngilizcesi',
    subtitle: 'Ofis ve iş hayatında kullanılan temel kelimeler',
    level: 'B1',
    cards: [
      {
        id: '1',
        word: 'Experience',
        translation: 'Deneyim',
        description: 'Bir şeyi yaparak veya yaşayarak elde edilen bilgi ve beceri',
        example: 'I have five years of ____ in this field.',
      },
      {
        id: '2',
        word: 'Opportunity',
        translation: 'Fırsat',
        description: 'Uygun şart ve durum, elverişli zaman veya imkan',
        example: 'This is a great ____ for your career.',
      },
      {
        id: '3',
        word: 'Deadline',
        translation: 'Son Teslim Tarihi',
        description: 'Bir işin tamamlanması gereken son tarih veya zaman',
        example: 'The project ____ is next Friday.',
      },
      {
        id: '4',
        word: 'Meeting',
        translation: 'Toplant',
        description: 'nsanlar bir araya gelerek görüşme yaptığı organizasyon',
        example: 'We have an important ____ with clients tomorrow.',
      },
      {
        id: '5',
        word: 'Schedule',
        translation: 'Program',
        description: 'Yapılacak işlerin planlandığı zaman çizelgesi',
        example: 'Please check your ____ for next week.',
      }
    ]
  },
  {
    id: '2',
    title: 'Günlük Konuşma',
    subtitle: 'Günlük hayatta sık kullanılan kelimeler',
    level: 'B1',
    cards: [
      {
        id: '1',
        word: 'Weather',
        translation: 'Hava Durumu',
        description: 'Belirli bir yerde ve zamanda atmosferin durumu',
        example: 'The ____ is beautiful today.',
      },
      {
        id: '2',
        word: 'Journey',
        translation: 'Yolculuk',
        description: 'Bir yerden başka bir yere yapılan seyahat',
        example: 'Have a safe ____!',
      },
      {
        id: '3',
        word: 'Delicious',
        translation: 'Lezzetli',
        description: 'Tadı çok güzel ve hoş olan yiyecek veya içecek',
        example: 'This cake is absolutely ____.',
      },
      {
        id: '4',
        word: 'Comfortable',
        translation: 'Rahat',
        description: 'Fiziksel olarak rahatlık veren, konforu yüksek',
        example: 'These shoes are very ____.',
      },
      {
        id: '5',
        word: 'Friendship',
        translation: 'Arkadaşlık',
        description: 'İki veya daha fazla kişi arasındaki yakın ve samimi ilişki',
        example: 'Our ____ has lasted for many years.',
      }
    ]
  },
  {
    id: '3',
    title: 'Teknoloji',
    subtitle: 'Teknoloji ve bilişim alanında kullanılan kelimeler',
    level: 'B1',
    cards: [
      {
        id: '1',
        word: 'Download',
        translation: 'İndirmek',
        description: 'İnternetten bilgisayara veya telefona veri aktarma işlemi',
        example: 'Please ____ the latest version of the app.',
      },
      {
        id: '2',
        word: 'Password',
        translation: 'Şifre',
        description: 'Güvenlik için kullanılan gizli karakter dizisi',
        example: 'Remember to change your ____ regularly.',
      },
      {
        id: '3',
        word: 'Wireless',
        translation: 'Kablosuz',
        description: 'Kablo kullanmadan çalışan teknoloji veya bağlant',
        example: 'This is a ____ keyboard.',
      },
      {
        id: '4',
        word: 'Update',
        translation: 'Güncellemek',
        description: 'Bir yazılımı veya sistemi en son sürüme yükseltme',
        example: 'You need to ____ your operating system.',
      },
      {
        id: '5',
        word: 'Browser',
        translation: 'Tarayıcı',
        description: 'İnternet sitelerini görüntülemeye yarayan yazılım',
        example: 'Which web ____ do you prefer?',
      }
    ]
  },
  {
    id: '4',
    title: 'Seyahat',
    subtitle: 'Seyahat ve turizm ile ilgili kelimeler',
    level: 'B1',
    cards: [
      {
        id: '1',
        word: 'Passport',
        translation: 'Pasaport',
        description: 'Uluslararası seyahatlerde kullanılan resmi kimlik belgesi',
        example: 'Don\'t forget to bring your ____.',
      },
      {
        id: '2',
        word: 'Luggage',
        translation: 'Bagaj',
        description: 'Seyahatte yanımızda taşıdığımız çanta ve eşyalar',
        example: 'My ____ was lost at the airport.',
      },
      {
        id: '3',
        word: 'Destination',
        translation: 'Varış Noktası',
        description: 'Seyahatin son bulduğu, varmak istenen yer',
        example: 'Paris is a popular tourist ____.',
      },
      {
        id: '4',
        word: 'Reservation',
        translation: 'Rezervasyon',
        description: 'Önceden yapılan yer ayırtma işlemi',
        example: 'I made a ____ at the hotel.',
      },
      {
        id: '5',
        word: 'Sightseeing',
        translation: 'Gezme',
        description: 'Turistik yerleri gezip görme aktivitesi',
        example: 'We spent the day ____ in Rome.',
      }
    ]
  }
];

const HangmanGame = () => {
  const [currentWord, setCurrentWord] = useState<FlashCard | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [remainingXP, setRemainingXP] = useState(100);
  const [showHint, setShowHint] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'ended'>('playing');
  const [score, setScore] = useState(0);

  const selectRandomWord = () => {
    const allCards = WORD_LISTS.flatMap(list => list.cards);
    const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
    setCurrentWord(randomCard);
    setGuessedLetters(new Set());
    setRemainingXP(100);
    setShowHint(false);
    setGameStatus('playing');
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

    if (!currentWord?.word.toLowerCase().includes(lowerLetter)) {
      setRemainingXP(prev => Math.max(0, prev - 10));
    }

    checkGameStatus(newGuessedLetters);
  };

  const buyHint = () => {
    if (remainingXP >= 15) {
      setRemainingXP(prev => prev - 15);
      setShowHint(true);
    }
  };

  const checkGameStatus = (letters: Set<string>) => {
    if (!currentWord) return;
    
    const wordLetters = new Set(currentWord.word.toLowerCase().split(''));
    const isComplete = Array.from(wordLetters).every(letter => letters.has(letter));
    
    if (isComplete) {
      setGameStatus('won');
      setScore(prev => prev + remainingXP);
      // 2 saniye sonra yeni kelimeye geç
      setTimeout(() => {
        selectRandomWord();
      }, 2000);
    } else if (remainingXP <= 0) {
      setGameStatus('lost');
    }
  };

  const skipWord = () => {
    setRemainingXP(prev => Math.max(0, prev - 20));
    selectRandomWord();
  };

  const endGame = () => {
    setGameStatus('ended');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <View style={styles.xpContainer}>
            <Icon name="star" size={24} color="#FFC107" />
            <Text style={styles.xpText}>{remainingXP} XP</Text>
          </View>
          <View style={styles.totalScoreContainer}>
            <Icon name="emoji-events" size={24} color="#FF9800" />
            <Text style={styles.scoreText}>Skor: {score}</Text>
          </View>
        </View>
        <View style={styles.gameControls}>
          <TouchableOpacity onPress={skipWord} style={styles.skipButton}>
            <Icon name="skip-next" size={20} color="#fff" />
            <Text style={styles.buttonText}>Pas (-20 XP)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={endGame} style={styles.endButton}>
            <Icon name="stop" size={20} color="#fff" />
            <Text style={styles.buttonText}>Bitir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {gameStatus === 'ended' ? (
        <View style={styles.gameEndContainer}>
          <Icon name="celebration" size={64} color="#FFC107" />
          <Text style={styles.gameEndTitle}>Oyun Bitti!</Text>
          <Text style={styles.gameEndScore}>Toplam Skor: {score}</Text>
          <TouchableOpacity
            style={styles.newGameButton}
            onPress={() => {
              setScore(0);
              selectRandomWord();
            }}
          >
            <Icon name="replay" size={20} color="#fff" />
            <Text style={styles.buttonText}>Yeni Oyun</Text>
          </TouchableOpacity>
        </View>
      ) : currentWord && (
        <View style={styles.gameContainer}>
          <View style={styles.wordInfoContainer}>
            <Text style={styles.wordCategory}>İş İngilizcesi • B1 Seviye</Text>
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Açıklama:</Text>
              <Text style={styles.descriptionText}>{currentWord.description}</Text>
            </View>
          </View>

          <View style={styles.wordContainer}>
            <Text style={styles.maskedWord}>{getMaskedWord()}</Text>
            <Text style={styles.wordHint}>Bu kelime {currentWord.word.length} harften oluşuyor</Text>
            
            {!showHint ? (
              <TouchableOpacity
                style={[styles.hintButton, remainingXP < 15 && styles.disabledButton]}
                onPress={buyHint}
                disabled={showHint || remainingXP < 15}
              >
                <Icon name="lightbulb-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Örnek Cümle İste (-15 XP)</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.exampleHintContainer}>
                <Text style={styles.exampleHintTitle}>Örnek Cümle:</Text>
                <Text style={styles.exampleHintText}>{currentWord.example}</Text>
              </View>
            )}
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
                    onPress={() => guessLetter(letter)}
                    disabled={guessedLetters.has(letter) || gameStatus !== 'playing'}
                  >
                    <Text style={[
                      styles.letterText,
                      guessedLetters.has(letter) && styles.usedLetterText
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
              <View style={[
                styles.resultBadge,
                gameStatus === 'won' ? styles.wonBadge : styles.lostBadge
              ]}>
                <Icon
                  name={gameStatus === 'won' ? 'trophy' : 'close-circle'}
                  size={32}
                  color={gameStatus === 'won' ? '#4CAF50' : '#F44336'}
                />
                <Text style={styles.gameOverText}>
                  {gameStatus === 'won' ? 'Tebrikler! 🎉' : 'Oyun Bitti!'}
                </Text>
              </View>
              
              <View style={styles.wordRevealContainer}>
                <Text style={styles.wordRevealLabel}>Kelime:</Text>
                <Text style={styles.wordRevealText}>{currentWord.word}</Text>
                <Text style={styles.translationText}>{currentWord.translation}</Text>
                <Text style={styles.exampleText}>Örnek: "{currentWord.example}"</Text>
              </View>

              <TouchableOpacity
                style={styles.newGameButton}
                onPress={selectRandomWord}
              >
                <Icon name="play-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>Yeni Oyun</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  xpText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginLeft: 8,
  },
  totalScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginLeft: 8,
  },
  gameControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    marginRight: 10,
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  gameEndContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameEndTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121',
    marginVertical: 20,
  },
  gameEndScore: {
    fontSize: 24,
    color: '#424242',
    marginBottom: 30,
  },
  wordInfoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  wordCategory: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 10,
  },
  descriptionContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    elevation: 2,
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 17,
    color: '#424242',
    lineHeight: 24,
    textAlign: 'center',
  },
  wordContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
    marginBottom: 20,
  },
  maskedWord: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 8,
    color: '#212121',
  },
  wordHint: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
    elevation: 0,
  },
  exampleHintContainer: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginTop: 16,
  },
  exampleHintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  exampleHintText: {
    fontSize: 15,
    color: '#1B5E20',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  keyboardContainer: {
    width: '100%',
    marginTop: 20,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  letterButton: {
    width: 36,
    height: 42,
    margin: 3,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  letterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
  },
  correctLetter: {
    backgroundColor: '#81C784',
  },
  wrongLetter: {
    backgroundColor: '#E57373',
  },
  usedLetterText: {
    color: '#FFF',
  },
  gameOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 24,
    elevation: 4,
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
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#212121',
  },
  wordRevealContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  wordRevealLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  wordRevealText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  translationText: {
    fontSize: 20,
    color: '#1976D2',
    marginBottom: 12,
  },
  exampleText: {
    fontSize: 16,
    color: '#757575',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  newGameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },
});

export default HangmanGame;
