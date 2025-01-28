import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, TouchableOpacity, Share } from 'react-native';
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

const DUMMY_DATA: FlashCard[] = [
  {
    id: '1',
    word: 'Hello',
    translation: 'Merhaba',
    example: 'Hello, how are you?',
  },
  {
    id: '2',
    word: 'Goodbye',
    translation: 'Hoşça kal',
    example: 'Goodbye, see you tomorrow!',
  },
  // Daha fazla kart eklenebilir
];

export default function FlashcardsScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;

  // İstatistikler için state'ler
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
    const item = DUMMY_DATA[currentIndex];
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
    const rightOpacity = position.x.interpolate({
      inputRange: [0, SCREEN_WIDTH / 4],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    const leftOpacity = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 4, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const borderColor = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 4, 0, SCREEN_WIDTH / 4],
      outputRange: ['#e74c3c', '#fff', '#2ecc71'],
      extrapolate: 'clamp',
    });

    return {
      ...position.getLayout(),
      borderColor,
      rightOpacity,
      leftOpacity,
    };
  };

  if (currentIndex >= DUMMY_DATA.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.noMoreCards}>Tüm kartları tamamladınız!</Text>
      </View>
    );
  }

  const renderCard = () => {
    const card = DUMMY_DATA[currentIndex];

    return (
      <View style={styles.content}>
        <View style={styles.cardWrapper}>
          <Animated.View
            style={[styles.cardContainer, getCardStyle()]}
            {...panResponder.panHandlers}
          >
            <Animated.View 
              style={[
                styles.card,
                { 
                  borderColor: getCardStyle().borderColor,
                  borderWidth: 3,
                }
              ]}
            >
              <Text style={styles.wordText}>{card.word}</Text>
              {showTranslation && (
                <View style={styles.translationWrapper}>
                  <Text style={styles.translationText}>{card.translation}</Text>
                  <Text style={styles.exampleText}>{card.example}</Text>
                </View>
              )}
            </Animated.View>
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.listInfo}>
        <View style={styles.listHeader}>
          <View>
            <Text style={styles.listTitle}>B1 Seviye Kelimeler</Text>
            <Text style={styles.listSubtitle}>Günlük konuşma kelimeleri</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>B1</Text>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
              <Icon name="check-circle-outline" size={22} color="#2ecc71" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{stats.known}</Text>
              <Text style={styles.statLabel}>Bilinen</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
              <Icon name="close-circle-outline" size={22} color="#e74c3c" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{stats.unknown}</Text>
              <Text style={styles.statLabel}>Bilinmeyen</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(241, 196, 15, 0.1)' }]}>
              <Icon name="star-outline" size={22} color="#f1c40f" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{stats.favorites}</Text>
              <Text style={styles.statLabel}>Favori</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.header}>
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {DUMMY_DATA.length}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.toggleIcon}
          onPress={() => setShowTranslation(!showTranslation)}
        >
          <Icon name={showTranslation ? 'eye-off' : 'eye'} size={24} color="#4c669f" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={() => {
            const card = DUMMY_DATA[currentIndex];
            Share.share({
              message: `${card.word} - ${card.translation}\n${card.example}`,
              title: 'Kelime Kartı Paylaş'
            });
          }}
        >
          <Icon name="share-variant" size={20} color="#4c669f" />
        </TouchableOpacity>
      </View>
      
      {renderCard()}
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
    backgroundColor: '#f5f5f5',
  },
  listInfo: {
    width: '100%',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  listSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  levelBadge: {
    backgroundColor: '#4c669f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 10,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  counterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  counterText: {
    color: '#4c669f',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  shareButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: SCREEN_WIDTH - 40,
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    height: 400,
    width: '100%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  toggleIcon: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  helpText: {
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  helpTextContent: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  noMoreCards: {
    fontSize: 24,
    textAlign: 'center',
    margin: 20,
    color: '#2c3e50',
  },
  swipeText: {
    position: 'absolute',
    top: 20,
    fontSize: 24,
    fontWeight: '600',
    opacity: 0.5,
  },
  wordText: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
  },
  translationWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  translationText: {
    fontSize: 28,
    textAlign: 'center',
    color: '#4c669f',
    marginBottom: 15,
  },
  exampleText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  knowButton: {
    backgroundColor: '#2ecc71',
  },
  dontKnowButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});
