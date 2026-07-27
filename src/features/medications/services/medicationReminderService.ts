import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { MedicationModel } from '@/db';
import { listActiveMedicationsForDog } from '@/db';
import { queueBarklogEvent } from '@/features/observability';

import {
  formatMedicationDoseLabel,
  parseMedicationTime,
} from '../utils/medicationSchedule';

type ReminderStatus = 'denied' | 'scheduled' | 'skipped' | 'unsupported';

type ReminderResult = {
  message: string;
  scheduledCount: number;
  status: ReminderStatus;
};

const MEDICATION_NOTIFICATION_CHANNEL_ID = 'barklog-medications';
const MEDICATION_REMINDER_TYPE = 'medication';

let didConfigureHandler = false;

export function configureMedicationNotificationHandler() {
  if (didConfigureHandler) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  didConfigureHandler = true;
}

async function ensureMedicationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    MEDICATION_NOTIFICATION_CHANNEL_ID,
    {
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#E2DCEF',
      name: 'Medication reminders',
      sound: 'default',
    },
  );
}

export async function ensureMedicationNotificationPermission() {
  queueBarklogEvent('permission_requested', {
    capability: 'notifications',
    surface: 'medication_reminders',
  });

  if (Platform.OS === 'web') {
    queueBarklogEvent('permission_result', {
      capability: 'notifications',
      status: 'unsupported',
      surface: 'medication_reminders',
    });

    return {
      granted: false,
      message:
        'Medication reminders are saved. Browser scheduling is not available in this Expo web preview.',
      status: 'unsupported' as const,
    };
  }

  try {
    const existingPermissions = await Notifications.getPermissionsAsync();

    if (existingPermissions.granted) {
      queueBarklogEvent('permission_result', {
        capability: 'notifications',
        status: 'granted',
        surface: 'medication_reminders',
      });

      return {
        granted: true,
        message: 'Medication reminders are enabled.',
        status: 'scheduled' as const,
      };
    }

    const requestedPermissions = await Notifications.requestPermissionsAsync();

    if (requestedPermissions.granted) {
      queueBarklogEvent('permission_result', {
        capability: 'notifications',
        status: 'granted',
        surface: 'medication_reminders',
      });

      return {
        granted: true,
        message: 'Medication reminders are enabled.',
        status: 'scheduled' as const,
      };
    }

    queueBarklogEvent('permission_result', {
      capability: 'notifications',
      status: 'denied',
      surface: 'medication_reminders',
    });

    return {
      granted: false,
      message:
        'Medication reminders are saved, but notifications are disabled for BarkLog.',
      status: 'denied' as const,
    };
  } catch {
    queueBarklogEvent('permission_result', {
      capability: 'notifications',
      status: 'unsupported',
      surface: 'medication_reminders',
    });

    return {
      granted: false,
      message:
        'Medication reminders are saved. Notification scheduling is not available in this environment.',
      status: 'unsupported' as const,
    };
  }
}

function isMedicationReminderRequest(
  request: Notifications.NotificationRequest,
) {
  return request.content.data?.barklogReminderType === MEDICATION_REMINDER_TYPE;
}

function isMedicationReminderForMedication(
  request: Notifications.NotificationRequest,
  medicationId: string,
) {
  return (
    isMedicationReminderRequest(request) &&
    request.content.data?.medicationId === medicationId
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

export async function cancelMedicationReminderNotifications(
  medicationId: string,
) {
  const requests = await getScheduledNotificationRequests();
  const matchingRequests = requests.filter((request) =>
    isMedicationReminderForMedication(request, medicationId),
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

export async function cancelAllMedicationReminderNotifications() {
  const requests = await getScheduledNotificationRequests();
  const matchingRequests = requests.filter(isMedicationReminderRequest);

  await Promise.all(
    matchingRequests.map((request) =>
      Notifications.cancelScheduledNotificationAsync(request.identifier).catch(
        () => undefined,
      ),
    ),
  );

  return matchingRequests.length;
}

function getMedicationReminderTrigger(
  medication: MedicationModel,
  time: string,
): Notifications.NotificationTriggerInput {
  const { hour, minute } = parseMedicationTime(time);

  if (medication.frequency === 'weekly') {
    const scheduleDate = medication.startDate
      ? new Date(medication.startDate)
      : new Date();
    const jsWeekday = Number.isNaN(scheduleDate.getTime())
      ? new Date().getDay()
      : scheduleDate.getDay();

    return {
      hour,
      minute,
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: jsWeekday + 1,
    };
  }

  if (medication.frequency === 'every_other_day') {
    return {
      repeats: true,
      seconds: 60 * 60 * 48,
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    };
  }

  return {
    hour,
    minute,
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
  };
}

export async function scheduleMedicationRemindersForMedication(
  medication: MedicationModel,
): Promise<ReminderResult> {
  await cancelMedicationReminderNotifications(medication.id);

  if (
    !medication.active ||
    medication.frequency === 'as_needed' ||
    medication.scheduleTimes.length === 0
  ) {
    return {
      message: 'No scheduled reminders are needed for this medication.',
      scheduledCount: 0,
      status: 'skipped',
    };
  }

  const permission = await ensureMedicationNotificationPermission();

  if (!permission.granted) {
    return {
      message: permission.message,
      scheduledCount: 0,
      status: permission.status,
    };
  }

  try {
    await ensureMedicationChannel();
  } catch {
    return {
      message:
        'Medication reminders are saved. Notification scheduling is not available in this environment.',
      scheduledCount: 0,
      status: 'unsupported',
    };
  }

  const scheduledResults = await Promise.allSettled(
    medication.scheduleTimes.map((time, index) =>
      Notifications.scheduleNotificationAsync({
        content: {
          body: `${formatMedicationDoseLabel(
            medication.doseMg,
          )}${medication.giveWithFood ? ' with food' : ''}`,
          data: {
            barklogReminderType: MEDICATION_REMINDER_TYPE,
            medicationId: medication.id,
            route: '/log/medication',
          },
          sound: true,
          title: `Time for ${medication.name}`,
        },
        identifier: `barklog-med-${medication.id}-${index}`,
        trigger: getMedicationReminderTrigger(medication, time),
      }),
    ),
  );
  const scheduledCount = scheduledResults.filter(
    (result) => result.status === 'fulfilled',
  ).length;

  if (scheduledCount === 0) {
    return {
      message:
        'Medication reminders are saved. Notification scheduling is not available in this environment.',
      scheduledCount: 0,
      status: 'unsupported',
    };
  }

  return {
    message: `${scheduledCount} medication reminder${
      scheduledCount === 1 ? '' : 's'
    } scheduled.`,
    scheduledCount,
    status: 'scheduled',
  };
}

export async function rescheduleMedicationRemindersForDog(dogId: string) {
  const medications = await listActiveMedicationsForDog(dogId);
  const results = await Promise.all(
    medications.map((medication) =>
      scheduleMedicationRemindersForMedication(medication),
    ),
  );
  const scheduledCount = results.reduce(
    (total, result) => total + result.scheduledCount,
    0,
  );

  return {
    message:
      scheduledCount > 0
        ? `${scheduledCount} medication reminders scheduled.`
        : 'Medication reminder settings are saved.',
    scheduledCount,
    status: scheduledCount > 0 ? 'scheduled' : 'skipped',
  } satisfies ReminderResult;
}
