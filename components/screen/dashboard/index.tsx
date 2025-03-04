import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Image, Text } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import { ThemedView } from '@/components/common/view';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import {
  BORDER_RADIUS,
  FLEX,
  FONT_SIZE,
  ICON_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';

// Günlük içerik için oluşturulacak veriler
const dailyContent = [
  {
    id: '1',
    title: 'Günlük Çalışma',
    description: 'Bugün için belirlenen yeni kelimeleri öğren',
    progress: 75,
    icon: 'calendar',
    gradient: ['#FF9A9E', '#FAD0C4'],
    action: 'learn',
  },
  {
    id: '2',
    title: 'Tekrar Zamanı',
    description: 'Öğrendiğiniz kelimeleri pekiştirin',
    progress: 40,
    icon: 'sync',
    gradient: ['#A18CD1', '#FBC2EB'],
    action: 'exercises',
  },
];

// Kelime istatistikleri
const wordStats = [
  { id: '1', title: 'learned', value: '143', icon: 'checkmark-circle', color: '#10B981' },
  { id: '2', title: 'known', value: '98', icon: 'star', color: '#F59E0B' },
  { id: '3', title: 'unknown', value: '45', icon: 'refresh', color: '#EF4444' },
  { id: '4', title: 'streak', value: '7', icon: 'flame', color: '#F97316' }
];

export default function DashboardScreen() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Akvaryum Animasyonu */}
        <View style={styles.aquariumContainer}>
          <LottieView
            source={require('@/assets/lottie/aquarium.json')}
            autoPlay
            loop
            style={styles.aquariumAnimation}
          />
        </View>

        {/* Karşılama Başlığı */}
        <View style={styles.welcomeSection}>
          <ThemedText style={styles.welcomeText}>{t('dashboard.welcome')}</ThemedText>
          <ThemedText style={styles.welcomeSubtext}>{t('dashboard.welcomeSubtext')}</ThemedText>
        </View>

        {/* Kelime İstatistikleri */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>{t('dashboard.wordStatus')}</ThemedText>
        </View>
        
        <View style={styles.wordStatsContainer}>
          {wordStats.map((stat) => (
            <TouchableOpacity 
              key={stat.id} 
              style={[styles.wordStatCard, { backgroundColor: Colors[mode].card }]}
              onPress={() => router.push('/learn')}
            >
              <View style={[styles.wordStatIconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons
                  name={stat.icon as keyof typeof Ionicons.glyphMap}
                  size={ICON_SIZE.sm}
                  color={stat.color}
                />
              </View>
              <ThemedText style={styles.wordStatValue}>{stat.value}</ThemedText>
              <ThemedText style={styles.wordStatTitle}>{t(`dashboard.${stat.title}`)}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Günlük İçerikler */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>{t('dashboard.dailyActivities')}</ThemedText>
        </View>

        {dailyContent.map((item) => (
          <TouchableOpacity 
            key={item.id}
            style={styles.dailyCard}
            onPress={() => router.push(`/${item.action}`)}
          >
            <LinearGradient
              colors={item.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dailyCardGradient}
            >
              <View style={styles.dailyCardContent}>
                <View style={styles.dailyCardInfo}>
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={ICON_SIZE.md}
                    color="#FFFFFF"
                    style={styles.dailyCardIcon}
                  />
                  <View>
                    <Text style={styles.dailyCardTitle}>{item.title}</Text>
                    <Text style={styles.dailyCardDescription}>{item.description}</Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressTrack}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${item.progress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{item.progress}%</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Tavsiye Edilen Kurslar */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>{t('dashboard.recommended')}</ThemedText>
        </View>

        <View style={styles.recommendedContainer}>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendedScroll}
          >
            {[1, 2, 3].map((item) => (
              <TouchableOpacity 
                key={item}
                style={[styles.recommendedCard, { backgroundColor: Colors[mode].card }]}
              >
                <View style={styles.recommendedImageContainer}>
                  <View style={styles.recommendedImage} />
                </View>
                <View style={styles.recommendedContent}>
                  <ThemedText style={styles.recommendedTitle}>
                    {item === 1 ? 'İş İngilizcesi' : item === 2 ? 'Seyahat Terimleri' : 'Günlük Konuşma'}
                  </ThemedText>
                  <ThemedText style={styles.recommendedDescription}>
                    {item === 1 ? '45 kelime ile işle ilgili terimler' : 
                     item === 2 ? '30 kelime ile seyahat edin' : 
                     '25 günlük konuşma için kelime'}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
  },
  scrollContent: {
    padding: PADDING.md,
    paddingBottom: PADDING.xl * 2,
  },
  aquariumContainer: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: MARGIN.lg,
  },
  aquariumAnimation: {
    width: '100%',
    height: '100%',
  },
  welcomeSection: {
    marginBottom: MARGIN.lg,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: MARGIN.xs,
  },
  welcomeSubtext: {
    fontSize: 16,
    opacity: 0.7,
  },
  wordStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: MARGIN.md,
    flexWrap: 'wrap'
  },
  wordStatCard: {
    width: '23%',
    padding: PADDING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginHorizontal: MARGIN.xxs,
    marginBottom: MARGIN.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  wordStatIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: MARGIN.sm,
  },
  wordStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: MARGIN.xxs,
  },
  wordStatTitle: {
    fontSize: 10,
    opacity: 0.7,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MARGIN.md,
    marginTop: MARGIN.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dailyCard: {
    marginBottom: MARGIN.md,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dailyCardGradient: {
    borderRadius: BORDER_RADIUS.md,
  },
  dailyCardContent: {
    padding: PADDING.md,
  },
  dailyCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MARGIN.md,
  },
  dailyCardIcon: {
    marginRight: MARGIN.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    padding: PADDING.sm,
  },
  dailyCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: MARGIN.xs,
  },
  dailyCardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginRight: MARGIN.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  recommendedContainer: {
    marginBottom: MARGIN.lg,
  },
  recommendedScroll: {
    paddingRight: PADDING.md,
  },
  recommendedCard: {
    width: 250,
    borderRadius: BORDER_RADIUS.md,
    marginRight: MARGIN.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  recommendedImageContainer: {
    height: 120,
    backgroundColor: '#F3F4F6',
  },
  recommendedImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  recommendedContent: {
    padding: PADDING.md,
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: MARGIN.xs,
  },
  recommendedDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
});
