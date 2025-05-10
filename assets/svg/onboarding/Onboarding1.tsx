import * as React from 'react';
import { useEffect, useRef, useMemo } from 'react';
import Svg, { Path, Circle, Rect, G, TSpan, ClipPath, Defs } from 'react-native-svg';
import { Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { Animated, Easing, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'react-native';
import Button from '@/components/common/buttons/button';
import { useTranslation } from 'react-i18next';


interface OnboardingProps {
  width?: number;
  height?: number;
}

const Onboarding1: React.FC<OnboardingProps> = ({ width = 300, height = 300 }) => {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const primaryColor = Colors[mode].primary;
  const secondaryColor = Colors[mode].secondary;
  const backgroundColor = Colors[mode].backgroundSecondary;
  const textColor = Colors[mode].text;
  const yellowColor = '#FFD700';
  const orangeColor = '#F7A943'; // writing.tsx turuncu tonu
  const errorColor = '#FF5252';  // writing.tsx kırmızı tonu
  const accentColor = '#ff7e5f';
  const textFill = mode === 'dark' ? '#fff' : '#333';
  
  // Animasyon değerleri
  const flashcardsAnim = useRef(new Animated.Value(0)).current;
  const quizAnim = useRef(new Animated.Value(0)).current;
  const wordMatchingAnim = useRef(new Animated.Value(0)).current;
  const writingAnim = useRef(new Animated.Value(0)).current;
  
  // İkon renkleri - writing.tsx uyumlu
  const iconColors = {
    flashcards: primaryColor, // mavi
    quiz: yellowColor, // sarı
    wordMatching: orangeColor, // turuncu
    writing: errorColor // kırmızı
  };

  // Animasyonu başlat
  useEffect(() => {
    // Animasyon fonksiyonu
    const startAnimation = () => {
      // Tüm animasyonlar için hafif zıplama efekti
      const createBounceAnimation = (animValue: Animated.Value) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 1000,
              easing: Easing.out(Easing.bounce),
              useNativeDriver: true
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 1000,
              easing: Easing.in(Easing.bounce),
              useNativeDriver: true
            })
          ])
        );
      };
      
      // Her ikon için farklı zamanlarda başlayan animasyonlar
      createBounceAnimation(flashcardsAnim).start();
      
      setTimeout(() => {
        createBounceAnimation(quizAnim).start();
      }, 300);
      
      setTimeout(() => {
        createBounceAnimation(wordMatchingAnim).start();
      }, 600);
      
      setTimeout(() => {
        createBounceAnimation(writingAnim).start();
      }, 900);
    };
    
    startAnimation();
    
    return () => {
      // Temizleme işlemi
      flashcardsAnim.stopAnimation();
      quizAnim.stopAnimation();
      wordMatchingAnim.stopAnimation();
      writingAnim.stopAnimation();
    };
  }, []);
  
  // İkonların Y pozisyonlarını hesapla - hafif bir zıplama hareketi için
  const flashcardsY = flashcardsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10] // Sadece 10 birim yukarı hareket - hafif zıplama
  });
  
  const quizY = quizAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10]
  });
  
  const wordMatchingY = wordMatchingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10]
  });
  
  const writingY = writingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10]
  });
  
  // SVG içinde doğrudan icon kullanamadığımız için, bir View içinde render edip
  // SVG içinde yer tutucular kullanacağız
  
  // Ekran boyutlarını al
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  // Stilleri bileşen içinde tanımlayalım
  const styles = useMemo(() => createStyles(mode, screenWidth, screenHeight), [mode, screenWidth, screenHeight]);

  return (
  <ScrollView
    style={styles.scrollView}
    contentContainerStyle={styles.scrollViewContent}
    showsVerticalScrollIndicator={false}
  >
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Balık Görseli */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 18, marginBottom: 32 }}>
  <Animated.View style={{ transform: [{ translateY: flashcardsY }] }}>
    <LinearGradient
      colors={["#5ac8fa", "#a7c7ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#b2e0f7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Ionicons name="help-circle-outline" size={screenWidth < 350 ? 22 : 26} color="#fff" />
    </LinearGradient>
  </Animated.View>
  <Animated.View style={{ transform: [{ translateY: quizY }] }}>
    <LinearGradient
      colors={["#34e89e", "#6be585"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#c1f7dc',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Ionicons name="shuffle-outline" size={screenWidth < 350 ? 22 : 26} color="#fff" />
    </LinearGradient>
  </Animated.View>
  <Animated.View style={{ transform: [{ translateY: wordMatchingY }] }}>
    <LinearGradient
      colors={["#b388ff", "#e0c3fc"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#e3d7fb',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <MaterialCommunityIcons name="format-list-checks" size={screenWidth < 350 ? 22 : 26} color="#fff" />
    </LinearGradient>
  </Animated.View>
  <Animated.View style={{ transform: [{ translateY: writingY }] }}>
    <LinearGradient
      colors={["#ffb86b", "#ffd6a5"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ffe2c6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <MaterialCommunityIcons name="cards" size={screenWidth < 350 ? 22 : 26} color="#fff" />
    </LinearGradient>
  </Animated.View>
</View>
        {/* Başlık */}
        <Text style={styles.headerText}>{t('onboarding1.header')}</Text>
        {/* Açıklama */}
        <Text style={styles.secondaryFooter}>
          {t('onboarding1.description')}
        </Text>
   
      </View>
    </View>
  </ScrollView>
);
};

// SVG içinde Animated.View kullanabilmek için özel bir bileşen tanımlıyoruz
const AnimatedG = Animated.createAnimatedComponent(G);

// Stil oluşturma fonksiyonu
const createStyles = (mode: 'light' | 'dark', screenWidth: number, screenHeight: number) => StyleSheet.create({
  scrollView: { 
    flex: 1, 
    width: '100%' 
  },
  scrollViewContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    zIndex: 1,
    minHeight: screenHeight * 0.85,
    width: '100%'
  },
  card: {
    backgroundColor: '#FFFFFF', // Kart arka planı beyaz
    borderRadius: 20,
    width: '100%',
    maxWidth: Math.min(400, screenWidth - 32),
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#F7A943', // Turuncu kenarlık
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerText: {
    fontSize: screenWidth < 350 ? 20 : 22,
    fontWeight: '700',
    color: '#4361EE', // Başlık mavi
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: screenWidth < 350 ? 28 : 32
  },
  headerTextYellow: {
    fontSize: screenWidth < 350 ? 20 : 24,
    fontWeight: '700',
    color: '#FFDE59', // Sarı başlık
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: screenWidth < 350 ? 28 : 32
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    textDecorationColor: '#FF5252',
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFDE59', // Sarı daire
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F7A943', // Turuncu çerçeve
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  primaryFooter: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F7A943', // Turuncu vurgu
    marginBottom: 8,
  },
  secondaryFooter: {
    fontSize: 16,
    color: '#6B3E26', // Açıklama koyu kahverengi
    opacity: 0.85,
  },
  moduleIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: screenWidth < 350 ? 12 : 18,
    marginTop: 16,
    flexWrap: screenWidth < 320 ? 'wrap' : 'nowrap'
  },
});

export default Onboarding1;
