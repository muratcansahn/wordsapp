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
import { useTranslation } from 'react-i18next';
import OnboardingCard from '@/components/common/onboarding/onboarding-card';

interface OnboardingProps {
  width?: number;
  height?: number;
  isActive?: boolean;
}

const Onboarding2: React.FC<OnboardingProps> = ({ width = 300, height = 300 }) => {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const primaryColor = Colors[mode].primary;
  const secondaryColor = Colors[mode].secondary;
  const backgroundColor = Colors[mode].backgroundSecondary;
  const textColor = Colors[mode].text;
  const greenColor = '#34e89e';
  const purpleColor = '#b388ff';
  const accentColor = '#ff7e5f';
  const textFill = mode === 'dark' ? '#fff' : '#333';

  // Animasyon değerleri (Onboarding1 ile uyumlu şekilde)
  const trophyAnim = useRef(new Animated.Value(0)).current;
  const starAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Onboarding1'deki gibi animasyon başlat
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
    createBounceAnimation(trophyAnim).start();
    setTimeout(() => {
      createBounceAnimation(starAnim).start();
    }, 350);
    return () => {
      trophyAnim.stopAnimation();
      starAnim.stopAnimation();
    };
  }, []);

  // Animated değerleri ile translateY hesapla
  const trophyY = trophyAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10]
  });
  const starY = starAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10]
  });

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const styles = useMemo(() => createStyles(mode, screenWidth, screenHeight), [mode, screenWidth, screenHeight]);

  return (
    <View style={styles.container}>
      <OnboardingCard
        headerText={t('onboarding2.header')}
        descriptionText={t('onboarding2.description')}
        borderColor="#F7A943"
      >
        {/* Özellik ikonları ve açıklamaları */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 22, marginBottom: 8 }}>
          {/* Listeye ekle */}
          <View style={{ alignItems: 'center', width: 98 }}>
            <Animated.View style={{ transform: [{ translateY: trophyY }] }}>
              <LinearGradient
                colors={[accentColor, '#ffd194']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 6
                }}
              >
                <Ionicons name="book-outline" size={26} color="#fff" />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.featureText}>{t('onboarding2.feature1')}</Text>
          </View>
          {/* Tekrar et */}
          <View style={{ alignItems: 'center', width: 98 }}>
            <Animated.View style={{ transform: [{ translateY: starY }] }}>
              <LinearGradient
                colors={[purpleColor, '#e0c3fc']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  marginBottom: 6,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="refresh-circle-outline" size={26} color="#fff" />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.featureText}>{t('onboarding2.feature2')}</Text>
          </View>
        </View>
      </OnboardingCard>
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTextYellow: {
    fontSize: screenWidth < 350 ? 20 : 24,
    fontWeight: '700',
    color: '#FFDE59', // Sarı başlık
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: screenWidth < 350 ? 28 : 32
  },
  featureText: {
    fontSize: screenWidth < 350 ? 12 : 13,
    color: mode === 'dark' ? '#fff' : '#333',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
    lineHeight: 18,
  },
});

export default Onboarding2;
