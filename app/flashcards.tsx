import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, TouchableOpacity, Share, FlatList, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

interface FlashCard {
  id: string;
  word: string;
  translation: string;
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
        example: 'I have five years of work experience.',
      },
      {
        id: '2',
        word: 'Opportunity',
        translation: 'Fırsat',
        example: 'This is a great opportunity for your career.',
      },
      {
        id: '3',
        word: 'Consider',
        translation: 'Düşünmek, değerlendirmek',
        example: 'Please consider my application.',
      },
      {
        id: '4',
        word: 'Improve',
        translation: 'Geliştirmek, iyileştirmek',
        example: 'I want to improve my English skills.',
      },
      {
        id: '5',
        word: 'Provide',
        translation: 'Sağlamak, temin etmek',
        example: 'The company provides health insurance.',
      },
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
        word: 'Suggest',
        translation: 'Önermek, tavsiye etmek',
        example: 'Can you suggest a good restaurant?',
      },
      {
        id: '2',
        word: 'Discuss',
        translation: 'Tartışmak, konuşmak',
        example: 'Let\'s discuss this matter tomorrow.',
      },
      {
        id: '3',
        word: 'Recommend',
        translation: 'Tavsiye etmek',
        example: 'I recommend trying the local cuisine.',
      },
      {
        id: '4',
        word: 'Appreciate',
        translation: 'Takdir etmek, değer vermek',
        example: 'I really appreciate your help.',
      },
      {
        id: '5',
        word: 'Hello',
        translation: 'Merhaba',
        example: 'Hello, how are you?',
      },
    ]
  },
  {
    id: '3',
    title: 'Akademik İngilizce',
    subtitle: 'Eğitim ve akademik hayatta kullanılan kelimeler',
    level: 'B1',
    cards: [
      {
        id: '1',
        word: 'Determine',
        translation: 'Belirlemek, kararlaştırmak',
        example: 'We need to determine the best course of action.',
      },
      {
        id: '2',
        word: 'Participate',
        translation: 'Katılmak',
        example: 'Would you like to participate in our project?',
      },
      {
        id: '3',
        word: 'Achieve',
        translation: 'Başarmak, elde etmek',
        example: 'She achieved her goals through hard work.',
      },
      {
        id: '4',
        word: 'Require',
        translation: 'Gerektirmek, ihtiyaç duymak',
        example: 'This job requires excellent communication skills.',
      },
      {
        id: '5',
        word: 'Goodbye',
        translation: 'Hoşça kal',
        example: 'Goodbye, see you tomorrow!',
      },
    ]
  },
];

export default function FlashcardsScreen() {
  const [selectedList, setSelectedList] = useState<WordList | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('B1');
  const position = useRef(new Animated.ValueXY()).current;

  const [stats, setStats] = useState({
    known: 0,
    unknown: 0,
    favorites: 0
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: 0 }); // Y ekseninde hareket olmasın
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        forceSwipe('right');
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        forceSwipe('left');
      } else {
        resetPosition();
      }
    },
  });

  const forceSwipe = (direction: 'right' | 'left') => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 500,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'right' | 'left') => {
    const item = selectedList?.cards[currentIndex];
    if (direction === 'right') {
      setStats(prev => ({ ...prev, known: prev.known + 1 }));
    } else {
      setStats(prev => ({ ...prev, unknown: prev.unknown + 1 }));
    }
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(currentIndex + 1);
    setShowTranslation(false);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 5,
      tension: 40
    }).start();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-30deg', '0deg', '30deg'],
    });

    const borderColor = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 0.5, 0, SCREEN_WIDTH * 0.5],
      outputRange: ['#F44336', 'transparent', '#4CAF50'],
    });

    const borderWidth = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 0.5, -50, 0, 50, SCREEN_WIDTH * 0.5],
      outputRange: [15, 0, 0, 0, 15],
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
      borderColor,
      borderWidth,
    };
  };

  const renderCard = () => {
    const card = selectedList.cards[currentIndex];

    return (
      <View style={styles.cardContainer}>
        <Animated.View
          style={[styles.card, getCardStyle()]}
          {...panResponder.panHandlers}
        >
          <Text style={styles.wordText}>{card.word}</Text>
          {showTranslation && (
            <View style={styles.translationWrapper}>
              <Text style={styles.translationText}>{card.translation}</Text>
              <Text style={styles.exampleText}>{card.example}</Text>
            </View>
          )}
        </Animated.View>
      </View>
    );
  };

  if (!selectedList) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Kelime Listeleri</Text>
          <Text style={styles.screenSubtitle}>Çalışmak istediğiniz listeyi seçin</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelScroll}>
          {['B1', 'B2', 'C1'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelBadge,
                selectedLevel === level && styles.levelBadgeActive,
              ]}
              onPress={() => setSelectedLevel(level)}
            >
              <Text
                style={[
                  styles.levelText,
                  selectedLevel === level && styles.levelTextActive,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.listContainer}>
          {WORD_LISTS
            .filter((list) => list.level === selectedLevel)
            .map((list) => (
              <TouchableOpacity
                key={list.id}
                style={styles.listCard}
                onPress={() => setSelectedList(list)}
              >
                <View style={styles.listCardContent}>
                  <View style={styles.listIconContainer}>
                    <Icon name={list.title.includes('İş') ? 'briefcase-outline' : list.title.includes('Günlük') ? 'chat-outline' : 'school-outline'} size={24} color="#1976d2" />
                  </View>
                  <View style={styles.listTextContainer}>
                    <Text style={styles.listTitle}>{list.title}</Text>
                    <Text style={styles.listSubtitle}>{list.subtitle}</Text>
                    <View style={styles.listInfoRow}>
                      <View style={styles.listInfoItem}>
                        <Icon name="cards" size={16} color="#666" />
                        <Text style={styles.listInfoText}>{list.cards.length} kelime</Text>
                      </View>
                      <View style={styles.listInfoItem}>
                        <Icon name="clock-outline" size={16} color="#666" />
                        <Text style={styles.listInfoText}>~{Math.ceil(list.cards.length * 0.5)} dk</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    );
  }

  if (currentIndex >= selectedList.cards.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.noMoreCards}>Tüm kartları tamamladınız!</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setSelectedList(null);
            setCurrentIndex(0);
            setStats({ known: 0, unknown: 0, favorites: 0 });
          }}
        >
          <Text style={styles.backButtonText}>Listelere Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>B1 Seviye Kelimeler</Text>
          <Text style={styles.headerSubtitle}>Günlük konuşma kelimeleri</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>B1</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
            <Icon name="check-circle" size={24} color="#4CAF50" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{stats.known}</Text>
            <Text style={styles.statLabel}>Bilinen</Text>
          </View>
        </View>
        <View style={[styles.statDivider, { backgroundColor: '#eee' }]} />
        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}>
            <Icon name="close-circle" size={24} color="#F44336" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{stats.unknown}</Text>
            <Text style={styles.statLabel}>Bilinmeyen</Text>
          </View>
        </View>
        <View style={[styles.statDivider, { backgroundColor: '#eee' }]} />
        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 193, 7, 0.1)' }]}>
            <Icon name="star" size={24} color="#FFC107" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{stats.favorites}</Text>
            <Text style={styles.statLabel}>Favori</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardControlsContainer}>
        <Text style={styles.counterText}>{currentIndex + 1} / {selectedList.cards.length}</Text>
        <TouchableOpacity 
          onPress={() => setShowTranslation(!showTranslation)}
        >
          <Icon name={showTranslation ? 'eye-off' : 'eye'} size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            const card = selectedList.cards[currentIndex];
            Share.share({
              message: `${card.word} - ${card.translation}\n${card.example}`,
              title: 'Kelime Kartı Paylaş'
            });
          }}
        >
          <Icon name="share-variant" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        {renderCard()}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.dontKnowButton]}
          onPress={() => forceSwipe('left')}
        >
          <Icon name="close" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Bilmiyorum</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.knowButton]}
          onPress={() => forceSwipe('right')}
        >
          <Icon name="check" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Biliyorum</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  levelBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    color: '#1976D2',
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTextContainer: {
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 12,
  },
  cardControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  counterText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    height: '100%',
    position: 'relative',
  },
  wordText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  translationWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  translationText: {
    fontSize: 24,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  exampleText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 0.48,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  knowButton: {
    backgroundColor: '#4CAF50',
  },
  dontKnowButton: {
    backgroundColor: '#F44336',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  levelScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  levelBadge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#f5f6fa',
    borderRadius: 20,
    marginRight: 12,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  levelTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    flex: 1,
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  listIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  listTextContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  listSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
  },
  listInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  listInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});
