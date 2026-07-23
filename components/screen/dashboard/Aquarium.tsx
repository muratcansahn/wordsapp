import React, { FC, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, AppState } from 'react-native';
import { FishComponent } from '@/components/fish/FishComponent';

interface AquariumProps {
  fishType?: string;
  direction?: number;
  hungerLevel?: number;
  lastFeedTime?: string;
  fishData?: any;
  isEating?: boolean;
}

export const Aquarium: FC<AquariumProps> = ({ 
  fishData,
  fishType = 'orange', 
  direction = 1, // 1: sağa, -1: sola
  // hungerLevel = fishData.hunger_level,
  isEating = false,
}) => {
  // Balık animasyonu için Animated değerleri
  const [mouthAnim] = useState(new Animated.Value(0));
  // Başlangıç pozisyonunu direction'a göre ayarla
  const boundaryWidth = 110; // Animasyonun kullandığı sınır değeriyle aynı olmalı
  const initialX = direction === 1 ? -boundaryWidth : boundaryWidth;
  const [fishPositionX] = useState(() => new Animated.Value(initialX));
  const [fishRotation] = useState(() => new Animated.Value(0));
  const [fishDirection, setFishDirection] = useState<"right" | "left">(direction === 1 ? "right" : "left"); // Başlangıç yönünü direction prop'una göre ayarla
  
  // Baloncuklar için standart React Native Animated API kullanıyoruz
  const [bubbles] = useState(() => [...Array(15)].map(() => ({
    xPos: Math.random() * 320 * 0.8,
    yPos: Math.random() * 200,
    size: Math.random() * 12 + 3,
    speed: Math.random() * 2000 + 1500,
    // Standart Animated değerleri kullanıyoruz
    yOffset: new Animated.Value(0),
    xOffset: new Animated.Value(0),
    opacity: new Animated.Value(Math.random() * 0.4 + 0.2),
    scale: new Animated.Value(1),
    color: Math.random() > 0.7 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(220, 240, 255, 0.4)',
  })));
  
  // fishData'dan gerekli değerleri çıkar
  const hungerLevel = fishData?.hunger_level;
  const lastFeedTime = fishData?.last_feed_time ;
  

  // Baloncuk animasyonlarını başlat
  useEffect(() => {
    // Her baloncuk için animasyonları başlat
    const animations = bubbles.map(bubble => {
      // Başlangıç değerlerini ayarla
      bubble.yOffset.setValue(bubble.yPos);
      bubble.xOffset.setValue(0);
      bubble.scale.setValue(1);
      
      // Y ekseni animasyonu - yukarı doğru hareket (sonsuz loop)
      const yAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(bubble.yOffset, {
            toValue: -bubble.size * 20,
            duration: bubble.speed,
            easing: Easing.linear,
            useNativeDriver: true
          }),
          Animated.timing(bubble.yOffset, {
            toValue: bubble.yPos,
            duration: 0,
            useNativeDriver: true
          })
        ]),
        { iterations: -1 }
      );
      
      // X ekseni animasyonu - hafif sağa sola hareket
      const xAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(bubble.xOffset, {
            toValue: Math.random() * 20 - 10,
            duration: bubble.speed / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(bubble.xOffset, {
            toValue: 0,
            duration: bubble.speed / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          })
        ]),
        { iterations: -1 }
      );
      
      // Ölçek animasyonu - büyüme küçülme
      const scaleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(bubble.scale, {
            toValue: Math.random() * 0.4 + 0.8,
            duration: bubble.speed / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(bubble.scale, {
            toValue: 1,
            duration: bubble.speed / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          })
        ]),
        { iterations: -1 }
      );
      
      // Tüm animasyonları başlat
      yAnimation.start();
      xAnimation.start();
      scaleAnimation.start();
      
      return { yAnimation, xAnimation, scaleAnimation };
    });
    
    // Temizleme fonksiyonu
    return () => {
      animations.forEach(anim => {
        anim.yAnimation.stop();
        anim.xAnimation.stop();
        anim.scaleAnimation.stop();
      });
    };
  }, []);
  
  // Balık yüzmesi için basit animasyon
  useEffect(() => {
    const boundaryWidth = 110; // Sınır mesafesi
    let stopped = false;
    let currentDirection = direction === 1 ? 1 : -1;

    const startAnimation = () => {
      stopped = false;
      fishPositionX.stopAnimation();
      fishRotation.stopAnimation();

      const swim = () => {
        if (stopped) return;

        const nextX = currentDirection === 1 ? boundaryWidth : -boundaryWidth;
        setFishDirection(currentDirection === 1 ? "right" : "left");

        Animated.timing(fishPositionX, {
          toValue: nextX,
          duration: 12000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (!finished || stopped) return;

          currentDirection *= -1;
          Animated.sequence([
            Animated.timing(fishRotation, {
              toValue: 1,
              duration: 350,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(fishRotation, {
              toValue: 0,
              duration: 350,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start(() => swim());
        });
      };

      fishPositionX.setValue(currentDirection === 1 ? -boundaryWidth : boundaryWidth);
      swim();
    };

    const stopAnimation = () => {
      stopped = true;
      fishPositionX.stopAnimation();
      fishRotation.stopAnimation();
    };
    
    // AppState değişimini dinle
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // Uygulama ön plana geldiğinde animasyonu başlat
        startAnimation();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Uygulama arka plana gittiğinde animasyonu durdur
        stopAnimation();
      }
    });
    
    // İlk başlangıçta animasyonu başlat
    startAnimation();
    
    // Temizleme fonksiyonu
    return () => {
      stopAnimation();
      appStateSubscription.remove();
    };
  }, [direction]); // direction değiştiğinde tekrar çalışsın
  
  const animationRef = useRef(null);

  // Baloncuk animasyonlarını yönetmek için AppState'i kullan
  useEffect(() => {
    // Baloncuk animasyonlarını durdur veya başlat
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Uygulama arka plana gittiğinde animasyonları durdur
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      }
    };
    
    // AppState değişimini dinle
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      // Temizleme işlemleri
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      appStateSubscription.remove();
    };
  }, []);
  
  // fishData yoksa boş bir container döndür
  if (!fishData) {
    return <View style={styles.container} />;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.aquariumBox}>        
        {/* Baloncuklar */}
        {bubbles && bubbles.map((bubble, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bubble,
              {
                left: bubble.xPos,
                top: bubble.yPos,
                width: bubble.size,
                height: bubble.size,
                backgroundColor: bubble.color,
              },
              {
                transform: [
                  { translateY: bubble.yOffset },
                  { translateX: bubble.xOffset },
                  { scale: bubble.scale },
                ],
                opacity: bubble.opacity,
              }
            ]}
          />
        ))}
        {/* FishComponent eklenmiş versiyonu - Animated ile */}
        <Animated.View 
          style={[
            styles.fishWrapper,
            {
              transform: [
                { translateX: fishPositionX },
                { translateY: Animated.multiply(fishRotation, 10) },
                { rotate: fishRotation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: ['0deg', fishDirection === "left" ? '20deg' : '-20deg', '0deg']
                  }) },
                // Beslenme sırasında balığın yönünü ayarla
                { scaleX: fishDirection === "right" ? -1 : 1 } // Balığın yönünü ayarla
              ]
            }
          ]}
        >
          <FishComponent
            width={60}
            height={60}
            mouthAnim={mouthAnim}
            isEating={false}
            type={fishType as any}
            hungerLevel={hungerLevel}
            lastFeedTime={lastFeedTime ? new Date(lastFeedTime).getTime() : undefined}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  aquariumBox: {
    width: '100%',
    height: 220,
    backgroundColor: '#87CEFA', // Açık mavi renk (light sky blue)
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#66ccff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
    marginBottom: 15,
  },
  glView: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  fishWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -35 }, { translateY: -35 }],
    zIndex: 10,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 50,
    zIndex: 5,
  }
});
