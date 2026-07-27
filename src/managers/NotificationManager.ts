import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

type NotificationData = Record<string, unknown>;

function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function requestPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission not granted for notifications');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      importance: Notifications.AndroidImportance.MAX,
      lightColor: '#FF231F7C',
      name: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
}

async function scheduleLocalNotification(
  title: string,
  body: string,
  data: NotificationData = {},
  trigger?: Notifications.NotificationTriggerInput,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      body,
      data,
      title,
    },
    trigger: trigger || null,
  });
}

async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void,
) {
  return Notifications.addNotificationReceivedListener(callback);
}

function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void,
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

configureNotificationHandler();

const NotificationManager = {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  cancelAllNotifications,
  requestPermissions,
  scheduleLocalNotification,
};

export default NotificationManager;
