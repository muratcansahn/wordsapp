import React, { forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Animated, { 
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
  withTiming,
  withDelay
} from 'react-native-reanimated';

const CONFETTI_COLORS = [
  '#FFD700', // Altın
  '#FF6B6B', // Kırmızı
  '#4CD964', // Yeşil
  '#5AC8FA', // Mavi
  '#FF9500', // Turuncu
  '#AF52DE', // Mor
  '#FF2D55', // Pembe
  '#FFFFFF', // Beyaz
];

interface PointContainerProps {
  onPointAnimation?: () => void;
}

type PointContainerRef = {
  animatePoint: () => void;
};

const PointContainer = forwardRef<PointContainerRef, PointContainerProps>((props, ref) => {
  const { onPointAnimation } = props;
  const userPoint = useSelector((state: RootState) => state.user.point);
  
  // Animasyon değerleri
  const pointScale = useSharedValue(1);
  const pointOpacity = useSharedValue(1);
  const pointRotate = useSharedValue(0);
  const pointColor = useSharedValue(0);
  
  // Konfeti animasyonu için değerler — sabit 8 parçacık olduğundan hook'lar
  // .map() içinde değil, kurallara uygun şekilde açık açık (unroll) çağrılıyor.
  const confettiOpacity = [
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
  ];
  const confettiTranslateX = [
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
  ];
  const confettiTranslateY = [
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
  ];
  const confettiRotate = [
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
  ];
  const confettiScale = [
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
  ];

  const pointAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pointScale.value },
      { rotate: `${pointRotate.value}deg` }
    ],
    opacity: pointOpacity.value,
    backgroundColor: pointColor.value === 0 ? 'transparent' : 
      `rgba(255, 215, 0, ${pointColor.value * 0.5})`,
    borderRadius: 15,
    paddingHorizontal: 8,
    overflow: 'hidden',
  }));
  
  // Metin rengi için animasyon stili
  const pointTextColorStyle = useAnimatedStyle(() => ({
    color: pointColor.value === 0 ? '#FFFFFF' : 
      `rgba(255, 215, 0, ${0.5 + pointColor.value * 0.5})`,
  }));
  
  // Konfeti animasyon stilleri — sabit 8 parçacık olduğundan useAnimatedStyle
  // .map() içinde değil, her index için ayrı ayrı (unroll) çağrılıyor.
  const confettiStyle0 = useAnimatedStyle(() => ({
    position: 'absolute', width: 8, height: 8, borderRadius: 0 % 2 === 0 ? 4 : 0,
    backgroundColor: CONFETTI_COLORS[0], opacity: confettiOpacity[0].value,
    transform: [
      { translateX: confettiTranslateX[0].value },
      { translateY: confettiTranslateY[0].value },
      { rotate: `${confettiRotate[0].value}deg` },
      { scale: confettiScale[0].value },
    ],
  }));
  const confettiStyle1 = useAnimatedStyle(() => ({
    position: 'absolute', width: 8, height: 8, borderRadius: 1 % 2 === 0 ? 4 : 0,
    backgroundColor: CONFETTI_COLORS[1], opacity: confettiOpacity[1].value,
    transform: [
      { translateX: confettiTranslateX[1].value },
      { translateY: confettiTranslateY[1].value },
      { rotate: `${confettiRotate[1].value}deg` },
      { scale: confettiScale[1].value },
    ],
  }));
  const confettiStyle2 = useAnimatedStyle(() => ({
    position: 'absolute', width: 8, height: 8, borderRadius: 2 % 2 === 0 ? 4 : 0,
    backgroundColor: CONFETTI_COLORS[2], opacity: confettiOpacity[2].value,
    transform: [
      { translateX: confettiTranslateX[2].value },
      { translateY: confettiTranslateY[2].value },
      { rotate: `${confettiRotate[2].value}deg` },
      { scale: confettiScale[2].value },
    ],
  }));
  const confettiStyle3 = useAnimatedStyle(() => ({
    position: 'absolute', width: 8, height: 8, borderRadius: 3 % 2 === 0 ? 4 : 0,
    backgroundColor: CONFETTI_COLORS[3], opacity: confettiOpacity[3].value,
    transform: [
      { translateX: confettiTranslateX[3].value },
      { translateY: confettiTranslateY[3].value },
      { rotate: `${confettiRotate[3].value}deg` },
      { scale: confettiScale[3].value },
    ],
  }));
  const confettiStyle4 = useAnimatedStyle(() => ({
    position: 'absolute', width: 8, height: 8, borderRadius: 4 % 2 === 0 ? 4 : 0,
    backgroundColor: CONFETTI_COLORS[4], opacity: confettiOpacity[4].value,
    transform: [
      { translateX: confettiTranslateX[4].value },
      { translateY: confettiTranslateY[4].value },
      { rotate: `${confettiRotate[4].value}deg` },
      { scale: confettiScale[4].value },
    ],
  }));
  const confettiStyle5 = useAnimatedStyle(() => ({
    position: 'absolute', width: 8, height: 8, borderRadius: 5 % 2 === 0 ? 4 : 0,
    backgroundColor: CONFETTI_COLORS[5], opacity: confettiOpacity[5].value,
    transform: [
      { translateX: confettiTranslateX[5].value },
      { translateY: confettiTranslateY[5].value },
      { rotate: `${confettiRotate[5].value}deg` },
      { scale: confettiScale[5].value },
    ],
  }));
  const confettiStyle6 = useAnimatedStyle(() => ({
    position: 'absolute', width: 8, height: 8, borderRadius: 6 % 2 === 0 ? 4 : 0,
    backgroundColor: CONFETTI_COLORS[6], opacity: confettiOpacity[6].value,
    transform: [
      { translateX: confettiTranslateX[6].value },
      { translateY: confettiTranslateY[6].value },
      { rotate: `${confettiRotate[6].value}deg` },
      { scale: confettiScale[6].value },
    ],
  }));
  const confettiStyle7 = useAnimatedStyle(() => ({
    position: 'absolute', width: 8, height: 8, borderRadius: 7 % 2 === 0 ? 4 : 0,
    backgroundColor: CONFETTI_COLORS[7], opacity: confettiOpacity[7].value,
    transform: [
      { translateX: confettiTranslateX[7].value },
      { translateY: confettiTranslateY[7].value },
      { rotate: `${confettiRotate[7].value}deg` },
      { scale: confettiScale[7].value },
    ],
  }));
  const confettiAnimatedStyles = [
    confettiStyle0, confettiStyle1, confettiStyle2, confettiStyle3,
    confettiStyle4, confettiStyle5, confettiStyle6, confettiStyle7,
  ];

  const animatePoint = () => {
    // Patlamalı ölçeklendirme animasyonu
    pointScale.value = withSequence(
      withTiming(0.8, { duration: 100 }), // Önce küçülme
      withTiming(1.8, { duration: 300 }), // Sonra hızlıca büyüme
      withSpring(1.2, { damping: 4, stiffness: 80 }), // Yaylı geri dönüş
      withSpring(1, { damping: 10, stiffness: 100 }) // Normal boyuta dönüş
    );
    
    // Opaklık animasyonu
    pointOpacity.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(1, { duration: 200 })
    );
    
    // Hafif dönme animasyonu
    pointRotate.value = withSequence(
      withTiming(-5, { duration: 100 }),
      withTiming(5, { duration: 200 }),
      withTiming(0, { duration: 150 })
    );
    
    // Renk parlaması animasyonu
    pointColor.value = withSequence(
      withTiming(1, { duration: 200 }),  // Tam parlama
      withTiming(0.7, { duration: 100 }), // Hafif azalma
      withTiming(0.9, { duration: 150 }), // Tekrar parlama
      withTiming(0, { duration: 350 })    // Yavaşça sönme
    );
    
    // Konfeti animasyonu
    confettiOpacity.forEach((opacity, index) => {
      // Rastgele yönlerde hareket eden konfetiler
      const angle = (index * 45) + Math.random() * 30 - 15; // 8 yönde, biraz rastgele sapma ile
      const distance = 30 + Math.random() * 40; // 30-70 birim arası mesafe
      
      // Rastgele hız ve süre
      const duration = 600 + Math.random() * 400;
      const delay = Math.random() * 100;
      
      // Konfeti görünürlüğü
      opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 50 }),
          withTiming(1, { duration: duration * 0.7 }),
          withTiming(0, { duration: duration * 0.3 })
        )
      );
      
      // Konfeti hareketi
      const radians = (angle * Math.PI) / 180;
      confettiTranslateX[index].value = withDelay(
        delay,
        withTiming(Math.cos(radians) * distance, { duration })
      );
      
      confettiTranslateY[index].value = withDelay(
        delay,
        withTiming(Math.sin(radians) * distance, { duration })
      );
      
      // Konfeti dönüşü
      confettiRotate[index].value = withDelay(
        delay,
        withTiming(Math.random() * 360 * (index % 2 ? 1 : -1), { duration })
      );
      
      // Konfeti boyutu
      confettiScale[index].value = withDelay(
        delay,
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(0.8 + Math.random() * 0.5, { duration: 100 }),
          withTiming(0.2 + Math.random() * 0.3, { duration: duration - 100 })
        )
      );
    });
    
    // Eğer dışarıdan bir animasyon fonksiyonu verilmişse çağır
    if (onPointAnimation) {
      onPointAnimation();
    }
  };

  // Bileşen dışına animasyon fonksiyonunu açığa çıkar
  useImperativeHandle(ref, () => ({
    animatePoint
  }));

  return (
    <View style={styles.pointContainer}>
      {/* Konfeti parçacıkları */}
      {confettiAnimatedStyles.map((style, index) => (
        <Animated.View key={`confetti-${index}`} style={style} />
      ))}
      
      <View style={styles.pointIconWrapper}>
        <Icon
          name="water"
          size={22}
          color="#FFFFFF"
        />
      </View>
      <Animated.Text style={[styles.pointText, pointAnimatedStyle, pointTextColorStyle]}>
        {userPoint}
      </Animated.Text>
    </View>
  );
});

const styles = StyleSheet.create({
  pointContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1890FF',
    borderRadius: 20,
    padding: 8,
    paddingHorizontal: 12,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  pointIconWrapper: {
    backgroundColor: '#1890FF',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  pointText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default PointContainer;
