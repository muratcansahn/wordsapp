import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StyleProp, ViewStyle, TextStyle, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BORDER_RADIUS, PADDING, MARGIN } from '@/constants/AppConstants';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

type MaterialIconName = 'book-open-page-variant' | 'briefcase' | 'airplane' | 'check-circle' | 'chevron-right' | 'star';

interface WordList {
  id: number;
  title: string;
  wordCount: number;
  learnedCount: number;
  icon: MaterialIconName;
  gradient: [string, string];
  description?: string;
}

const { width } = Dimensions.get('window');

const wordLists: WordList[] = [
  {
    id: 1,
    title: 'Temel İngilizce',
    wordCount: 100,
    learnedCount: 45,
    icon: 'book-open-page-variant',
    gradient: ['#6366F1', '#A5B4FC'],
    description: 'Günlük konuşmalar için temel kelimeler',
  },
  {
    id: 2,
    title: 'İş İngilizcesi',
    wordCount: 75,
    learnedCount: 20,
    icon: 'briefcase',
    gradient: ['#EC4899', '#F9A8D4'],
    description: 'İş görüşmeleri ve profesyonel iletişim',
  },
  {
    id: 3,
    title: 'Seyahat',
    wordCount: 50,
    learnedCount: 0,
    icon: 'airplane',
    gradient: ['#F59E0B', '#FCD34D'],
    description: 'Seyahat ederken ihtiyaç duyacağınız kelimeler',
  },
];

export default function LearnPage() {
  const router = useRouter();
  const scrollY = useSharedValue(0);

  const handleListSelect = (listId: number) => {
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
        <Text style={styles.subtitle}>
          Öğrenmek istediğiniz kelime listesini seçin
        </Text>
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
            const progress = (list.learnedCount / list.wordCount) * 100;
            return (
              <Animated.View
                key={list.id}
                entering={FadeInUp.delay(index * 150).springify().damping(14)}
                style={styles.listItem}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.listItemTouchable}
                  onPress={() => handleListSelect(list.id)}
                >
                  <LinearGradient
                    colors={list.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientContainer}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.topRow}>
                        <View style={styles.iconContainer}>
                          <MaterialCommunityIcons 
                            name={list.icon} 
                            size={22} 
                            color="#FFFFFF" 
                          />
                        </View>
                        <View style={styles.textContainer}>
                          <Text style={styles.listTitle}>{list.title}</Text>
                          {list.description && (
                            <Text style={styles.description}>{list.description}</Text>
                          )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: PADDING.md,
    paddingBottom: PADDING.lg,
    paddingTop: PADDING.md,
  },
  header: {
    padding: PADDING.md,
    paddingTop: PADDING.lg,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: MARGIN.xs,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  listContainer: {
  },
  listItem: {
    marginBottom: MARGIN.xl,
    borderRadius: BORDER_RADIUS.lg,
    padding: PADDING.xs,
  },
  listItemTouchable: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  gradientContainer: {
    borderRadius: BORDER_RADIUS.lg,
  },
  cardContent: {
    padding: PADDING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MARGIN.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MARGIN.md,
  },
  textContainer: {
    flex: 1,
    padding: PADDING.xs,
  },
  listTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: MARGIN.xs,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MARGIN.md,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  progressText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  statusContainer: {
    paddingHorizontal: PADDING.sm,
    paddingVertical: PADDING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.xs,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: MARGIN.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
});