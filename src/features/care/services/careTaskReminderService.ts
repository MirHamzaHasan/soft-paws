import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { CareTaskModel } from '@/db';
import { queueBarklogEvent } from '@/features/observability';

import {
  formatCareTaskDueLabel,
  getCareTaskTypeLabel,
  parseCareTaskDueDate,
} from '../utils/careTaskSchedule';

type CareReminderStatus = 'denied' | 'scheduled' | 'skipped' | 'unsupported';

type CareReminderResult = {
  message: string;
  scheduledCount: number;
  status: CareReminderStatus;
};

const CARE_NOTIFICATION_CHANNEL_ID = 'barklog-care-calendar';
const CARE_REMINDER_TYPE = 'care_task';

async function ensureCareTaskChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    CARE_NOTIFICATION_CHANNEL_ID,
    {
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#E7E5E4',
      name: 'Care calendar reminders',
      sound: 'default',
    },
  );
}

export async function ensureCareTaskNotificationPermission() {
  queueBarklogEvent('permission_requested', {
    capability: 'notifications',
    surface: 'care_calendar_reminders',
  });

  if (Platform.OS === 'web') {
    queueBarklogEvent('permission_result', {
      capability: 'notifications',
      status: 'unsupported',
      surface: 'care_calendar_reminders',
    });

    return {
      granted: false,
      message:
        'Care tasks are saved. Browser notification scheduling is not available in this Expo web preview.',
      status: 'unsupported' as const,
    };
  }

  try {
    const existingPermissions = await Notifications.getPermissionsAsync();

    if (existingPermissions.granted) {
      queueBarklogEvent('permission_result', {
        capability: 'notifications',
        status: 'granted',
        surface: 'care_calendar_reminders',
      });

      return {
        granted: true,
        message: 'Care calendar reminders are enabled.',
        status: 'scheduled' as const,
      };
    }

    const requestedPermissions = await Notifications.requestPermissionsAsync();

    if (requestedPermissions.granted) {
      queueBarklogEvent('permission_result', {
        capability: 'notifications',
        status: 'granted',
        surface: 'care_calendar_reminders',
      });

      return {
        granted: true,
        message: 'Care calendar reminders are enabled.',
        status: 'scheduled' as const,
      };
    }

    queueBarklogEvent('permission_result', {
      capability: 'notifications',
      status: 'denied',
      surface: 'care_calendar_reminders',
    });

    return {
      granted: false,
      message:
        'Care tasks are saved, but notifications are disabled for BarkLog.',
      status: 'denied' as const,
    };
  } catch {
    queueBarklogEvent('permission_result', {
      capability: 'notifications',
      status: 'unsupported',
      surface: 'care_calendar_reminders',
    });

    return {
      granted: false,
      message:
        'Care tasks are saved. Notification scheduling is not available in this environment.',
      status: 'unsupported' as const,
    };
  }
}

function isCareTaskReminderRequest(request: Notifications.NotificationRequest) {
  return request.content.data?.barklogReminderType === CARE_REMINDER_TYPE;
}

function isCareTaskReminderForTask(
  request: Notifications.NotificationRequest,
  careTaskId: string,
) {
  return (
    isCareTaskReminderRequest(request) &&
    request.content.data?.careTaskId === careTaskId
  );
}

async function getScheduledNotificationRequests() {
  if (Platform.OS === 'web') {
    return [];
  }

  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch {
    return [];
  }
}

export async function cancelCareTaskReminderNotifications(careTaskId: string) {
  const requests = await getScheduledNotificationRequests();
  const matchingRequests = requests.filter((request) =>
    isCareTaskReminderForTask(request, careTaskId),
  );

  await Promise.all(
    matchingRequests.map((request) =>
      Notifications.cancelScheduledNotificationAsync(request.identifier).catch(
        () => undefined,
      ),
    ),
  );

  return matchingRequests.length;
}

export async function scheduleCareTaskReminder(
  careTask: CareTaskModel,
): Promise<CareReminderResult> {
  await cancelCareTaskReminderNotifications(careTask.id);

  if (!careTask.reminderEnabled || careTask.completedAt) {
    return {
      message: 'Care task is saved without a notification reminder.',
      scheduledCount: 0,
      status: 'skipped',
    };
  }

  const dueDate = parseCareTaskDueDate(careTask.dueAt);

  if (Number.isNaN(dueDate.getTime()) || dueDate.getTime() <= Date.now()) {
    return {
      message: 'Care task is saved. Reminder needs a future due date.',
      scheduledCount: 0,
      status: 'skipped',
    };
  }

  const permission = await ensureCareTaskNotificationPermission();

  if (!permission.granted) {
    return {
      message: permission.message,
      scheduledCount: 0,
      status: permission.status,
    };
  }

  try {
    await ensureCareTaskChannel();
    await Notifications.scheduleNotificationAsync({
      content: {
        body: `${formatCareTaskDueLabel(careTask)} - ${getCareTaskTypeLabel(
          careTask.type,
        )}`,
        data: {
          barklogReminderType: CARE_REMINDER_TYPE,
          careTaskId: careTask.id,
          route: '/care-calendar',
        },
        sound: true,
        title: careTask.title,
      },
      identifier: `barklog-care-${careTask.id}`,
      trigger: {
        date: dueDate,
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      },
    });

    return {
      message: 'Care calendar reminder scheduled.',
      scheduledCount: 1,
      status: 'scheduled',
    };
  } catch {
    return {
      message:
        'Care task is saved. Notification scheduling is not available in this environment.',
      scheduledCount: 0,
      status: 'unsupported',
    };
  }
}
