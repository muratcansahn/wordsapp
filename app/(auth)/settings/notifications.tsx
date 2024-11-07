import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import { usePushNotification } from '@/hooks/usePushNotification';
import { ThemedView } from '@/components/common/view';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import Animated, { LinearTransition } from 'react-native-reanimated';
import {
  BORDER_RADIUS,
  BORDER_WIDTH,
  FLEX,
  FONT_SIZE,
  MARGIN,
  PADDING,
  Z_INDEX,
} from '@/constants/AppConstants';
import { useTranslation } from 'react-i18next';
import ShinyButton from '@/components/common/buttons/shiny-button';

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
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const onPress = () => {
    if (expoPushToken) {
      sendPushNotification(expoPushToken);
    }
  };

  useEffect(() => {
    if (notification) {
      const newNotification: NotificationData = {
        id: notification.request.identifier,
        title: notification.request.content.title ?? 'No Title',
        message: notification.request.content.body ?? 'No Message',
        receivedAt: new Date(),
      };
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        newNotification,
      ]);
    }
  }, [notification]);

  return (
    <ThemedView style={styles.container}>
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
