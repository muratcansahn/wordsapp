import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Switch } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import { usePushNotification, useDailyReminder } from '@/hooks/usePushNotification';
import { ThemedView } from '@/components/common/view';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import Animated, { LinearTransition } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { Ionicons } from '@expo/vector-icons';
import {
  BORDER_RADIUS,
  BORDER_WIDTH,
  FLEX,
  FONT_SIZE,
  ICON_SIZE,
  MARGIN,
  PADDING,
  Z_INDEX,
} from '@/constants/AppConstants';
import { useTranslation } from 'react-i18next';
import ShinyButton from '@/components/common/buttons/shiny-button';

const DAILY_REMINDER_ENABLED_KEY = 'dailyReminderEnabled';
const DAILY_REMINDER_HOUR_KEY = 'dailyReminderHour';
const DAILY_REMINDER_MINUTE_KEY = 'dailyReminderMinute';
const DEFAULT_REMINDER_HOUR = 20;
const DEFAULT_REMINDER_MINUTE = 0;

const pad = (value: number) => value.toString().padStart(2, '0');

interface NotificationData {
  id: string;
  title: string;
  message: string;
  receivedAt: Date;
}

export default function PushNotification() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { expoPushToken, sendPushNotification, notification } =
    usePushNotification();
  const { scheduleDailyReminder, cancelDailyReminder } = useDailyReminder();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(DEFAULT_REMINDER_HOUR);
  const [reminderMinute, setReminderMinute] = useState(DEFAULT_REMINDER_MINUTE);
  const [isReminderLoaded, setIsReminderLoaded] = useState(false);
  const onPress = () => {
    if (expoPushToken) {
      sendPushNotification(expoPushToken);
    }
  };

  // Kaydedilmiş hatırlatma tercihini yükle (uygulama yeniden başlatıldığında korunması için).
  useEffect(() => {
    const loadReminderPrefs = async () => {
      try {
        const [storedEnabled, storedHour, storedMinute] = await Promise.all([
          AsyncStorage.getItem(DAILY_REMINDER_ENABLED_KEY),
          AsyncStorage.getItem(DAILY_REMINDER_HOUR_KEY),
          AsyncStorage.getItem(DAILY_REMINDER_MINUTE_KEY),
        ]);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- kalıcı depodan tek seferlik yükleme
        setReminderEnabled(storedEnabled === 'true');
        if (storedHour !== null) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- kalıcı depodan tek seferlik yükleme
          setReminderHour(parseInt(storedHour, 10));
        }
        if (storedMinute !== null) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- kalıcı depodan tek seferlik yükleme
          setReminderMinute(parseInt(storedMinute, 10));
        }
      } catch (error) {
        console.error('Hatırlatma tercihleri yüklenemedi:', error);
      } finally {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- kalıcı depodan tek seferlik yükleme
        setIsReminderLoaded(true);
      }
    };
    loadReminderPrefs();
  }, []);

  const persistReminderPrefs = useCallback(
    async (enabled: boolean, hour: number, minute: number) => {
      await Promise.all([
        AsyncStorage.setItem(DAILY_REMINDER_ENABLED_KEY, String(enabled)),
        AsyncStorage.setItem(DAILY_REMINDER_HOUR_KEY, String(hour)),
        AsyncStorage.setItem(DAILY_REMINDER_MINUTE_KEY, String(minute)),
      ]);
    },
    []
  );

  const handleToggleReminder = useCallback(
    async (enabled: boolean) => {
      setReminderEnabled(enabled);
      if (enabled) {
        const granted = await scheduleDailyReminder(
          reminderHour,
          reminderMinute,
          t('settings.notifications.dailyReminderTitle'),
          t('settings.notifications.dailyReminderBody')
        );
        if (!granted) {
          setReminderEnabled(false);
          return;
        }
      } else {
        await cancelDailyReminder();
      }
      await persistReminderPrefs(enabled, reminderHour, reminderMinute);
    },
    [
      reminderHour,
      reminderMinute,
      scheduleDailyReminder,
      cancelDailyReminder,
      persistReminderPrefs,
      t,
    ]
  );

  const adjustReminderTime = useCallback(
    async (deltaHour: number, deltaMinute: number) => {
      const totalMinutes =
        (((reminderHour * 60 +
          reminderMinute +
          deltaHour * 60 +
          deltaMinute) %
          1440) +
          1440) %
        1440;
      const nextHour = Math.floor(totalMinutes / 60);
      const nextMinute = totalMinutes % 60;
      setReminderHour(nextHour);
      setReminderMinute(nextMinute);
      if (reminderEnabled) {
        await scheduleDailyReminder(
          nextHour,
          nextMinute,
          t('settings.notifications.dailyReminderTitle'),
          t('settings.notifications.dailyReminderBody')
        );
      }
      await persistReminderPrefs(reminderEnabled, nextHour, nextMinute);
    },
    [
      reminderHour,
      reminderMinute,
      reminderEnabled,
      scheduleDailyReminder,
      persistReminderPrefs,
      t,
    ]
  );

  // Dış sistemle (push notification listener) senkronizasyon — her yeni
  // `notification` geldiğinde geçmişe ekleniyor; render sırasında türetilemez.
  useEffect(() => {
    if (notification) {
      const newNotification: NotificationData = {
        id: notification.request.identifier,
        title: notification.request.content.title ?? 'No Title',
        message: notification.request.content.body ?? 'No Message',
        receivedAt: new Date(),
      };
      // eslint-disable-next-line react-hooks/set-state-in-effect -- effect'in amacı zaten harici event'e tepki vermek
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        newNotification,
      ]);
    }
  }, [notification]);

  return (
    <ThemedView style={styles.container}>
      <ThemedView
        style={[
          styles.reminderContainer,
          { backgroundColor: Colors[mode].button },
        ]}
      >
        <ThemedView
          style={[styles.reminderRow, { backgroundColor: 'transparent' }]}
        >
          <ThemedText type="defaultSemiBold" style={styles.reminderTitle}>
            {t('settings.notifications.dailyReminderTitle')}
          </ThemedText>
          <Switch
            value={reminderEnabled}
            disabled={!isReminderLoaded}
            onValueChange={handleToggleReminder}
          />
        </ThemedView>
        {reminderEnabled && (
          <ThemedView
            style={[styles.reminderRow, { backgroundColor: 'transparent' }]}
          >
            <PressableOpacity
              accessibilityLabel="decrease-reminder-time"
              onPress={() => adjustReminderTime(0, -5)}
            >
              <Ionicons
                name="remove-circle-outline"
                size={ICON_SIZE.sm}
                color={Colors[mode].text}
              />
            </PressableOpacity>
            <ThemedText style={styles.reminderTimeText}>
              {pad(reminderHour)}:{pad(reminderMinute)}
            </ThemedText>
            <PressableOpacity
              accessibilityLabel="increase-reminder-time"
              onPress={() => adjustReminderTime(0, 5)}
            >
              <Ionicons
                name="add-circle-outline"
                size={ICON_SIZE.sm}
                color={Colors[mode].text}
              />
            </PressableOpacity>
          </ThemedView>
        )}
      </ThemedView>
      <ThemedView style={styles.tokenContainer}>
        <ThemedText style={styles.tokenText}>
          {t('settings.notifications.pushToken')}: {'\n'}
          {expoPushToken}
        </ThemedText>
      </ThemedView>
      <ShinyButton
        onPress={onPress}
        bgColor={Colors[mode].button}
        buttonColor={Colors[mode].primary}
      >
        <ThemedText style={styles.sendButtonText}>
          {t('buttons.send')}
        </ThemedText>
      </ShinyButton>
      <ThemedView
        style={[
          styles.notificationContainer,
          {
            backgroundColor: Colors[mode].button,
          },
        ]}
      >
        <ThemedText style={styles.header}>
          {t('settings.notifications.receivedNotifications')}
        </ThemedText>
        <Animated.FlatList
          data={notifications}
          itemLayoutAnimation={LinearTransition}
          keyboardDismissMode={'on-drag'}
          key={`${mode}-${notifications.length}`}
          keyExtractor={(item) => `${item.id}-${item.receivedAt.getTime()}`}
          renderItem={({ item }) => (
            <ThemedView
              style={[
                styles.notificationItem,
                {
                  borderWidth: BORDER_WIDTH.sm,
                  borderColor: Colors[mode].borderColor,
                  borderRadius: BORDER_RADIUS.sm,
                },
              ]}
            >
              <ThemedText
                type="defaultSemiBold"
                style={styles.notificationTitle}
              >
                {item.title}
              </ThemedText>
              <ThemedText type="default" style={styles.notificationMessage}>
                {item.message}
              </ThemedText>
              <ThemedText type="default" style={styles.notificationTime}>
                {item.receivedAt.toLocaleString()}
              </ThemedText>
            </ThemedView>
          )}
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>
              {t('settings.notifications.noNotifications')}
            </ThemedText>
          }
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
  },
  reminderContainer: {
    borderRadius: BORDER_RADIUS.sm,
    padding: PADDING.md,
    margin: PADDING.sm,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: PADDING.xs,
  },
  reminderTitle: {
    fontSize: FONT_SIZE.md,
  },
  reminderTimeText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginHorizontal: MARGIN.lg,
  },
  tokenText: {
    fontSize: FONT_SIZE.lg,
    marginBottom: MARGIN.lg,
    textAlign: 'center',
  },
  tokenContainer: {
    padding: PADDING.sm,
  },

  notificationContainer: {
    flex: FLEX.one,
    borderRadius: BORDER_RADIUS.sm,
    padding: PADDING.md,
  },
  header: {
    fontSize: FONT_SIZE.lg,
    marginBottom: MARGIN.lg,
  },
  sendButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    zIndex: Z_INDEX.one,
  },
  notificationItem: {
    padding: PADDING.sm,
    marginBottom: MARGIN.lg,
    borderRadius: BORDER_RADIUS.sm,
  },
  notificationTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: FONT_SIZE.sm,
    marginVertical: MARGIN.sm,
  },
  notificationTime: {
    fontSize: FONT_SIZE.sm,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: MARGIN.lg,
  },
});
