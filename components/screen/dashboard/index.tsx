import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  Text,
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Image,
  FlatList,
  Animated, 
  Easing,
  Dimensions,
  Platform
} from 'react-native';
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
import { FishTypes } from '../../../assets/svg/fish';

// Günlük içerik için oluşturulacak veriler
const dailyContent = [
  {
    id: '1',
    title: 'Günlük Çalışma',
    description: 'Bugün için belirlenen yeni kelimeleri öğren',
    progress: 75,
    icon: 'calendar',
    gradient: ['#FF9A9E', '#FAD0C4'] as readonly [string, string],
    action: 'learn',
  },
  {
    id: '2',
    title: 'Tekrar Zamanı',
    description: 'Öğrendiğiniz kelimeleri pekiştirin',
    progress: 40,
    icon: 'sync',
    gradient: ['#A18CD1', '#FBC2EB'] as readonly [string, string],
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

interface FishInfo {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  mouthAnim: Animated.Value;
  mouthScaleAnim: Animated.Value;
  translateX: Animated.AnimatedInterpolation<number>;
  translateY: Animated.AnimatedInterpolation<number>;
  scale: {
    scaleX: number;
    scaleY: number;
  };
  scaleZ: Animated.AnimatedInterpolation<number>;
  zPosition: number;
  pathIndex: number;
  pathDirection: number;
  hungerLevel: number; // 0-100 arası, 0: aç, 100: tok
  lastFedTime: number; // son beslenme zamanı (timestamp)
}

interface FishDataType {
  [key: string]: FishInfo;
}

interface Food {
  id: string;
  anim: Animated.Value;
  x: number;
  active: boolean;
  fishType: string;
}

export default function DashboardScreen() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  // Animasyon değerleri
  const fishTopAnim = useRef(new Animated.Value(0)).current;
  const fishBottomAnim = useRef(new Animated.Value(0)).current;
  const fishMouthAnim = useRef(new Animated.Value(0)).current;
  const fish2MouthAnim = useRef(new Animated.Value(0)).current;

  // Yeni 3D animasyon değerleri
  const fish1XAnim = useRef(new Animated.Value(0)).current;
  const fish1YAnim = useRef(new Animated.Value(0)).current;
  const fish1ZAnim = useRef(new Animated.Value(1)).current; // Z değeri ölçekleme için (derinlik)
  
  const fish2XAnim = useRef(new Animated.Value(0)).current;
  const fish2YAnim = useRef(new Animated.Value(0)).current;
  const fish2ZAnim = useRef(new Animated.Value(0.8)).current; // Z değeri ölçekleme için (derinlik)

  // Kabarcık animasyonları için değerler
  const bubble1Anim = useRef(new Animated.Value(0)).current;
  const bubble2Anim = useRef(new Animated.Value(0)).current;
  const bubble3Anim = useRef(new Animated.Value(0)).current;

  // Yem animasyonu için değerler
  const [isFeeding, setIsFeeding] = useState(false);
  const [isEating, setIsEating] = useState<string | false>(false);
  const [feedPopupVisible, setFeedPopupVisible] = useState(false);
  const [feedingPopupVisible, setFeedingPopupVisible] = useState(false);
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [selectedFish, setSelectedFish] = useState<string | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [feedingSuccess, setFeedingSuccess] = useState(false); // Besleme başarısı state'i
  const [foodCount, setFoodCount] = useState(5); // Balık yemi miktarı
  
  // Balık bilgileri - merkezileştirilmiş veri modeli
  const [fishData, setFishData] = useState<FishDataType>({
    orange: {
      id: 'orange',
      name: 'Turuncu Balık',
      position: { x: 40, y: 40, width: 30, height: 20 }, 
      mouthAnim: fishMouthAnim,
      mouthScaleAnim: useRef(new Animated.Value(1)).current,
      translateX: fish1XAnim, // Yeni X animasyonu
      translateY: fish1YAnim, // Yeni Y animasyonu
      scale: {
        scaleX: -1, // Sola doğru bakan balık
        scaleY: 1,
      },
      scaleZ: fish1ZAnim, // Z ölçekleme değeri (derinlik efekti için)
      zPosition: 1, // Balığın z pozisyonu (ön plan=1, arka plan=0)
      pathIndex: 0, // Şu anki yüzme yolu indeksi
      pathDirection: 1, // Yüzme yönü (1=ileri, -1=geri)
      hungerLevel: 60, // Orta derece tok
      lastFedTime: Date.now()
    },
    blue: {
      id: 'blue',
      name: 'Mavi Balık',
      position: { x: 265, y: 60, width: 30, height: 20 }, 
      mouthAnim: fish2MouthAnim,
      mouthScaleAnim: useRef(new Animated.Value(1)).current,
      translateX: fish2XAnim, // Yeni X animasyonu
      translateY: fish2YAnim, // Yeni Y animasyonu
      scale: {
        scaleX: 1, // Sağa doğru bakan balık
        scaleY: 1,
      },
      scaleZ: fish2ZAnim, // Z ölçekleme değeri (derinlik efekti için)
      zPosition: 0.8, // Balığın z pozisyonu (ön plan=1, arka plan=0)
      pathIndex: 1, // Farklı bir yüzme yolu
      pathDirection: 1, // Yüzme yönü
      hungerLevel: 30, // Biraz aç
      lastFedTime: Date.now() - 3600000 // 1 saat önce beslenmiş
    }
    // Gelecekte yeni balıklar buraya eklenebilir
  });

  // Balıkların izleyeceği yolları tanımla - daha doğal görünümlü yüzme için Bezier eğrileri
  // Not: Akvaryum yüksekliği 180 olduğundan, y değerleri 20-150 arasında tutulacak
  const fishPaths = [
    // 1. yol - organik dalgalı bir yüzme yolu - akvaryumun üst kısmında
    [
      { x: 30, y: 40 },   // Başlangıç noktası
      { x: 120, y: 30 },  // Kontrol noktası
      { x: 200, y: 50 },  // Kontrol noktası
      { x: 250, y: 40 }   // Bitiş noktası
    ],
    // 2. yol - farklı bir dalgalı yüzme yolu - akvaryumun orta kısmında
    [
      { x: 250, y: 60 },  // Başlangıç noktası
      { x: 180, y: 80 },  // Kontrol noktası
      { x: 120, y: 60 },  // Kontrol noktası
      { x: 40, y: 70 }    // Bitiş noktası
    ],
    // 3. yol - akvaryumun üst-orta kısmında
    [
      { x: 40, y: 50 },   // Başlangıç noktası
      { x: 100, y: 90 },  // Kontrol noktası
      { x: 200, y: 60 },  // Kontrol noktası
      { x: 280, y: 80 }   // Bitiş noktası
    ],
    // 4. yol - akvaryumun orta-alt kısmında (ama en alta değil)
    [
      { x: 280, y: 90 },  // Başlangıç noktası
      { x: 180, y: 100 }, // Kontrol noktası
      { x: 100, y: 120 }, // Kontrol noktası
      { x: 30, y: 100 }   // Bitiş noktası
    ],
    // Daha fazla yol eklenebilir...
  ];

  // Bezier eğrisi üzerindeki belirli bir noktayı hesaplayan yardımcı fonksiyon
  const bezierPoint = (path: Array<{x: number, y: number}>, t: number) => {
    // 4 noktalı Bezier eğrisi için cubik hesaplama
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    
    // Bezier formülü
    let point = { x: 0, y: 0 };
    point.x = uuu * path[0].x + 3 * uu * t * path[1].x + 3 * u * tt * path[2].x + ttt * path[3].x;
    point.y = uuu * path[0].y + 3 * uu * t * path[1].y + 3 * u * tt * path[2].y + ttt * path[3].y;
    
    return point;
  };

  // 3D balık animasyonlarını başlat
  const startFishAnimations = () => {
    // Tüm balıklar için
    Object.keys(fishData).forEach((fishId) => {
      animateFishAlongPath(fishId);
    });
  };
  
  // Balığı belirli bir yol boyunca hareket ettiren fonksiyon
  const animateFishAlongPath = (fishId: string) => {
    const fish = fishData[fishId];
    if (!fish) return;
    
    const pathIndex = fish.pathIndex % fishPaths.length;
    const path = fishPaths[pathIndex];
    
    // İleri veya geri yönde hareket edip etmeyeceğini belirle
    const isForward = fish.pathDirection === 1;
    
    // Yolun uzunluğunu belirle (daha doğru hesaplama için daha fazla nokta kullanılabilir)
    const numPoints = 100;
    const points = [];
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      points.push(bezierPoint(path, isForward ? t : 1 - t));
    }
    
    // Balık için animasyon sekansı oluştur
    const animSequence = points.map((point, i) => {
      // X ve Y için animasyonlar
      const xAnim = Animated.timing(fish.translateX, {
        toValue: point.x,
        duration: 50, // Hızlı ve pürüzsüz hareket için
        useNativeDriver: true,
      });
      
      const yAnim = Animated.timing(fish.translateY, {
        toValue: point.y,
        duration: 50,
        useNativeDriver: true,
      });
      
      // Z için hafif dalgalanma efekti (derinlik hissi)
      const zScale = fish.zPosition + (Math.sin(i / 10) * 0.05);
      const zAnim = Animated.timing(fish.scaleZ, {
        toValue: zScale,
        duration: 50,
        useNativeDriver: true,
      });
      
      // Yön kontrolü (sadece ilk animasyonda)
      if (i === 1) {
        const prevPoint = points[0];
        const xDiff = point.x - prevPoint.x;
        
        if (xDiff !== 0) {
          setFishData(prevData => ({
            ...prevData,
            [fishId]: {
              ...prevData[fishId],
              scale: {
                scaleX: xDiff > 0 ? 1 : -1,
                scaleY: 1,
              }
            }
          }));
        }
      }
      
      return Animated.parallel([xAnim, yAnim, zAnim]);
    });
    
    // Tüm animasyonları sırayla çalıştır
    Animated.sequence(animSequence).start(() => {
      // Animasyon tamamlandığında, rastgele bir yol seç ve yönü değiştir
      setFishData(prevData => {
        // Yeni yol seç - mevcut yoldan farklı olsun
        let newPathIndex;
        do {
          newPathIndex = Math.floor(Math.random() * fishPaths.length);
        } while (newPathIndex === prevData[fishId].pathIndex);
        
        // Yeni yön belirle - %50 ihtimalle yön değişsin
        const newDirection = Math.random() > 0.5 ? 
                            prevData[fishId].pathDirection : 
                            prevData[fishId].pathDirection * -1;
        
        return {
          ...prevData,
          [fishId]: {
            ...prevData[fishId],
            pathDirection: newDirection,
            pathIndex: newPathIndex
          }
        };
      });
      
      // Yeni yol ve yönle tekrar başlat
      setTimeout(() => animateFishAlongPath(fishId), 100);
    });
  };

  // Kabarcık animasyonu
  const animateBubble = (anim: Animated.Value, duration: number): void => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  };

  // Açlık seviyesine göre renk belirleme
  const getHungerColor = (hungerLevel: number) => {
    if (hungerLevel <= 30) return '#FF5252'; // Kırmızı - aç
    if (hungerLevel <= 70) return '#FFC107'; // Sarı - orta
    return '#4CAF50'; // Yeşil - tok
  };

  // Balık besleme işlemini başlat
  const startFeedingProcess = () => {
    if (foodCount <= 0) {
      // Yem bitti durumunda kullanıcıya bildirim göster
      // Burada bir alert veya popup gösterilebilir
      return;
    }
    
    setFeedPopupVisible(true);
    setIsFeeding(false); // Başlangıçta false olarak ayarla
    setFeedingSuccess(false); // Başlangıçta başarı mesajını sıfırla
  };
  
  // Belirli bir balığı besle
  const feedFish = (fishType: string) => {
    if (isFeeding || foodCount <= 0) return; // Zaten besleme yapılıyorsa işlemi engelle
    
    const fishInfo = fishData[fishType];
    if (!fishInfo) return;
    
    // Yem miktarını azalt
    setFoodCount(prev => Math.max(0, prev - 1));
    
    setSelectedFish(fishType);
    setFeedPopupVisible(false); // Seçim popup'ını kapat
    setFeedingPopupVisible(true); // Besleme popup'ını göster
    
    // Yemin ilk konumu - her zaman balığın üzerinde başlasın
    const screenWidth = Dimensions.get('window').width;
    const foodX = screenWidth / 2; // Ekranın tam ortası
    
    // Yeni yem animasyonu oluştur
    const newFoodAnim = new Animated.Value(0);
    
    // Yeni yemi ekle
    setFoods([{
      id: Date.now().toString(),
      anim: newFoodAnim,
      x: foodX,
      active: true,
      fishType
    }]);
    
    // Besleme durumunu başlat
    setIsFeeding(true);
  };

  // Balık ağız animasyonu tamamlandığında açlık seviyesini güncelle
  useEffect(() => {
    if (feedingSuccess && selectedFish) {
      // Balığın açlık seviyesini güncelle
      setFishData(prevData => {
        const updatedData = { ...prevData };
        if (updatedData[selectedFish]) {
          updatedData[selectedFish] = {
            ...updatedData[selectedFish],
            hungerLevel: 100, // Tamamen tok
            lastFedTime: Date.now() // Besleme zamanını güncelle
          };
        }
        return updatedData;
      });
    }
  }, [feedingSuccess, selectedFish]);

  // Balıkların açlık seviyesini zamanla azalt
  useEffect(() => {
    // 30 saniyede bir balıkların açlık seviyesini kontrol et ve azalt
    const hungerInterval = setInterval(() => {
      setFishData(prevData => {
        const updatedData = { ...prevData };
        const currentTime = Date.now();
        
        // Tüm balıkların açlık seviyesini kontrol et
        Object.keys(updatedData).forEach(fishId => {
          const fish = updatedData[fishId];
          const timeSinceLastFed = currentTime - fish.lastFedTime;
          
          // Her 1 saatte 10 açlık seviyesi düşsün
          const hoursPassed = timeSinceLastFed / (1000 * 60 * 60);
          const hungerDecrease = Math.floor(hoursPassed * 10);
          
          // Açlık seviyesini güncelle, 0'ın altına düşmesin
          updatedData[fishId] = {
            ...fish,
            hungerLevel: Math.max(0, fish.hungerLevel - hungerDecrease)
          };
        });
        
        return updatedData;
      });
    }, 30000); // Her 30 saniyede bir çalış
    
    return () => clearInterval(hungerInterval);
  }, []);

  // Turuncu balığı render et
  const renderOrangeFish = () => {
    const fishInfo = fishData.orange;
    
    const isEatingThisFish = isEating === 'orange';
    
    // Açlık seviyesine göre renk belirleme
    const hungerColor = getHungerColor(fishInfo.hungerLevel);
    
    return (
      <View style={{ position: 'absolute', top: fishInfo.position.y, left: fishInfo.position.x }}>
        <Animated.View style={getFishStyle('orange')}>
          {/* Açlık göstergesi */}
          <View style={styles.hungerIndicatorContainer}>
            <View style={[
              styles.hungerIndicator,
              { width: `${fishInfo.hungerLevel}%`, backgroundColor: hungerColor }
            ]} />
          </View>
          
          <FishTypes.orange 
            width={70}
            height={70}
            mouthAnim={fishInfo.mouthAnim}
            direction="right"
            isEating={isEatingThisFish}
          />
        </Animated.View>
      </View>
    );
  };

  // Mavi balığı render et
  const renderBlueFish = () => {
    const fishInfo = fishData.blue;
    
    const isEatingThisFish = isEating === 'blue';
    
    // Açlık seviyesine göre renk belirleme
    const hungerColor = getHungerColor(fishInfo.hungerLevel);
    
    return (
      <View style={{ position: 'absolute', top: fishInfo.position.y, left: fishInfo.position.x }}>
        <Animated.View style={getFishStyle('blue')}>
          {/* Açlık göstergesi */}
          <View style={styles.hungerIndicatorContainer}>
            <View style={[
              styles.hungerIndicator,
              { width: `${fishInfo.hungerLevel}%`, backgroundColor: hungerColor }
            ]} />
          </View>
          
          <FishTypes.blue 
            width={30}
            height={20}
            mouthAnim={fishInfo.mouthAnim}
            direction="right"
            isEating={isEatingThisFish}
          />
        </Animated.View>
      </View>
    );
  };

  // Balık tipine göre ölçekleme ve dönüşleri uygula - 3D derinlik efekti ile
  const getFishStyle = (fishType: string) => {
    const fishInfo = fishData[fishType];
    if (!fishInfo) return {};
    
    return {
      transform: [
        { translateX: fishInfo.translateX },
        { translateY: fishInfo.translateY },
        { scale: fishInfo.scaleZ }, // Z-derinliği için ölçekleme
        { scaleX: fishInfo.scale.scaleX },
        { scaleY: fishInfo.scale.scaleY }
      ],
      opacity: fishInfo.zPosition // Arka plandaki balıklar biraz daha saydamlaşsın
    };
  };

  // Balıkla çakışma kontrolü - daha hassas ve geliştirilmiş
  const detectCollision = (foodX: number, foodY: number, fishType: string): boolean => {
    const fishInfo = fishData[fishType];
    if (!fishInfo) return false;
    
    const fishPos = fishInfo.position;
    
    // Balığın gerçek konumu (scale ve transform göz önüne alınarak)
    let fishX: number;
    let fishWidth: number;
    
    if (fishInfo.scale.scaleX < 0) { // Sola bakan balık (orange)
      fishX = fishPos.x;
      fishWidth = fishPos.width;
    } else { // Sağa bakan balık (blue)
      fishX = 300 - fishPos.x - fishPos.width; // Ekranın sağ tarafından hesapla
      fishWidth = fishPos.width;
    }
    
    // Y ekseni kontrolü - algılama alanı genişletildi
    const inBoundsY = (foodY >= fishPos.y - 25 && foodY <= fishPos.y + 15);
    
    // X ekseni kontrolü - algılama alanı genişletildi
    const inBoundsX = (Math.abs(foodX - (fishX + fishWidth / 2)) <= 20);
      
    return inBoundsX && inBoundsY;
  };

  // Balık besleme başarı popup'ını kapat
  const closeFeedingSuccess = () => {
    setSuccessPopupVisible(false);
    setSelectedFish(null);
  };

  // Yem takip ve çakışma tespiti
  useEffect(() => {
    if (!isFeeding || foods.length === 0 || !selectedFish) return;
    
    const food = foods[0];
    const fishInfo = fishData[food.fishType];
    
    if (!fishInfo) return;

    // Ekran boyutlarını al
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    // Popup içindeki balık pozisyonu - ekran boyutuna göre ayarla
    const popupFishPos = { 
      x: screenWidth * 0.5, // Ekranın ortası
      y: screenHeight * 0.45, // Ekranın ortasına yakın
      width: 50, 
      height: 30 
    };
    
    // Yem animasyonunu başlat
    food.anim.setValue(0); // 0 değeri başlangıç pozisyonu
    
    // Yemin düşme animasyonu
    Animated.timing(food.anim, {
      toValue: 0.25, // 1 değeri bitiş pozisyonu
      duration: 1000, // Düşme süresi
      useNativeDriver: true,
      easing: Easing.linear, // Lineer düşme efekti
    }).start(({ finished }) => {
      if (finished) {
        // Animasyon tamamlandığında balığın yem yediğini belirt
        setIsEating(selectedFish);
        
        // Balığın ağız animasyonunu başlat
        const fishInfo = fishData[selectedFish];
        if (fishInfo) {
          // Sadece ağız hareketi animasyonu
          Animated.sequence([
            // İlk önce ağzı aç
            Animated.timing(fishInfo.mouthAnim, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease)
            }),
            // Sonra ağzı kapat
            Animated.timing(fishInfo.mouthAnim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease)
            })
          ]).start(() => {
            // Animasyonlar tamamlandığında
            setIsFeeding(false);
            
            // Yem yeme işlemi tamamlandı, başarılı mesajı göster
            setFeedingSuccess(true);
            
            // Yem listesini temizle
            setFoods([]);
          });
        }
      }
    });
    
    // Artık dinleyiciye gerek kalmadı, çünkü animasyon tamamlandığında otomatik olarak işleme alınacak
    return () => {
      // Temizleme kodu
    };
  }, [isFeeding, foods, selectedFish, fishData]);

  // Popup içinde yem animasyonunu render et
  const renderPopupFeedAnimation = () => {
    if (!isFeeding || !selectedFish) return null;
    
    // Ekran boyutları
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    
    return (
      <View style={{ 
        position: 'absolute', 
        width: '100%', 
        height: '100%', 
        alignItems: 'center', 
        justifyContent: 'center',
        pointerEvents: 'none' // Arka plandan dokunuşları geçirmek için
      }}>
        {foods.map((food, index) => {
          // Yem'in balığın ağzına düşme animasyonu
          const translateY = food.anim.interpolate({
            inputRange: [0, 0.35],
            outputRange: [-screenHeight * 0.25, 0] // Üstten başlayıp balığın ağzına düşecek
          });
          
          // Düşerken sabit pozisyonda kal, kaymayı kaldır
          const translateX = food.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0] // Sabit pozisyon, sağa kayma yok
          });
          
          const opacity = food.anim.interpolate({
            inputRange: [0, 0.7, 0.9, 1],
            outputRange: [1, 1, 0.5, 0] // Balık yemi yerken kademeli kaybolma
          });
          
          const scale = food.anim.interpolate({
            inputRange: [0, 0.7, 1],
            outputRange: [1, 0.8, 0.3] // Daha belirgin küçülme efekti
          });
          
          // Balığın yönüne göre ağzının pozisyonunu hesapla
          const fishInfo = fishData[selectedFish];
          const fishDirection = fishInfo?.scale?.scaleX > 0 ? 'right' : 'left';
          
          // Ağız pozisyonu için hesaplama - ekran genişliğine göre oranla
          const mouthOffset = screenWidth * 0.05; // Ekran genişliğinin %5'i kadar offset
          const mouthPosition = fishDirection === 'right' ? mouthOffset : -mouthOffset;
          
          return (
            <Animated.View 
              key={index}
              style={{
                position: 'absolute',
                transform: [
                  { translateY },
                  { translateX },
                  { scale }
                ],
                opacity,
                width: 15,
                height: 15,
                backgroundColor: '#FFA07A', // Yem rengi
                borderRadius: 7.5,
                left: food.x, // foodX değerini kullan
                top: screenHeight * 0.45, // Ekran yüksekliğinin %45'inde
                marginTop: -screenHeight * 0.25, // Ekran yüksekliğinin %25'u kadar yukarıdan başla
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1,
                elevation: 2,
                zIndex: 100, // Diğer elementlerin üzerinde görünsün
              }}
            />
          );
        })}
      </View>
    );
  };

  // Popup içinde balığı render et
  const renderPopupFish = () => {
    if (!selectedFish) return null;
    
    const fishInfo = fishData[selectedFish];
    if (!fishInfo) return null;
    
    const isEatingThisFish = isEating === selectedFish;
    
    // Balık tipine göre SVG bileşenini al
    const FishComponent = FishTypes[selectedFish as keyof typeof FishTypes];
    
    if (!FishComponent) return null;
    
    return (
      <Animated.View style={{ 
        alignItems: 'center'
      }}>
        <FishComponent 
          width={120}
          height={90}
          mouthAnim={fishInfo.mouthAnim}
          direction={fishInfo.scale.scaleX > 0 ? 'right' : 'left'}
          isEating={isEatingThisFish}
        />
      </Animated.View>
    );
  };

  // Animasyonları ve balık hareketlerini başlat
  useEffect(() => {
    // Kabarcık animasyonları
    animateBubble(bubble1Anim, 6000);
    animateBubble(bubble2Anim, 5000);
    animateBubble(bubble3Anim, 4000);
    
    // 3D balık animasyonlarını başlat
    startFishAnimations();

    return () => {
      // Temizlik işlemleri...
    };
  }, []);

  // Yem satın alma işlemi
  const buyMoreFood = () => {
    setFoodCount(prev => prev + 5); // 5 adet daha yem ekle
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balık Yemi Göstergesi */}
        <View style={styles.foodCountContainer}>
          <View style={styles.foodIconContainer}>
            <Ionicons
              name="water-outline"
              size={ICON_SIZE.sm}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.foodCountText}>{foodCount}</Text>
          <TouchableOpacity 
            style={styles.buyFoodButton}
            onPress={() => setFoodCount(prev => prev + 5)}
          >
            <Ionicons
              name="add"
              size={ICON_SIZE.xs}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
        
        {/* Akvaryum */}
        <View style={styles.aquariumContainer}>
          <LinearGradient
            colors={['#86b4ff', '#70a5fd']}
            style={styles.aquarium}
          >
            {/* Kabarcık 1 */}
            <Animated.View
              style={[
                styles.bubble,
                {
                  left: 70,
                  bottom: 10,
                  width: 10,
                  height: 10,
                  transform: [{ translateY: bubble1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -80],
                  }) }]
                }
              ]}
            />
            
            {/* Kabarcık 2 */}
            <Animated.View
              style={[
                styles.bubble,
                {
                  left: 200,
                  bottom: 15,
                  width: 15,
                  height: 15,
                  transform: [{ translateY: bubble2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -100],
                  }) }]
                }
              ]}
            />
            
            {/* Kabarcık 3 */}
            <Animated.View
              style={[
                styles.bubble,
                {
                  left: 150,
                  bottom: 50,
                  width: 20,
                  height: 20,
                  transform: [{ translateY: bubble3Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -60],
                  }) }]
                }
              ]}
            />
            
            {/* Turuncu Balık */}
            {renderOrangeFish()}
            
            {/* Mavi Balık */}
            {renderBlueFish()}
            
            {/* Su yüzeyindeki yansıma efekti */}
            <View style={styles.waterSurface} />
          </LinearGradient>
        </View>

        {/* Balıkları Besle Butonu */}
        <View style={{ paddingHorizontal: PADDING.md, paddingBottom: PADDING.md }}>
          <TouchableOpacity
            style={[
              styles.feedFishButton,
              foodCount <= 0 ? styles.feedFishButtonDisabled : {}
            ]}
            onPress={startFeedingProcess}
            disabled={isFeeding || foodCount <= 0}
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
      {/* Balık seçme popup'ı */}
      <Popup
        visible={feedPopupVisible}
        onClose={() => setFeedPopupVisible(false)}
        position="center"
        title="Hangi Balığı Beslemek İstersiniz?"
      >
        <View style={styles.popupContent}>
          {Object.values(fishData).map((fish) => {
            // Balık türüne göre SVG bileşenini al
            const FishComponent = FishTypes[fish.id as keyof typeof FishTypes];
            
            // Açlık seviyesine göre renk belirle
            const hungerColor = getHungerColor(fish.hungerLevel);
            
            return (
              <TouchableOpacity
                key={fish.id}
                style={styles.fishSelectButton}
                onPress={() => feedFish(fish.id)}
              >
                <View style={styles.fishPreviewContainer}>
                  <View style={styles.hungerIndicatorPreviewContainer}>
                    <View 
                      style={[
                        styles.hungerIndicatorPreview, 
                        { width: `${fish.hungerLevel}%`, backgroundColor: hungerColor }
                      ]} 
                    />
                  </View>
                  <FishComponent 
                    width={40}
                    height={30}
                    mouthAnim={new Animated.Value(0)}
                    direction={fish.scale.scaleX > 0 ? "right" : "left"}
                    isEating={false}
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
          setFoods([]);
          setIsEating(false);
        }}
        position="center"
        title="Balık Besleniyor"
      >
        <View style={styles.feedingPopupContent}>
          {/* Balık */}
          <View style={styles.feedingBalikContainer}>
            {renderPopupFish()}
          </View>
          
          {/* Yem animasyonu */}
          {renderPopupFeedAnimation()}
          
          {/* Besleme bilgisi */}
          <Text style={styles.feedingText}>
            {isEating 
              ? "Balık yemi yiyor..." 
              : "Yem balığa yaklaşıyor..."}
          </Text>
          {feedingSuccess && (
            <Text style={styles.feedingSuccessText}>
              Balık başarıyla beslendi!
            </Text>
          )}
        </View>
      </Popup>
      
      {/* Başarılı besleme popup'ı */}
      <Popup
        visible={successPopupVisible}
        onClose={closeFeedingSuccess}
        position="center"
        title="Besleme Başarılı!"
      >
        <View style={styles.popupContent}>
          {selectedFish && (
            <View style={styles.successFishPreview}>
              {/* Seçilen balığın önizlemesi */}
              {(() => {
                const FishComponent = FishTypes[selectedFish as keyof typeof FishTypes];
                return (
                  <FishComponent 
                    width={60}
                    height={50}
                    mouthAnim={new Animated.Value(0)}
                    direction={fishData[selectedFish].scale.scaleX > 0 ? "right" : "left"}
                    isEating={false}
                  />
                );
              })()}
            </View>
          )}
          <Text style={styles.successText}>
            Balık başarıyla beslendi!
          </Text>
          <TouchableOpacity style={styles.successButton} onPress={closeFeedingSuccess}>
            <Text style={styles.successButtonText}>Tamam</Text>
          </TouchableOpacity>
        </View>
      </Popup>
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
    height: 180, 
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: MARGIN.lg,
  },
  aquarium: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  // Balık yemi göstergesi
  foodCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: MARGIN.sm,
    backgroundColor: '#4a85e5',
    paddingHorizontal: PADDING.sm,
    paddingVertical: PADDING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  foodIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 5,
    marginRight: MARGIN.xs,
  },
  foodCountText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: FONT_SIZE.lg,
    marginRight: MARGIN.xs,
  },
  buyFoodButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 3,
  },
  // Kabarcıklar
  bubble: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  waterSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  feedFishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a85e5',
    padding: PADDING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: MARGIN.md,
    alignSelf: 'flex-start',
  },
  feedFishButtonDisabled: {
    backgroundColor: '#a0a0a0',
    opacity: 0.7,
  },
  feedFishButtonIcon: {
    marginRight: MARGIN.sm,
  },
  feedFishButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  },
  wordStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: MARGIN.md,
    flexWrap: 'wrap'
  },
  wordStatCard: {
    width: '30%',
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
    width: 40,
    height: 40,
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
    shadowRadius: 4,
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
    shadowRadius: 4,
    elevation: 1,
  },
  recommendedImageContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  recommendedImage: {
    width: '100%',
    height: 140,
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
  // Besleme popup için stiller
  feedingPopupContent: {
    alignItems: 'center',
    paddingVertical: 20,
    height: 300,
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
  // Balık açlık seviyesi göstergeleri
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
  // Popup içindeki balık açlık göstergesi
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
});
