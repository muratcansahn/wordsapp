import { useTranslation } from 'react-i18next';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { FONT_SIZE, ICON_SIZE, MARGIN, PADDING } from '@/constants/AppConstants';
import { useTheme } from '@/hooks/theme/useTheme';
import { ThemedText } from '@/components/common/typography';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/SupabaseProvider';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { Colors } from '@/constants/Colors';
import { updateGameRequestAndTimestamp, type GameType } from '@/services/gameRequestServices';
import { useAdmobRewarded } from '@/hooks/useAdmobRewarded';


interface GameStatus {
    remaining: number;
    lastPlayed: string | null;
}

const DailyActivitiesSection = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { mode } = useTheme();
    const { user } = useAuth();
    const userId = user?.id;
    const [gameStatus, setGameStatus] = useState<Record<string, GameStatus>>({});
    const [countdown, setCountdown] = useState<Record<string, string>>({});
    const [adDialogVisible, setAdDialogVisible] = useState(false);
    const [selectedGame, setSelectedGame] = useState<string>('');
      const { showRewarded, isPremium } = useAdmobRewarded(1); // İkinci reklam ID'sini kullanmak için adIndex=1 olarak ayarlandı

    const fetchGameStatus = useCallback(async () => {
        if (!userId) return;

        const { data, error } = await supabase
            .from('UserGameRequestDates')
            .select('wordguess, wordmatching, wordguess_remaining, wordmatching_remaining')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Oyun durumu getirilemedi:', error);
            return;
        }

        setGameStatus({
            wordguess: {
                remaining: data.wordguess_remaining || 0,
                lastPlayed: data.wordguess
            },
            wordmatching: {
                remaining: data.wordmatching_remaining || 0,
                lastPlayed: data.wordmatching
            }
        });
    }, [userId]);

    // Sayfa fokuslandığında oyun haklarını güncelle
    useFocusEffect(
        useCallback(() => {
            fetchGameStatus();
        }, [fetchGameStatus])
    );

    useEffect(() => {
        const updateCountdown = () => {
            if (!gameStatus) return;

            const newCountdown: Record<string, string> = {};
            const now = new Date();
            
            Object.entries(gameStatus).forEach(([gameType, status]) => {
                if (!status?.lastPlayed) return;

                const lastPlayedUTC = new Date(status.lastPlayed);
                const lastPlayedLocal = new Date(lastPlayedUTC.getTime() - (lastPlayedUTC.getTimezoneOffset() * 60000));
                const nextRewardTime = new Date(lastPlayedLocal.getTime() + (4 * 60 * 60 * 1000));
                const diffMs = nextRewardTime.getTime() - now.getTime();

                if (status.remaining <= 1) {
                    if (diffMs > 0) {
                        const totalMinutes = Math.floor(diffMs / (1000 * 60));
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;
                        if (hours > 0) {
                            newCountdown[gameType] = t('dailyActivities.countdownHours', { hours, minutes });
                        } else {
                            newCountdown[gameType] = t('dailyActivities.countdownMinutes', { minutes });
                        }
                    } else {
                        newCountdown[gameType] = "Süre doldu";
                    }
                }
            });
            
            setCountdown(newCountdown);
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 60000);
        return () => clearInterval(timer);
    }, [gameStatus, t]);

    const dailyContent = useMemo(() => [
        {
          id: '3',
          title: t('dailyActivities.dailyContent.3.title'),
          description: t('dailyActivities.dailyContent.3.description'),
          icon: 'help-circle-outline',  // Kelime tahmin: soru ve tahmin etme kavramını temsil eder
          gradient: ['#4facfe', '#00f2fe'] as readonly [string, string],
          action: 'writing',
          gameType: 'wordguess'
        },
        {
          id: '4',
          title: t('dailyActivities.dailyContent.4.title'),
          description: t('dailyActivities.dailyContent.4.description'),
          icon: 'shuffle-outline',  // Kelime eşleştirme: eşleştirme ve düzenleme kavramını temsil eder
          gradient: ['#43e97b', '#38f9d7'] as readonly [string, string],
          action: 'word-matching',
          gameType: 'wordmatching'
        },
    ], [t]);

    const handleGamePress = useCallback(async (route: string, gameType: string) => {
        const status = gameStatus[gameType];
        if (status && status.remaining === 0) {
            setSelectedGame(gameType);
            if (isPremium) {
                // Premium kullanıcılar reklam izlemeden, reklamın verdiği ekstra
                // oyun hakkının aynısını doğrudan alır.
                router.push(route);
            } else {
                setAdDialogVisible(true); // Oyun hakkı kalmadığında reklam izleme dialogunu göster
            }
        } else {
            const userId = user?.id;
            if (!userId) return;

            const result = await updateGameRequestAndTimestamp(userId, gameType as GameType);
            if (result?.success) {
                router.push(route);
            } else {
                // Hata durumunda kullanıcıyı bilgilendir
                Alert.alert('Hata', 'Oyun başlatılırken bir hata oluştu.');
            }
        }
    }, [gameStatus, router, user, isPremium]);
    
 

    const renderDailyCard = useMemo(() => (item: typeof dailyContent[0]) => {
        const status = gameStatus[item.gameType];
        const timeLeft = status?.remaining !== undefined && status.remaining <= 1
          ? (countdown[item.gameType] ?? "Süre doldu")
          : null;

        return (
            <TouchableOpacity 
                key={item.id}
                style={styles.dailyCard}
                onPress={() => handleGamePress(item.action, item.gameType)}
            >
                <LinearGradient
                    colors={item.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.dailyCardGradient}
                >
                    <View style={styles.cardOverlay} />
                    {(status?.remaining !== undefined && status.remaining >= 0) && (
                        <View style={styles.remainingBadge}>
                            <FontAwesome5 name="heart" size={12} color="#FFFFFF" solid />
                            <Text style={styles.remainingBadgeText}>
                                {status.remaining}
                            </Text>
                        </View>
                    )}
                    <View style={styles.dailyCardContent}>
                        <View style={styles.dailyCardHeader}>
                            <View style={styles.iconContainer}>
                                <Ionicons
                                    name={item.icon as keyof typeof Ionicons.glyphMap}
                                    size={ICON_SIZE.md}
                                    color="#FFFFFF"
                                />
                            </View>
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.dailyCardTitle}>{item.title}</Text>
                                <Text style={styles.dailyCardDescription}>{item.description}</Text>
                            </View>
                        </View>
                        {timeLeft && (
                            <View style={styles.gameStatus}>
                                <Text style={styles.timeText}>
  {t('dailyActivities.nextRight', { time: timeLeft })}
</Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    }, [gameStatus, countdown, handleGamePress, t]);

    return (
        <>
            <View style={styles.container}>
                <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitle}>{t('dashboard.dailyActivities')}</ThemedText>
                </View>

                <View style={styles.cardsContainer}>
                    {dailyContent.map(renderDailyCard)}
                </View>
            </View>
            <ConfirmationDialog
                visible={adDialogVisible}
                title="Hiç hakkın kalmadı"
                message="Yeni oyun hakkı karşılığı reklam izlemek ister misin?"
                confirmText="Reklam İzle"
                cancelText="Vazgeç"
                icon="videocam-outline"
                iconColor={Colors[mode].primary}
                onConfirm={() => {
                    showRewarded().then(() => {
                        setAdDialogVisible(false);
                        
                        // Reklam izlendikten sonra direkt olarak oyunu aç
                        const gameInfo = dailyContent.find(item => item.gameType === selectedGame);
                        if (gameInfo && user?.id) {
                            // Oyunu direkt olarak aç, hak kontrolü yapmadan
                            router.push(gameInfo.action);
                        }
                    });
                }}
                onCancel={() => setAdDialogVisible(false)}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: PADDING.xl * 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: MARGIN.lg,
        marginTop: MARGIN.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
    },
    cardsContainer: {
        flexDirection: 'column',
    },
    dailyCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: MARGIN.lg,
        width: '100%',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    dailyCardGradient: {
        position: 'relative',
        minHeight: 130,
        borderRadius: 16,
    },
    cardOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    dailyCardContent: {
        padding: PADDING.md,
        flex: 1,
        justifyContent: 'space-between',
    },
    dailyCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: MARGIN.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    headerTextContainer: {
        flex: 1,
    },
    dailyCardTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.15)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    dailyCardDescription: {
        fontSize: FONT_SIZE.sm,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    remainingBadge: {
        position: 'absolute',
        top: PADDING.sm,
        right: PADDING.sm,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        borderRadius: 999,
        paddingHorizontal: PADDING.sm,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    remainingBadgeText: {
        color: '#FFFFFF',
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
    },
    gameStatus: {
        marginTop: MARGIN.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        paddingHorizontal: PADDING.sm,
        paddingVertical: PADDING.xs,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        color: '#FFFFFF',
        fontSize: FONT_SIZE.sm,
        fontWeight: '500',
        opacity: 0.9,
    }
});

export default DailyActivitiesSection;
