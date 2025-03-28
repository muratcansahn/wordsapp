import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StyleProp, ViewStyle, TextStyle, StatusBar, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BORDER_RADIUS, PADDING, MARGIN } from '@/constants/AppConstants';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useEffect ,useState} from 'react';
import { getWordLists } from '@/services/wordListService';
import { useLocalSearchParams, useRouter } from 'expo-router';


type MaterialIconName = 'book-open-page-variant' | 'briefcase' | 'airplane' | 'check-circle' | 'chevron-right' | 'star';

interface ApiWordList {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface WordList extends ApiWordList {
  wordCount: number;
  learnedCount: number;
  icon: MaterialIconName;
  gradient: readonly [string, string];
}

const defaultGradients: { [key: number]: readonly [string, string] } = {
  1: ['#6366F1', '#A5B4FC'] as const,
  2: ['#EC4899', '#F9A8D4'] as const,
  3: ['#F59E0B', '#FCD34D'] as const,
};

export default function LearnPage() {
  const router = useRouter();
  const scrollY = useSharedValue(0);
  const [loading, setLoading] = useState(true);
  const [wordLists, setWordLists] = useState<WordList[]>([]);

  useEffect(() => {
    const fetchWordList = async () => {
      try {
        const lists: ApiWordList[] = await getWordLists();
        const formattedLists: WordList[] = lists.map((list) => ({
          ...list,
          wordCount: 100,
          learnedCount: 0,
          gradient: defaultGradients[list.id] || defaultGradients[1]
        })) as WordList[];
        
        setWordLists(formattedLists);
      } catch (error) {
        console.error('Error fetching word list:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWordList();
  }, []);

  const handleListSelect = (listId: number) => {
    console.log("listId", listId);
    router.push({
      pathname: '/learn/study-mode',
      params: { listId: String(listId) }
    });
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 100],
        [1, 0.9],
      ),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, 100],
            [0, -10],
          ),
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Text style={styles.title}>Kelime Listeleri</Text>
      </Animated.View>
      
      <Animated.ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <View style={styles.listContainer}>
          {wordLists.map((list, index) => {
            const progress = list.learnedCount ? (list.learnedCount / (list.wordCount)) * 100 : 0;
            return (
              <Animated.View
                key={list.id}
                entering={FadeInUp.delay(index * 100).springify().damping(14)}
                style={styles.listItem}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.listItemTouchable}
                  onPress={() => handleListSelect(list.id)}
                >
                  <LinearGradient
                    colors={list.gradient || defaultGradients[1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientContainer}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.topRow}>
                        <View style={styles.imageContainer}>
                          <Image 
                            source={{ uri: list.image }} 
                            style={styles.listImage}
                            resizeMode="cover"
                          />
                        </View>
                        <View style={styles.textContainer}>
                          <Text style={styles.listTitle}>{list.name}</Text>
                          <Text style={styles.description} numberOfLines={2}>
                            {list.description}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.bottomRow}>
                        <View style={styles.progressInfo}>
                          <MaterialCommunityIcons 
                            name="star" 
                            size={14} 
                            color="rgba(255, 255, 255, 0.9)" 
                          />
                          <Text style={styles.progressText}>
                            {`${list.learnedCount} / ${list.wordCount} kelime`}
                          </Text>
                        </View>
                        
                        <View style={styles.statusContainer}>
                          {progress > 0 ? (
                            <Text style={styles.statusText}>
                              {progress === 100 ? 'Tamamlandı' : `${Math.round(progress)}%`}
                            </Text>
                          ) : (
                            <Text style={styles.statusText}>Başlanmadı</Text>
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.progressBarContainer}>
                        <View 
                          style={[
                            styles.progressBar, 
                            { width: `${progress}%` }
                          ]} 
                        />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: PADDING.lg,
    paddingTop: PADDING.xl,
    paddingBottom: PADDING.md,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: MARGIN.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: PADDING.lg,
  },
  listContainer: {
    paddingHorizontal: PADDING.lg,
  },
  listItem: {
    marginBottom: MARGIN.md,
  },
  listItemTouchable: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  gradientContainer: {
    borderRadius: BORDER_RADIUS.lg,
    padding: PADDING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    gap: MARGIN.sm,
  },
  topRow: {
    flexDirection: 'row',
    gap: MARGIN.md,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    opacity: 0.9,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: MARGIN.xs,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: PADDING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginTop: MARGIN.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
  },
});