import { useTranslation } from 'react-i18next';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BORDER_RADIUS, FLEX, FONT_SIZE, ICON_SIZE, MARGIN, PADDING } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { ThemedText } from '@/components/common/typography';
import { useMemo } from 'react';

const DailyActivities = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { mode } = useTheme();

    const dailyContent = useMemo(() => [
        {
          id: '1',
          title: 'Günlük Çalışma',
          description: 'Bugün için belirlenen yeni kelimeleri öğren',
          progress: 75,
          icon: 'calendar',
          gradient: ['#FF9A9E', '#FAD0C4'] as readonly [string, string],
          action: 'flashcards',
        },
        {
          id: '3',
          title: 'Kelime Tahmin Oyunu',
          description: 'Kelime bilginizi eğlenceli bir oyunla test edin',
          progress: 0,
          icon: 'game-controller',
          gradient: ['#4facfe', '#00f2fe'] as readonly [string, string],
          action: 'writing',
        },
        {
          id: '4',
          title: 'Kelime Eşleştirme',
          description: 'Kelimeleri anlamlarıyla eşleştirin',
          progress: 0,
          icon: 'link',
          gradient: ['#43e97b', '#38f9d7'] as readonly [string, string],
          action: 'word-matching',
        },
    ], []);

    const renderDailyCard = useMemo(() => (item: typeof dailyContent[0]) => (
        <TouchableOpacity 
            key={item.id}
            style={styles.dailyCard}
            onPress={() => router.push(item.action)}
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
    ), [router]);

    return (
        <View>
            <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>{t('dashboard.dailyActivities')}</ThemedText>
            </View>

            {dailyContent.map(renderDailyCard)}

        
        </View>
    );
};

const styles = StyleSheet.create({
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
});

export default DailyActivities;
