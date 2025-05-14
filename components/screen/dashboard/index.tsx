import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  Text,
  ActivityIndicator,
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Animated, 
  Easing,
} from 'react-native';
import { Audio } from 'expo-av';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedText } from '@/components/common/typography';
import { ThemedView } from '@/components/common/view';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { PointContainer } from '@/components/common/point-container';
import { useRouter } from 'expo-router';
import Button from '@/components/common/buttons/button';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import {
  BORDER_RADIUS,
  FLEX,
  FONT_SIZE,
  ICON_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { RootState } from '@/store';
import { setReduxUser } from '@/store/userSlice';
import { supabase } from '@/lib/supabase';
import { FishTypes } from '@/assets/svg/fish';
import { FishComponent } from '@/components/fish/FishComponent';
import DailyActivitiesSection from './DailyActivitiesSection';
import { fetchWordStatuses } from '@/services/userService';


import { Aquarium } from './Aquarium';

// Kelime istatistikleri - Redux ile değiştirildi
const getWordStats = (learnedCount: number, unknownCount: number, streakCount: number) => [
  { id: '1', title: 'learned', value: learnedCount.toString(), icon: 'checkmark-circle', color: '#10B981', clickable: true },
  { id: '2', title: 'unknown', value: unknownCount.toString(), icon: 'refresh', color: '#EF4444', clickable: true },
  { id: '4', title: 'streak', value: streakCount.toString(), icon: 'flame', color: '#F97316', clickable: false }
];

interface FishDataInterface {
  id: number;
  type: keyof typeof FishTypes;
  name: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  mouthAnim: Animated.Value;
  mouthScaleAnim: Animated.Value;
  translateX: Animated.AnimatedInterpolation<string | number>;
  scale: {
    scaleX: number;
    scaleY: number;
  };
  animationRef: Animated.Value;
  last_feed_time: number;
  hunger_level: number;
}

type FishDataType = FishDataInterface[];

const createStyles = (mode: 'light' | 'dark') => StyleSheet.create({
  modalTestButton: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  container: {
    flex: FLEX.one,
    backgroundColor: mode === 'dark' ? '#001529' : '#E6F7FF',
  },
  scrollContent: {
    padding: PADDING.md,
    // paddingBottom: PADDING.xl * 2,
    paddingVertical: PADDING.xl ,
  },
  aquariumContainer: {
    height: 250,
    borderRadius: 25,
    overflow: 'hidden',
    marginVertical: MARGIN.lg,
    backgroundColor: mode === 'dark' ? 'rgba(0, 41, 88, 0.8)' : 'rgba(191, 239, 255, 0.8)',
    borderWidth: 2,
    borderColor: mode === 'dark' ? 'rgba(102, 178, 255, 0.3)' : 'rgba(24, 144, 255, 0.3)',
    shadowColor: mode === 'dark' ? '#000' : '#1890FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  aquariumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PADDING.md,
    paddingVertical: PADDING.sm,
    backgroundColor: mode === 'dark' ? 'rgba(0, 29, 66, 0.9)' : 'rgba(173, 216, 230, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: mode === 'dark' ? 'rgba(102, 178, 255, 0.2)' : 'rgba(24, 144, 255, 0.2)',
  },
  aquariumTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: mode === 'dark' ? '#FFFFFF' : '#001529',
  },
  aquariumStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aquariumStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: MARGIN.md,
    backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: PADDING.sm,
    paddingVertical: PADDING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  aquariumStatText: {
    fontSize: FONT_SIZE.sm,
    color: mode === 'dark' ? '#E6F7FF' : '#001529',
    marginLeft: MARGIN.xs,
  },



  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  foodCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a85e5',
    borderRadius: 25,
    padding: 8,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'flex-end', // Sağ tarafa yerleşim
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  foodIconContainer: {
    backgroundColor: '#3a75d5',
    borderRadius: 20,
    padding: 5,
    marginRight: 8,
  },
  foodCountText: {
    color: '#001529',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buyFoodButton: {
    backgroundColor: '#3a75d5',
    borderRadius: 50,
    padding: 3,
  },
  feedFishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7F50', // Turuncu renk
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'flex-start', // Sol tarafa yerleşim
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  feedFishButtonDisabled: {
    backgroundColor: 'rgba(255, 127, 80, 0.5)', // Soluk turuncu
  },
  feedFishButtonIcon: {
    marginRight: 8,
  },
  feedFishButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  wordStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: MARGIN.md,
    flexWrap: 'wrap'
  },
  wordStatCard: {
    width: '31%',
    padding: PADDING.xs,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: MARGIN.xxs,
    marginBottom: MARGIN.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordStatIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MARGIN.xs,
  },
  wordStatContent: {
    flex: 1,
  },
  wordStatHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },


  popupContent: {
    alignItems: 'center',
    paddingVertical: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  fishSelectButton: {
    backgroundColor: 'rgba(74, 133, 229, 0.2)',
    padding: PADDING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: MARGIN.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
  },
  fishPreviewContainer: {
    width: 60,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  successFishPreview: {
    width: 100,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(74, 133, 229, 0.2)',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: MARGIN.md,
  },
  successButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  successButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  feedingContainer: {
    width: 200,
    height: 220,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodItem: {
    position: 'absolute',
    top: 0,
    right: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF8C00',
  },
  feedingPopupContent: {
    alignItems: 'center',
    paddingVertical: 20,
    height: 350,
    width: '100%',
    backgroundColor: 'rgba(173, 216, 230, 0.15)',
    borderRadius: 10,
  },
  feedingBalikContainer: {
    width: 200,
    height: 220,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 120, 215, 0.15)',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  feedingText: {
    fontSize: 16,
    marginTop: 15,
    fontWeight: '500',
    color: '#0066CC',
  },
  feedingSuccessText: {
    fontSize: 16,
    marginTop: 15,
    fontWeight: '500',
    color: '#0066CC',
  },
  hungerIndicatorContainer: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 5,
    overflow: 'hidden',
    alignSelf: 'center', // Balığın üzerinde ortalı olması için
  },
  hungerIndicator: {
    height: '100%',
    backgroundColor: '#4CAF50', // Yeşil renk - dolu olduğunu gösterir
    borderRadius: 2,
  },
  hungerIndicatorPreviewContainer: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'absolute',
    top: 5,
    left: '10%',
    overflow: 'hidden',
    zIndex: 10,
    alignSelf: 'center', // Popup içindeki açlık göstergesinin stilini de akvaryum içindeki balıkların açlık göstergesi ile uyumlu hale getiriyorum.
  },
  hungerIndicatorPreview: {
    height: '100%',
    borderRadius: 2,
  },

  pointContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a85e5',
    borderRadius: 25,
    padding: 8,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'flex-end', // Sağ tarafa yerleşim
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pointIconWrapper: {
    backgroundColor: '#3a75d5',
    borderRadius: 20,
    padding: 5,
    marginRight: 8,
  },
  pointText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginLeft: MARGIN.xs,
  },
  miniPointContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1890FF',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: PADDING.sm,
    paddingVertical: 4,
  },
  miniPointIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniPointText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginLeft: 4,
  },
  dialogMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%',
    paddingHorizontal: PADDING.sm,
  },
  dialogMessageText: {
    fontSize: FONT_SIZE.lg,
    color: mode === 'dark' ? Colors.dark.text : Colors.light.text,
    flexShrink: 1,
    textAlign: 'center',
    marginBottom: MARGIN.xxxl,
  },
  // Modal stilleri (React Native Modal için)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: mode === 'dark' ? '#001529' : '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    backgroundColor: mode === 'dark' ? '#002140' : '#E6F7FF',
    paddingVertical: PADDING.sm,
    paddingHorizontal: PADDING.md,
    borderBottomWidth: 1,
    borderBottomColor: mode === 'dark' ? '#003a8c' : '#91d5ff',
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: mode === 'dark' ? '#FFFFFF' : '#001529',
    textAlign: 'center',
  },
  // Doğrudan ekranda gösterilecek animasyon için stiller
  directAnimationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // En üstte görüntülenmesi için
  },
  directAnimationContainer: {
    width: '80%',
    backgroundColor: mode === 'dark' ? '#001529' : '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  directAnimationHeader: {
    backgroundColor: mode === 'dark' ? '#002140' : '#E6F7FF',
    paddingVertical: PADDING.sm,
    paddingHorizontal: PADDING.md,
    borderBottomWidth: 1,
    borderBottomColor: mode === 'dark' ? '#003a8c' : '#91d5ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  directAnimationTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: mode === 'dark' ? '#FFFFFF' : '#001529',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
});

import { useAuth } from '@/context/SupabaseProvider';

export default function DashboardScreen() {
  const { initialized, isLoading } = useAuth();
  const mode: 'light' = 'light';
  const styles = useMemo(() => createStyles(mode), []);
  const { t } = useTranslation() ;
  const router = useRouter();
  const dispatch = useDispatch();

  // Redux'tan kullanıcı bilgilerini al
  const { id, full_name, point, streak_count, wordStatusUpdateCounter } = useSelector((state: RootState) => state.user);
  // Puan konteynerı için referans
  const pointContainerRef = React.useRef<any>(null);
  const [wordStats, setWordStats] = useState<Array<{
    id: string;
    title: string;
    value: string;
    icon: string;
    color: string;
    clickable: boolean;
  }>>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  // UserWordStatuses tablosundan kelime durumunu çek
  useEffect(() => {
    const getWordStatuses = async () => {
      if (!id) return;
      
      try {
        // userService'den kelime durumlarını çek
        const { knownCount, unknownCount } = await fetchWordStatuses(id);
        // Kelime istatistiklerini güncelle
        setWordStats(getWordStats(knownCount, unknownCount, streak_count));
      } catch (error) {
        console.error('Kelime durumları işlenirken hata:', error);
      }
    };
    
    getWordStatuses();
  }, [id, streak_count, wordStatusUpdateCounter, dispatch]);

  // Animasyon değerler
  
  // Yem animasyonu için değerler
  const [isFeeding, setIsFeeding] = useState(false);
  const [isEating, setIsEating] = useState<boolean | false>(false);
  const [feedingSuccess, setFeedingSuccess] = useState(false);
  const [fishData, setFishData] = useState<FishDataType | null>(null);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [showDirectAnimation, setShowDirectAnimation] = useState(false); // Ekranda doğrudan animasyon göstermek için
  const foodAnimation = useRef(new Animated.Value(0)).current;
  const mouthAnimation = useRef(new Animated.Value(0)).current;

  async function playSound() {
    try {
      // Ensure the path is correct relative to your project structure
      const { sound } = await Audio.Sound.createAsync( require('@/assets/audio/eat.mp3') ); 
      setSound(sound);
      console.log('Playing Sound');
      await sound.playAsync(); 
    } catch (error) {
      console.error('Failed to load or play sound', error);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync(); 
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    const fetchUserFishes = async () => {
      try {
        const { data: userFishes, error } = await supabase
          .from('UserFishes')
          .select('*')
          .eq('user_id', id);
        
        if (error) {
          console.error('Supabase hatası:', error);
          return;
        }
        if (userFishes && userFishes.length > 0) {
          setFishData(userFishes);
        }
      } catch (error) {
        console.error('Balık verilerini getirirken hata:', error);
      } finally {
      }
    };
    
    if (id) {
      fetchUserFishes();
    }
  }, [id]);

  const startFeedingAnimation = () => {
    console.log('Besleme animasyonu başlatılıyor');
    // Yem animasyonunu başlangıç konumuna getir
    foodAnimation.setValue(0);
    mouthAnimation.setValue(0);
    setFeedingSuccess(false);
    
    // Balığın beslenme sırasında ters yöne bakmasını sağla
    if (fishData && fishData.length > 0) {
      // Beslenme sırasında balık ters yöne bakmalı
      // FishComponent içinde isEating durumunda ters yöne bakacak şekilde ayarlandı
      // Bu nedenle burada herhangi bir yön değişikliği yapmamıza gerek yok
    }
    
    // Yem düşme animasyonu
    Animated.sequence([
      // Önce yemi düşür
      Animated.timing(foodAnimation, {
        toValue: 110, // Balığın ağzına kadar olan mesafe
        duration: 1500, // Apple için süreyi artırdım
        useNativeDriver: true,
        easing: Easing.linear
      }),
      // Sonra balığın ağzını aç
      Animated.timing(mouthAnimation, {
        toValue: 1,
        duration: 800, // Apple için süreyi artırdım
        useNativeDriver: false,
        easing: Easing.linear
      })
    ]).start(() => {
      // Ağız açma animasyonu bittikten sonra
      console.log('Besleme animasyonu tamamlandı');
      setFeedingSuccess(true);
      playSound(); // Ses çalma buraya taşındı
      // 2.5 saniye sonra animasyonu kapat
      setTimeout(() => {
        setShowDirectAnimation(false);
        setIsFeeding(false);
        setIsEating(false);
        setFeedingSuccess(false); // Başarı mesajını da kapat
        mouthAnimation.setValue(0); // Balık ağzının animasyonunu sıfırla
      }, 2500);
    });
  };

  useEffect(() => {
    if (showDirectAnimation && isEating) {
      // Doğrudan ekranda animasyon gösteriliyor ve besleme işlemi devam ediyor
      console.log('Doğrudan animasyon gösteriliyor - animasyonu başlatıyorum');
      startFeedingAnimation();
    }
  }, [showDirectAnimation, isEating]);

  // Açlık seviyesine göre renk döndüren yardımcı fonksiyon

  const startFeedingProcess = () => {
    // Besleme işlemini başlat
    setIsFeeding(true);

    // Ekranda doğrudan animasyonu göstermek için state değiştir
    setShowDirectAnimation(true);
    
    // Veritabanı işlemlerini yapalım
    setTimeout(async () => {
      try {
        // Önce mevcut hunger_level'i kontrol et
        const { data: currentFish, error: fetchError } = await supabase
          .from('UserFishes')
          .select('hunger_level')
          .eq('user_id', id)
          .single();

        if (fetchError) {
          console.error("Balık bilgisi alınamadı:", fetchError);
          return;
        }
        
        const newHungerLevel = Math.min(currentFish.hunger_level + 50, 100);

        // Balığı besle
        const { data, error } = await supabase
          .from('UserFishes')
          .update({ hunger_level: newHungerLevel, last_feed_time: new Date().toISOString() })
          .eq('user_id', id)
          .select();
        
        if (error) {
          console.error("Balık besleme hatası:", error);
          return;
        }

        // Point'i azalt
        const { data: userData, error: userError } = await supabase
          .from('Users')
          .update({ point: point - 50 })
          .eq('id', id)
          .select();

        if (userError) {
          console.error("Point güncellenirken hata:", userError);
          return;
        }

        // Redux store'u hemen güncelle
        if (userData && userData[0]) {
          const updatedUser = userData[0];
          dispatch(setReduxUser(updatedUser));
        }

        // Balık verilerini güncelle
        const [fishResponse] = await Promise.all([
          supabase.from('UserFishes').select('*').eq('user_id', id),
        ]);

        if (fishResponse.error) {
          console.error("Güncel balık verisi alınamadı:", fishResponse.error);
          return;
        }

        if (fishResponse.data) {
          setFishData(fishResponse.data);
        }

        // Animasyon başlatmak için isEating'i true yap
        console.log('Veritabanı işlemleri tamamlandı, isEating true yapılıyor');
        setIsEating(true);
        
        // Doğrudan ekranda animasyon gösteriyoruz, popup modal kullanmıyoruz
        // startFeedingAnimation fonksiyonu useEffect ile otomatik çağrılacak

      } catch (err) {
        console.error("Beklenmeyen hata:", err);
      }
    }, 300);
  };
  
  const goToModalTest = () => {
    router.push('/modal-test');
  };

  if (isLoading || !initialized) {
    return null;
  }

  if (fishData === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Button
          onPress={goToModalTest}
          bgColor={Colors.light.primary}
          style={styles.modalTestButton}
        >
          <Text>Modal Test Ekranı</Text>
        </Button>
        {/* Butonlar */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.feedFishButton,
              point <= 0 ? styles.feedFishButtonDisabled : {}
            ]}
            onPress={() => {
              setConfirmDialogVisible(true);
            }}
            disabled={isFeeding || point <= 0}
          >
            <Ionicons
              name="fish-outline"
              size={ICON_SIZE.sm}
              color="#FFFFFF"
              style={styles.feedFishButtonIcon}
            />
            <Text style={styles.feedFishButtonText}>
              {t('dashboard.feedFish') || "Balıkları Besle"}
            </Text>
          </TouchableOpacity>
     
            <PointContainer ref={pointContainerRef} />
       
        </View>
        <Aquarium 
          fishData={fishData[0]}
          isEating={isEating}
        />
        {/* Kelime İstatistikleri */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>{t('dashboard.wordStatus')}</ThemedText>
        </View>
        <View style={styles.wordStatsContainer}>
          {wordStats.map((stat) => (
            <TouchableOpacity 
              key={stat.id} 
              style={[
                styles.wordStatCard, 
                { backgroundColor: Colors[mode].card }
              ]}
              onPress={() => {
                if (stat.clickable) {
                  router.push({
                    pathname: '/word-list',
                    params: { type: stat.title, id: stat.id }
                  });
                }
              }}
              disabled={!stat.clickable}
            >
              <View style={[styles.wordStatIconContainer, { backgroundColor: stat.color + '15' }]}>
                <Ionicons
                  name={stat.icon as keyof typeof Ionicons.glyphMap}
                  size={ICON_SIZE.xs}
                  color={stat.color}
                />
              </View>
              <View style={styles.wordStatContent}>
                <View style={styles.wordStatHeader}>
                  <ThemedText style={styles.wordStatValue}>{stat.value}</ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      {/* Doğrudan ekranda animasyon gösterme */}
      {isEating && (
        <View style={styles.directAnimationOverlay}>
          <View style={styles.directAnimationContainer}>
            <View style={styles.feedingPopupContent}>
              <View style={styles.feedingContainer}>
                <Animated.View
                  style={[
                    styles.foodItem,
                    {
                      transform: [{
                        translateY: foodAnimation
                      }]
                    }
                  ]}
                >
                  <View style={styles.foodDot} />
                </Animated.View>
                <FishComponent 
                  width={120}
                  height={90}
                  mouthAnim={mouthAnimation}
                  isEating={isEating}
                  type={"orange"}
                  direction={"right"}
                />
              </View>
              
              {feedingSuccess && (
                <Text style={styles.feedingSuccessText}>
                  {t('dashboard.fishFeeding.feedingSuccess') || "Başarıyla beslendi!"}
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Özel onay dialog'u */}
      <ConfirmationDialog
        visible={confirmDialogVisible}
        title={point >= 50 ? t('dashboard.fishFeeding.feedTitle') || "Balık Besleme" : t('dashboard.fishFeeding.insufficientPoints') || "Yetersiz Puan"}
        message={point >= 50 
          ? (
            <View style={styles.dialogMessageContainer}>
              <View style={[styles.miniPointContainer, { marginRight: 5 }]}>
                <View style={styles.miniPointIconWrapper}>
                  <Ionicons
                    name="water-outline"
                    size={24}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.miniPointText}>50</Text>
              </View>
              <Text style={styles.dialogMessageText}> {t('dashboard.fishFeeding.confirmMessage') || " karşılığında balığı beslemek istiyor musunuz?"}</Text>
            </View>
          ) 
          : (
            <View style={styles.dialogMessageContainer}>
              <Text style={styles.dialogMessageText}>{t('dashboard.fishFeeding.needPoints') || "Balığı beslemek için en az "}</Text>
              <View style={[styles.miniPointContainer, { marginHorizontal: 3 }]}>
                <View style={styles.miniPointIconWrapper}>
                  <Ionicons
                    name="water-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.miniPointText}>50</Text>
              </View>
              <Text style={styles.dialogMessageText}> {t('dashboard.fishFeeding.pointsRequired') || " puana ihtiyacınız var."}</Text>
            </View>
          )}
        confirmText={point >= 50 ? t('dashboard.fishFeeding.feed') || "Besle" : t('common.ok') || "Tamam"}
        cancelText={point >= 50 ? t('buttons.cancel') || "İptal" : undefined}
        iconColor={point >= 50 ? "#1890FF" : "#EF4444"}
        confirmButtonColor={point >= 50 ? "#1890FF" : undefined}
        isLoading={isFeeding}
        onConfirm={() => {
          if (point >= 50) {
            setConfirmDialogVisible(false);
            startFeedingProcess();
          } else {
            setConfirmDialogVisible(false);
          }
        }}
        onCancel={() => {
          setConfirmDialogVisible(false);
        }}
      />
    
    <DailyActivitiesSection />
    </ScrollView>

    </ThemedView>

  );
}
