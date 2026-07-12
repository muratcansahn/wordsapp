import { useState } from 'react';

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
