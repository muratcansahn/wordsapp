import * as React from 'react';
import { useEffect, useRef, useMemo } from 'react';
import Svg, { Path, Circle, Rect, G, TSpan, ClipPath, Defs } from 'react-native-svg';
import { Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'react-native';
import Animated from 'react-native-reanimated';
const AnimatedImage = Animated.createAnimatedComponent(Image);
import { useSharedValue, useAnimatedStyle, withTiming, Easing as ReanimatedEasing } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

interface OnboardingProps {
  width?: number;
  height?: number;
  isActive?: boolean; // Slide aktif mi
}

const Onboarding3: React.FC<OnboardingProps> = ({ width = 300, height = 300, isActive }) => {
  // Balık animasyonu için reanimated shared value
  const screenWidth = Dimensions.get('window').width;
  const fishX = useSharedValue(-screenWidth); // Ekran dışı başla
  const fishStyle = useAnimatedStyle(() => {
    // Dalga için parametreler
    const amplitude = 18; // dalga yüksekliği (px)
    const frequency = 110; // dalga frekansı (ne kadar sık dalga yapsın)
    const translateY = Math.sin(fishX.value / frequency) * amplitude;
    return {
      transform: [
        { translateX: fishX.value },
        { translateY }
      ]
    };
  });

  const { mode } = useTheme();
  const { t } = useTranslation();
  const primaryColor = Colors[mode].primary;
  const secondaryColor = Colors[mode].secondary;
  const backgroundColor = Colors[mode].backgroundSecondary;
  const textColor = Colors[mode].text;
  const blueColor = '#5ac8fa';
  const yellowColor = '#FFD700';
  const accentColor = '#ff7e5f';
  const textFill = mode === 'dark' ? '#fff' : '#333';



  React.useEffect(() => {
    if (isActive) {
      fishX.value = -screenWidth;
      // Bir sonraki frame'de animasyonu başlat
      requestAnimationFrame(() => {
        fishX.value = withTiming(0, {
          duration: 1600,
          easing: ReanimatedEasing.out(ReanimatedEasing.exp)
        });
      });
    } else {
      // Slide pasif olursa balık dışarıda kalsın
      fishX.value = -screenWidth;
    }
  }, [screenWidth, isActive]);



  const screenHeight = Dimensions.get('window').height;
  const styles = useMemo(() => createStyles(mode, screenWidth, screenHeight), [mode, screenWidth, screenHeight]);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Balık görseli */}
          <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
            <AnimatedImage
              source={require('@/assets/images/game-screen-fish.png')}
              style={[{ width: 170, height: 125, resizeMode: 'contain' }, fishStyle]}
            />
          </View>
          {/* Başlık */}
          <Text style={styles.headerText}>{t('onboarding3.header')}</Text>
          {/* Açıklama */}
          <Text style={styles.secondaryFooter}>
            {t('onboarding3.description')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (mode: 'light' | 'dark', screenWidth: number, screenHeight: number) => StyleSheet.create({
  scrollView: { flex: 1, width: '100%' },
  scrollViewContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    width: '100%',
    maxWidth: 390,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#F7A943',
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#4361EE',
    textAlign: 'center',
    marginBottom: 18,
    marginTop: 0,
  },
  secondaryFooter: {
    fontSize: 17,
    color: mode === 'dark' ? '#e4e4e4' : '#3a3a3a',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 0,
    lineHeight: 24,
    fontWeight: '400',
  },
});

export default Onboarding3;
