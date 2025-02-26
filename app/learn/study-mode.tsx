import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { BORDER_RADIUS, PADDING, MARGIN } from '@/constants/AppConstants';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

// Constants for styling
const STYLE_MARGIN = Number(MARGIN);
const STYLE_PADDING = Number(PADDING);
const STYLE_BORDER_RADIUS = Number(BORDER_RADIUS);

const { width, height } = Dimensions.get('window');

type MaterialIconName = 'cards' | 'format-list-checks' | 'check-circle' | 'chevron-right';

interface StudyMode {
  id: 'flashcards' | 'quiz';
  title: string;
  description: string;
  icon: MaterialIconName;
  gradient: [string, string];
}

const studyModes: StudyMode[] = [
  {
    id: 'flashcards',
    title: 'Kelime Kartları',
    description: 'Kelimeleri kartlar halinde öğrenin',
    icon: 'cards',
    gradient: ['#6366F1', '#4F46E5'],
  },
  {
    id: 'quiz',
    title: 'Çoktan Seçmeli Test',
    description: 'Kelimeleri test ederek öğrenin',
    icon: 'format-list-checks',
    gradient: ['#EC4899', '#D946EF'],
  },
];

export default function StudyModePage() {
  const { listId } = useLocalSearchParams();
  const router = useRouter();
  const { mode } = useTheme();

  const handleModeSelect = (modeId: string) => {
    router.push({
      pathname: modeId === 'flashcards' ? '/flashcards' : '/quiz',
      params: { listId }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[mode].background }]}>
      <Animated.View 
        entering={FadeInUp}
        style={styles.header}
      >
        <Text style={[styles.title, { color: Colors[mode].text }]}>
          Nasıl öğrenmek istersiniz?
        </Text>
        <Text style={[styles.subtitle, { color: Colors[mode].placeholderColor }]}>
          Size en uygun öğrenme yöntemini seçin ve hemen öğrenmeye başlayın
        </Text>
      </Animated.View>

      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          {studyModes.map((studyMode, index) => (
            <Animated.View
              key={studyMode.id}
              entering={FadeInRight.delay(index * 200)}
              style={styles.modeItemContainer}
            >
              <TouchableOpacity
                onPress={() => handleModeSelect(studyMode.id)}
                style={styles.modeButton}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={studyMode.gradient as readonly [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modeContent}
                >
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons 
                      name={studyMode.icon as MaterialIconName}
                      size={40} 
                      color="#FFFFFF" 
                    />
                  </View>
                  <Text style={styles.modeTitle}>
                    {studyMode.title}
                  </Text>
                  <Text style={[styles.modeDescription, { color: 'rgba(255, 255, 255, 0.9)' }]}>
                    {studyMode.description}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    marginTop: STYLE_MARGIN * 4,
    marginBottom: STYLE_MARGIN * 6,
    alignItems: 'center',
    paddingHorizontal: STYLE_PADDING,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: STYLE_MARGIN,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
    opacity: 0.7,
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: STYLE_PADDING,
    paddingVertical: STYLE_MARGIN * 4,
  },
  gridRow: {
    height: height * 0.6,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  modeItemContainer: {
    width: width * 0.75,
    aspectRatio: 1.5,
  },
  modeButton: {
    flex: 1,
    borderRadius: STYLE_BORDER_RADIUS * 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modeContent: {
    flex: 1,
    padding: STYLE_PADDING * 2,
    borderRadius: STYLE_BORDER_RADIUS * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: STYLE_MARGIN * 1.5,
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: STYLE_MARGIN,
    textAlign: 'center',
  },
  modeDescription: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: '85%',
    lineHeight: 20,
  },
});
