import * as React from 'react';
import { useMemo, useEffect } from 'react';
import { Text, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import OnboardingCard from '@/components/common/onboarding/onboarding-card';
import { Animated, Easing } from 'react-native';

interface OnboardingProps {
  width?: number;
  height?: number;
  isActive?: boolean; // Slide aktif mi
}

const Onboarding3: React.FC<OnboardingProps> = ({ width = 300, height = 300, isActive }) => {
  const screenWidth = Dimensions.get('window').width;
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
  
  // Balık animasyonu için klasik Animated API kullanılıyor
  const fishAnim = React.useRef(new Animated.Value(0)).current;
  const fishStartX = -1.3 * screenWidth;

  useEffect(() => {
    if (isActive) {
      // Önce balığı ekran dışına koy (aynı anda başlat)
      fishAnim.setValue(fishStartX);
      // Animasyonu başlat (herhangi bir gecikme olmadan)
      Animated.timing(fishAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }).start();
    } else {
      // Slide aktif değilse balığı tekrar dışarı al
      fishAnim.setValue(fishStartX);
    }
  }, [isActive, screenWidth]);

  // Dalga efekti için Y pozisyonu
  const waveAmplitude = 10;
  const waveFrequency = 100;
  const fishY = fishAnim.interpolate({
    inputRange: [fishStartX, 0],
    outputRange: [0, Math.sin(0 / waveFrequency) * waveAmplitude],
  });

  // Animated.Image style
  const fishAnimatedStyle = {
    transform: [
      { translateX: fishAnim },
      { translateY: fishY },
    ],
  };

  const screenHeight = Dimensions.get('window').height;
  const styles = useMemo(() => createStyles(mode, screenWidth, screenHeight), [mode, screenWidth, screenHeight]);

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <OnboardingCard
          headerText={t('onboarding3.header')}
          descriptionText={t('onboarding3.description')}
          borderColor="#F7A943"
        >
          {/* Balık animasyonu */}
          <View style={{ width: 180, height: 130, alignItems: 'center', justifyContent: 'center', marginBottom: 32, overflow: 'hidden', position: 'relative' }}>
            <Animated.Image
              source={require('@/assets/images/game-screen-fish.png')}
              style={[
                {
                  width: 170,
                  height: 125,
                  resizeMode: 'contain',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                },
                fishAnimatedStyle
              ]}
            />
          </View>
        </OnboardingCard>
      </View>
    </View>
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
});

export default Onboarding3;
