import React, { FC, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing, Text } from 'react-native';
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, withDelay, Easing as ReanimatedEasing } from 'react-native-reanimated';
import { FishComponent } from '@/components/fish/FishComponent';

interface AquariumProps {
  fishType?: string;
  direction?: number;
  hungerLevel?: number;
  lastFeedTime?: string;
  fishData?: any;
}

export const Aquarium: FC<AquariumProps> = ({ 
  fishData,
  fishType = 'orange', 
  direction = 1, // 1: sağa, -1: sola
  // hungerLevel = fishData.hunger_level,
}) => {
  // fishData yoksa veya yüklenmemişse render etme
  if (!fishData) {
    return null;
  }
  // Balık animasyonu için Animated değerleri
  const [mouthAnim] = useState(new Animated.Value(0));
  const fishPositionX = useRef(new Animated.Value(0)).current;
  const fishRotation = useRef(new Animated.Value(0)).current;
  const [fishDirection, setFishDirection] = useState<"right" | "left">(direction === 1 ? "right" : "left"); // Başlangıç yönünü direction prop'una göre ayarla
  const [isTurning, setIsTurning] = useState(false);
  // fishData'nın içeriğini kontrol et
  
  // fishData'dan gerekli değerleri çıkar
  const hungerLevel = fishData?.hunger_level || 50;
  const lastFeedTime = fishData?.last_feed_time || new Date().toISOString();
  
  // Baloncuklar için Reanimated animasyon değerleri
  const bubbles = useRef([...Array(15)].map(() => ({
    xPos: Math.random() * 320 * 0.8,
    yPos: Math.random() * 200,
    size: Math.random() * 12 + 3,
    speed: Math.random() * 2000 + 1500,
    // Reanimated shared values kullanıyoruz
    yOffset: useSharedValue(0),
    xOffset: useSharedValue(0),
    opacity: useSharedValue(Math.random() * 0.4 + 0.2),
    scale: useSharedValue(1),
    color: Math.random() > 0.7 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(220, 240, 255, 0.4)',
  }))).current;

  // Baloncuk animasyonlarını başlat
  useEffect(() => {
    // Her baloncuk için animasyonları başlat
    bubbles.forEach(bubble => {
      // Y ekseni animasyonu - yukarı doğru hareket
      bubble.yOffset.value = bubble.yPos;
      bubble.yOffset.value = withRepeat(
        withSequence(
          withTiming(-bubble.size * 20, { 
            duration: bubble.speed, 
            easing: ReanimatedEasing.linear 
          }),
          withTiming(bubble.yPos, { duration: 0 })
        ),
        -1, // sonsuz tekrar
        false // reverse yok
      );
      
      // X ekseni animasyonu - hafif sağa sola hareket
      bubble.xOffset.value = withRepeat(
        withSequence(
          withTiming(Math.random() * 20 - 10, { 
            duration: bubble.speed / 2, 
            easing: ReanimatedEasing.inOut(ReanimatedEasing.sin) 
          }),
          withTiming(0, { 
            duration: bubble.speed / 2, 
            easing: ReanimatedEasing.inOut(ReanimatedEasing.sin) 
          })
        ),
        -1, // sonsuz tekrar
        true // reverse
      );
      
      // Ölçek animasyonu - büyüme küçülme
      bubble.scale.value = withRepeat(
        withSequence(
          withTiming(Math.random() * 0.4 + 0.8, { 
            duration: bubble.speed / 2, 
            easing: ReanimatedEasing.inOut(ReanimatedEasing.sin) 
          }),
          withTiming(1, { 
            duration: bubble.speed / 2, 
            easing: ReanimatedEasing.inOut(ReanimatedEasing.sin) 
          })
        ),
        -1, // sonsuz tekrar
        true // reverse
      );
    });
    
    // Cleanup fonksiyonu - Reanimated'da genellikle gerekli değil
    return () => {
      // Gerekirse burada temizleme işlemleri yapılabilir
    };
  }, []);
  
  // Balık yüzmesi için basit animasyon
  useEffect(() => {
    // Sınırlar - akvaryumun sınırları
    const boundaryWidth = 110; // Sınır mesafesi
    
    // Hız değeri - çok daha yavaş hareket için düşük bir değer
    const speed = 0.3; // Çok daha yavaş hareket
    
    // X pozisyonu - başlangıç pozisyonu direction prop'una göre ayarla
    let xPosition = direction === 1 ? -boundaryWidth : boundaryWidth;
    let xVelocity = direction === 1 ? speed : -speed; // Başlangıç yönü direction prop'una göre ayarla
    let isFacingRight = direction === 1;
    
    // Başlangıç pozisyonunu ayarla
    fishPositionX.setValue(xPosition);
    
    // Sabit framerate ile animasyon (setInterval kullanıyoruz)
    const animationInterval = setInterval(() => {
      // Pozisyonu güncelle
      xPosition += xVelocity;
      
      // Sınırları kontrol et
      if (xPosition >= boundaryWidth) {
        // Sağ kenara çarptı - sola dön
        xVelocity = -speed;
        xPosition = boundaryWidth; // Sınırda tut
        
        if (isFacingRight && !isTurning) {
          // Dönüş animasyonu başlat
          setIsTurning(true);
          
          // Önce hafifçe geri geri git, sonra dön
          Animated.sequence([
            // Hafifçe geri çekil
            Animated.timing(fishPositionX, {
              toValue: boundaryWidth - 15,
              duration: 300,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true
            }),
            // Dönüş sırasında hafifçe aşağı yukarı hareket
            Animated.timing(fishRotation, {
              toValue: 1,
              duration: 400,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: true
            })
          ]).start(() => {
            // Dönüş tamamlandı
            setFishDirection("left");
            isFacingRight = false;
            setIsTurning(false);
            fishRotation.setValue(0);
          });
        }
      } else if (xPosition <= -boundaryWidth) {
        // Sol kenara çarptı - sağa dön
        xVelocity = speed;
        xPosition = -boundaryWidth; // Sınırda tut
        
        if (!isFacingRight && !isTurning) {
          // Dönüş animasyonu başlat
          setIsTurning(true);
          
          // Önce hafifçe geri geri git, sonra dön
          Animated.sequence([
            // Hafifçe geri çekil
            Animated.timing(fishPositionX, {
              toValue: -boundaryWidth + 15,
              duration: 300,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true
            }),
            // Dönüş sırasında hafifçe aşağı yukarı hareket
            Animated.timing(fishRotation, {
              toValue: 1,
              duration: 400,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: true
            })
          ]).start(() => {
            // Dönüş tamamlandı
            setFishDirection("right");
            isFacingRight = true;
            setIsTurning(false);
            fishRotation.setValue(0);
          });
        }
      }
      
      // Hareket halindeyse ve dönüş yapmıyorsa pozisyonu güncelle
      if (!isTurning) {
        fishPositionX.setValue(xPosition);
      }
      
    }, 1000/60); // 60 FPS
    
    // Temizleme fonksiyonu
    return () => {
      clearInterval(animationInterval);
    };
  }, [direction]); // direction değiştiğinde tekrar çalışsın
  
  const animationRef = useRef(null);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Baloncukları render et - Reanimated kullanarak
  const renderBubbles = () => {
    return bubbles.map((bubble, index) => {
      // Her baloncuk için animasyon stilini tanımla
      const animatedStyle = useAnimatedStyle(() => {
        return {
          transform: [
            { translateY: bubble.yOffset.value },
            { translateX: bubble.xOffset.value },
            { scale: bubble.scale.value },
          ],
          opacity: bubble.opacity.value,
        };
      });
      
      return (
        <Reanimated.View
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
            animatedStyle,
          ]}
        />
      );
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.aquariumBox}>        
        {/* Baloncuklar */}
        {renderBubbles()}
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
    width: 340,
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