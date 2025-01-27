import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const position = new Animated.ValueXY();

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
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
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'right' | 'left') => {
    const item = DUMMY_DATA[currentIndex];
    direction === 'right' ? console.log('Bilindi:', item.word) : console.log('Bilinmedi:', item.word);
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(currentIndex + 1);
    setShowTranslation(false);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg'],
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
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
      <Animated.View
        style={[styles.cardContainer, getCardStyle()]}
        {...panResponder.panHandlers}
      >
        <View style={styles.card}>
          <Text style={styles.wordText}>{card.word}</Text>
          {showTranslation && (
            <>
              <Text style={styles.translationText}>{card.translation}</Text>
              <Text style={styles.exampleText}>{card.example}</Text>
            </>
          )}
          <MaterialCommunityIcons
            name={showTranslation ? 'eye-off' : 'eye'}
            size={24}
            color="#4c669f"
            onPress={() => setShowTranslation(!showTranslation)}
            style={styles.toggleIcon}
          />
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {renderCard()}
      <View style={styles.helpText}>
        <Text style={styles.helpTextContent}>
          Sola kaydır: Bilmiyorum
          Sağa kaydır: Biliyorum
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    height: 400,
    margin: 20,
    padding: 20,
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    color: '#333',
  },
  translationText: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 20,
    color: '#4c669f',
  },
  exampleText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
    color: '#666',
  },
  toggleIcon: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  noMoreCards: {
    fontSize: 18,
    textAlign: 'center',
    margin: 20,
  },
  helpText: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  helpTextContent: {
    textAlign: 'center',
    color: '#666',
  },
});
