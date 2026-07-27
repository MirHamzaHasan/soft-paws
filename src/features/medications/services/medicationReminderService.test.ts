import * as Notifications from 'expo-notifications';

import type { MedicationModel } from '@/db';
import {
  ensureMedicationNotificationPermission,
  scheduleMedicationRemindersForMedication,
} from '@/features/medications/services/medicationReminderService';

import { makeMedicationModel } from '../../../../test/utils/builders';

const mockQueueBarklogEvent = jest.fn();

jest.mock('@/features/observability', () => ({
  queueBarklogEvent: (...args: unknown[]) => mockQueueBarklogEvent(...args),
}));

jest.mock('@/db', () => ({
  listActiveMedicationsForDog: jest.fn(async () => []),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('expo-notifications', () => ({
  AndroidImportance: {
    HIGH: 'high',
  },
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
    TIME_INTERVAL: 'timeInterval',
    WEEKLY: 'weekly',
  },
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  getPermissionsAsync: jest.fn(async () => ({ granted: false })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  scheduleNotificationAsync: jest.fn(async () => 'notification-id'),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  setNotificationHandler: jest.fn(),
}));

function makeScheduledMedication(
  overrides: Partial<MedicationModel> = {},
): MedicationModel {
  return makeMedicationModel({
    active: true,
    frequency: 'daily',
    scheduleTimes: ['08:00', '20:00'],
    ...overrides,
  });
}

describe('medication reminder native behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('records denied notification permissions and does not schedule reminders', async () => {
    jest
      .mocked(Notifications.requestPermissionsAsync)
      .mockResolvedValueOnce({ granted: false } as never);

    await expect(ensureMedicationNotificationPermission()).resolves.toEqual({
      granted: false,
      message:
        'Medication reminders are saved, but notifications are disabled for BarkLog.',
      status: 'denied',
    });

    expect(mockQueueBarklogEvent).toHaveBeenCalledWith('permission_result', {
      capability: 'notifications',
      status: 'denied',
      surface: 'medication_reminders',
    });
  });

  it('fails safely when native scheduling rejects every reminder', async () => {
    jest
      .mocked(Notifications.scheduleNotificationAsync)
      .mockRejectedValue(new Error('native scheduler unavailable'));

    await expect(
      scheduleMedicationRemindersForMedication(makeScheduledMedication()),
    ).resolves.toEqual({
      message:
        'Medication reminders are saved. Notification scheduling is not available in this environment.',
      scheduledCount: 0,
      status: 'unsupported',
    });
  });

  it('returns the scheduled reminder count when at least one reminder schedules', async () => {
    jest
      .mocked(Notifications.scheduleNotificationAsync)
      .mockResolvedValueOnce('first-notification')
      .mockRejectedValueOnce(new Error('second failed'));

    await expect(
      scheduleMedicationRemindersForMedication(makeScheduledMedication()),
    ).resolves.toEqual({
      message: '1 medication reminder scheduled.',
      scheduledCount: 1,
      status: 'scheduled',
    });
  });
});
