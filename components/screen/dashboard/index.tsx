import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  Text,
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Animated, 
  Easing,
  Dimensions,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedText } from '@/components/common/typography';
import { ThemedView } from '@/components/common/view';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Popup } from '@/components/common/Popup';
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
import { RootState } from '@/store';
import { updateUserStats, setReduxUser } from '@/store/userSlice';
import { supabase } from '@/lib/supabase';
import { FishTypes } from '@/assets/svg/fish';
import DailyActivitiesSection from './DailyActivitiesSection';
import { fetchWordStatuses } from '@/services/userService';
import { FishComponent } from '@/components/fish/FishComponent';
import { getHungerColor } from './utils';

// Kelime istatistikleri - Redux ile değiştirildi
const getWordStats = (learnedCount: number, unknownCount: number, streakCount: number) => [
  { id: '1', title: 'learned', value: learnedCount.toString(), icon: 'checkmark-circle', color: '#10B981', progress: 65 },
  { id: '2', title: 'unknown', value: unknownCount.toString(), icon: 'refresh', color: '#EF4444', progress: 20 },
  { id: '4', title: 'streak', value: streakCount.toString(), icon: 'flame', color: '#F97316', progress: 70 }
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
  container: {
    flex: FLEX.one,
    backgroundColor: mode === 'dark' ? '#001529' : '#E6F7FF',
  },
  scrollContent: {
    padding: PADDING.md,
    paddingBottom: PADDING.xl * 2,
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
  bubble: {
    position: 'absolute',
    borderRadius: 50,
    zIndex: 1,
  },
  waterReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    opacity: 0.08,
    transform: [{ scaleY: -1 }],
  },
  plantDecoration: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 120,
    opacity: 0.4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: MARGIN.md,
    padding: PADDING.sm,
    backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    padding: PADDING.sm,
    minWidth: 80,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: mode === 'dark' ? Colors.light.text : Colors.dark.text,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    marginTop: 4,
  },
  feedButton: {
    position: 'absolute',
    right: MARGIN.lg,
    bottom: MARGIN.lg,
    backgroundColor: mode === 'dark' ? '#1890FF' : '#40A9FF',
    padding: PADDING.md,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  feedButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
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
    color: '#FFFFFF',
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
  fishContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
    marginTop: MARGIN.md,
  },
  balıkText: {
    color: 'white',
    fontSize: 16,
    position: 'absolute',
  },
});

export default function DashboardScreen() {
  const { mode } = useTheme();
  const styles = useMemo(() => createStyles(mode), [mode]);
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();

  
  // Redux'tan kullanıcı bilgilerini al
  const { id, full_name, point, known_words, unknown_words, streak_count } = useSelector((state: RootState) => state.user);
  const [wordStats, setWordStats] = useState<Array<{
    id: string;
    title: string;
    value: string;
    icon: string;
    color: string;
    progress: number;
  }>>([]);
  
  // UserWordStatuses tablosundan kelime durumunu çek
  useEffect(() => {
    const getWordStatuses = async () => {
      if (!id) return;
      
      try {
        // userService'den kelime durumlarını çek
        const { knownCount, unknownCount } = await fetchWordStatuses(id);
        console.log('Kelime durumları:', { knownCount, unknownCount });
        
        // Kelime istatistiklerini güncelle
        setWordStats(getWordStats(knownCount, unknownCount, streak_count));
      } catch (error) {
        console.error('Kelime durumları işlenirken hata:', error);
      }
    };
    
    getWordStatuses();
  }, [id, streak_count, dispatch]);

  // Animasyon değerler
  
  // Yem animasyonu için değerler
  const [isFeeding, setIsFeeding] = useState(false);
  const [isEating, setIsEating] = useState<boolean | false>(false);
  const [feedPopupVisible, setFeedPopupVisible] = useState(false);
  const [feedingPopupVisible, setFeedingPopupVisible] = useState(false);
  const [feedingSuccess, setFeedingSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fishData, setFishData] = useState<FishDataType>([]);
  const foodAnimation = useRef(new Animated.Value(0)).current;
  const mouthAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUserFishes = async () => {
      try {
        setIsLoading(true); // Yükleme başlıyor
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
        setIsLoading(false); // Yükleme bitti (başarılı veya başarısız olsa da)
      }
    };
    
    if (id) {
      fetchUserFishes();
    }
  }, [id]);

  const startFeedingAnimation = () => {
    // Yem animasyonunu başlangıç konumuna getir
    foodAnimation.setValue(0);
    mouthAnimation.setValue(0);
    setFeedingSuccess(false);
    
    // Yem düşme animasyonu
    Animated.sequence([
      // Önce yemi düşür
      Animated.timing(foodAnimation, {
        toValue: 110, // Balığın ağzına kadar olan mesafe
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.linear
      }),
      // Sonra balığın ağzını aç
      Animated.timing(mouthAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
        easing: Easing.linear
      })
    ]).start(() => {
      // Ağız açma animasyonu bittikten sonra
      setFeedingSuccess(true);
      // 1.5 saniye sonra popup'ı kapat
      setTimeout(() => {
        setFeedingPopupVisible(false);
        setIsFeeding(false);
        setIsEating(false);
      }, 1500);
    });
  };

  useEffect(() => {
    if (feedingPopupVisible) {
      startFeedingAnimation();
    }
  }, [feedingPopupVisible]);

  // Açlık seviyesine göre renk döndüren yardımcı fonksiyon

  // Baloncuklar için animasyon değerleri
  const bubbles = useRef([...Array(15)].map(() => ({
    xPos: Math.random() * Dimensions.get('window').width * 0.8,
    yPos: Math.random() * 300,
    size: Math.random() * 12 + 3,
    speed: Math.random() * 2000 + 1500,
    xOffset: new Animated.Value(0),
    yOffset: new Animated.Value(0),
    opacity: new Animated.Value(Math.random() * 0.4 + 0.2),
    scale: new Animated.Value(1),
    rotation: new Animated.Value(0),
    color: Math.random() > 0.7 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(220, 240, 255, 0.4)',
  }))).current;

  const bubbleAnimations = useRef<Animated.CompositeAnimation[]>(bubbles.map(bubble => {
    return Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(bubble.yOffset, {
            toValue: -bubble.size * 20,
            duration: bubble.speed,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(bubble.yOffset, {
            toValue: bubble.yPos,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(bubble.xOffset, {
            toValue: Math.random() * 20 - 10,
            duration: bubble.speed / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bubble.xOffset, {
            toValue: 0,
            duration: bubble.speed / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(bubble.scale, {
            toValue: Math.random() * 0.4 + 0.8,
            duration: bubble.speed / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bubble.scale, {
            toValue: 1,
            duration: bubble.speed / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
  }));

  useEffect(() => {
    bubbleAnimations.current.forEach(animation => animation.start());
    return () => {
      bubbleAnimations.current.forEach(animation => animation.stop());
    };
  }, []);

  const renderBubbles = () => {
    return bubbles.map((bubble, index) => (
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
            transform: [
              { translateY: bubble.yOffset },
              { translateX: bubble.xOffset },
              { scale: bubble.scale },
            ],
            opacity: bubble.opacity,
          },
        ]}
      />
    ));
  };

  const renderFish = () => {
    return fishData.map((fish, index) => {
      const direction =  "left";
      const mouthAnim = new Animated.Value(0);
                
      return (
        <View
          key={`fish-${index}`}
          style={[
            {
              position: 'absolute',
              top: 130,
              left: 30,
            }
          ]}
        >
          <FishComponent
            width={70}
            height={70}
            mouthAnim={fish.mouthAnim}
            direction={direction}
            isEating={false}
            type={"orange"}
            hungerLevel={fish.hunger_level}
            lastFeedTime={fish.last_feed_time}
          />
        </View>
      );
    });
  };

  const startFeedingProcess = () => {
    setFeedingPopupVisible(true);
    const FeedUserFish = async () => {
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
          .update({ point: point - 1 })
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

      } catch (err) {
        console.error("Beklenmeyen hata:", err);
      }
    };
  
    FeedUserFish();
  };
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Butonlar */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.feedFishButton,
              point <= 0 ? styles.feedFishButtonDisabled : {}
            ]}
            onPress={startFeedingProcess}
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
          <TouchableOpacity 
            style={styles.foodCountContainer}
            onPress={()=>{}}
          >
            <View style={styles.foodIconContainer}>
              <Ionicons
                name="water-outline"
                size={ICON_SIZE.sm}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.foodCountText}>{point}</Text>
            <TouchableOpacity 
              style={styles.buyFoodButton}
              onPress={()=>{}}
            >
              <Ionicons
                name="add"
                size={ICON_SIZE.xs}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

 
        
        {/* Akvaryum */}
        <View style={styles.aquariumContainer}>
          <LinearGradient
            colors={mode === 'dark' 
              ? ['rgba(0, 41, 88, 0.9)', 'rgba(0, 10, 50, 0.95)']
              : ['rgba(191, 239, 255, 0.9)', 'rgba(100, 181, 246, 0.95)']}
            style={StyleSheet.absoluteFill}
          />
       
          <View style={styles.waterReflection}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
          </View>
          {renderBubbles()}
          {renderFish()}
          <View style={styles.plantDecoration}>
            <LinearGradient
              colors={['transparent', mode === 'dark' ? 'rgba(0, 100, 0, 0.2)' : 'rgba(0, 150, 0, 0.15)']}
              style={StyleSheet.absoluteFill}
            />
          </View>
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
              onPress={() => router.push({
                pathname: '/word-list',
                params: { type: stat.title, id: stat.id }
              })}
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


      {/* Balık seçme popup'ı */}
      <Popup
        visible={feedPopupVisible}
        onClose={() => setFeedPopupVisible(false)}
        position="center"
        title="Hangi Balığı Beslemek İstersiniz?"
      >
        <View style={styles.popupContent}>
          {fishData && fishData.map((fish) => {
            // Balık türüne göre SVG bileşenini al
            const hungerColor = getHungerColor(fish.hunger_level);
            
            return (
              <TouchableOpacity
                key={fish.id}
                style={styles.fishSelectButton}
                onPress={() => {}}
              >
                <View style={styles.fishPreviewContainer}>
                  <View style={styles.hungerIndicatorPreviewContainer}>
                    <View 
                      style={[
                        styles.hungerIndicatorPreview, 
                        { width: fish.hunger_level, backgroundColor: hungerColor }
                      ]} 
                    />
                  </View>
                  <FishComponent 
                    width={40}
                    height={30}
                    mouthAnim={fish.mouthAnim}
                    direction={"right"}
                    isEating={false}
                    type={fish.type}
                    hungerLevel={fish.hunger_level}
                    lastFeedTime={fish.last_feed_time}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
   
      </Popup>
      
      {/* Besleme animasyonu popup'ı */}
      <Popup
        visible={feedingPopupVisible}
        onClose={() => {
          setFeedingPopupVisible(false);
          setIsFeeding(false);
          setIsEating(false);
        }}
        position="center"
        title="Balık Besleniyor"
      >
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
              direction={"left"}
              isEating={isEating}
              type={"orange"}
              
            />
          </View>
        
          {feedingSuccess && (
            <Text style={styles.feedingSuccessText}>
              Balık başarıyla beslendi!
            </Text>
          )}
        </View>
      </Popup>
    
    <DailyActivitiesSection />
    </ScrollView>

    </ThemedView>

  );
}
