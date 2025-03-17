import React, { useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { FishComponent } from '../fish/FishComponent';

interface FeedingAnimationProps {
  onAnimationComplete?: () => void;
}

export const FeedingAnimation: React.FC<FeedingAnimationProps> = ({ onAnimationComplete }) => {
  const foodPosition = new Animated.Value(0);
  const mouthAnim = new Animated.Value(0);
  const foodOpacity = new Animated.Value(1);

  useEffect(() => {
    // Animasyon değerlerini sıfırla
    foodPosition.setValue(0);
    mouthAnim.setValue(0);
    foodOpacity.setValue(1);

    // Yem düşme animasyonu
    const dropFood = Animated.timing(foodPosition, {
      toValue: 1,
      duration: 2000, // Hızı azaltmak için duration'ı artırdık
      useNativeDriver: true,
    });

    // Balık ağzı animasyonu
    const mouthAnimation = Animated.sequence([
      Animated.timing(mouthAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false, // SVG animasyonu için false olmalı
      }),
      Animated.delay(200), // Ağzı açık tutma süresi
      Animated.timing(mouthAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false, // SVG animasyonu için false olmalı
      }),
    ]);

    // Yem kaybolma animasyonu
    const fadeOutFood = Animated.timing(foodOpacity, {
      toValue: 0,
      duration: 300, // Kaybolma süresini artırdık
      useNativeDriver: true,
    });

    // Ana animasyon sekansı
    Animated.sequence([
      dropFood,
      fadeOutFood, // Önce yem kaybolsun
      mouthAnimation // Sonra balık ağzı animasyonu
    ]).start(() => {
      onAnimationComplete?.();
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.food,
          {
            opacity: foodOpacity,
            transform: [
              {
                translateY: foodPosition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 500], // Düşme mesafesini artırdık
                }),
              },
            ],
          },
        ]}
      />
      <View style={styles.fishContainer}>
        <FishComponent
          width={120}
          height={90}
          mouthAnim={mouthAnim}
          direction="left"
          isEating={true}
          type="orange"
          lastFeedTime={Date.now()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 260, // Daha kompakt container
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  food: {
    width: 8,
    height: 8,
    backgroundColor: '#FFB266',
    borderRadius: 4,
    position: 'absolute',
    top: 20, // Başlangıç pozisyonunu yukarı aldık
    left: '12%', // Balığın ağzının üstüne konumlandırma
  },
  fishContainer: {
    position: 'absolute',
    bottom: 60, // Balığı biraz yukarı aldık
    alignItems: 'center',
  },
});
