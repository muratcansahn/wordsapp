import { useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';

const DAILY_REMINDER_ID = 'daily-word-reminder';

/**
 * New, separate hook for the local daily learning reminder.
 * This is intentionally NOT merged into `usePushNotification` below:
 * that hook is a (currently stubbed) remote push-token flow, while this
 * one only deals with a locally-scheduled, fixed-time daily notification.
 */
export const useDailyReminder = () => {
  const scheduleDailyReminder = useCallback(
    async (hour: number, minute: number, title: string, body: string) => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return false;

      await Notifications.cancelScheduledNotificationAsync(
        DAILY_REMINDER_ID
      ).catch(() => {});

      await Notifications.scheduleNotificationAsync({
        identifier: DAILY_REMINDER_ID,
        content: {
          title,
          body,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
      return true;
    },
    []
  );

  const cancelDailyReminder = useCallback(async () => {
    await Notifications.cancelScheduledNotificationAsync(
      DAILY_REMINDER_ID
    ).catch(() => {});
  }, []);

  return { scheduleDailyReminder, cancelDailyReminder };
};

export const usePushNotification = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
  const [notification] = useState<null>(null);

  const sendPushNotification = async (expoPushToken: string) => {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'Original Title',
      body: 'And here is the body!',
      data: { someData: 'goes here' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

  const registerForPushNotificationsAsync = async () => {
    console.log('[Notifications] Temporarily disabled for SDK upgrade');
    setExpoPushToken(undefined);
    return undefined;
  };

  return {
    expoPushToken,
    notification,
    sendPushNotification,
    registerForPushNotificationsAsync,
  };
};
