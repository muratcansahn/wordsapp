import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { BORDER_RADIUS, PADDING, MARGIN } from '@/constants/AppConstants';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { usePremiumLimits } from '@/hooks/usePremiumLimits';
import { getFreeWordListId } from '@/services/wordListService';

// Constants for styling
const STYLE_MARGIN = MARGIN.md;
const STYLE_PADDING = PADDING.md;
const STYLE_BORDER_RADIUS = BORDER_RADIUS.md;

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
    title: 'studyMode.flashcards.title',
    description: 'studyMode.flashcards.description',
    icon: 'cards',
    gradient: ['#6366F1', '#4F46E5'],
  },
  {
    id: 'quiz',
    title: 'studyMode.quiz.title',
    description: 'studyMode.quiz.description',
    icon: 'format-list-checks',
    gradient: ['#EC4899', '#D946EF'],
  },
];

export default function StudyModePage() {
  const { t } = useTranslation();
  const { listId } = useLocalSearchParams();
  const router = useRouter();
  const { mode } = useTheme();
  const { canAccessList, isReady: isPremiumReady } = usePremiumLimits();
  const [freeListId, setFreeListId] = useState<number | undefined>(undefined);
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getFreeWordListId().then((id) => {
      if (isMounted) {
        setFreeListId(id);
        setAccessChecked(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // RevenueCat init tamamlanmadan isPremium her zaman false döner; bu
    // pencerede karar vermek gerçek bir premium kullanıcıyı yanlışlıkla
    // paywall'a atar. init bitene kadar bekle.
    if (!accessChecked || !listId || !isPremiumReady) return;
    const numericListId = Number(listId);
    if (!canAccessList(numericListId, freeListId)) {
      router.replace('/paywall-double');
    }
  }, [accessChecked, listId, freeListId, canAccessList, router, isPremiumReady]);

  const handleModeSelect = (modeId: string) => {
    const listIdParam = listId ? String(listId) : '1';
    if (modeId === 'flashcards') {
      router.push({
        pathname: '/flashcards',
        params: { listId: listIdParam }
      });
    } else {
      router.push({
        pathname: '/quiz',
        params: { listId: listIdParam }
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[mode].background }]}>
      <Animated.View 
        entering={FadeInUp}
        style={styles.header}
      >
        <Text style={[styles.title, { color: Colors[mode].text }]}> 
          {t('studyMode.title')}
        </Text>
        <Text style={[styles.subtitle]}> 
          {t('studyMode.subtitle')}
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
                  <Text style={styles.modeTitle}>{t(studyMode.title)}</Text>
                  <Text style={styles.modeDescription}>{t(studyMode.description)}</Text>
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
    backgroundColor: '#fff',
    paddingTop: 80,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: width * 0.8,
    opacity: 0.7,
    color:'rgba(0, 0, 0, 0.7)'
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
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
