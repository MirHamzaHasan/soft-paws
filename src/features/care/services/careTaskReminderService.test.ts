import * as Notifications from 'expo-notifications';

import { makeCareTaskModel } from '../../../../test/utils/builders';
import {
  ensureCareTaskNotificationPermission,
  scheduleCareTaskReminder,
} from './careTaskReminderService';

const mockQueueBarklogEvent = jest.fn();

jest.mock('@/features/observability', () => ({
  queueBarklogEvent: (...args: unknown[]) => mockQueueBarklogEvent(...args),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('expo-notifications', () => ({
  AndroidImportance: {
    DEFAULT: 'default',
  },
  SchedulableTriggerInputTypes: {
    DATE: 'date',
  },
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  getPermissionsAsync: jest.fn(async () => ({ granted: false })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  scheduleNotificationAsync: jest.fn(async () => 'notification-id'),
  setNotificationChannelAsync: jest.fn(async () => undefined),
}));

describe('care task reminder service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-04-27T09:00:00.000Z'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('records denied notification permission without blocking local task save', async () => {
    jest
      .mocked(Notifications.requestPermissionsAsync)
      .mockResolvedValueOnce({ granted: false } as never);

    await expect(ensureCareTaskNotificationPermission()).resolves.toEqual({
      granted: false,
      message:
        'Care tasks are saved, but notifications are disabled for BarkLog.',
      status: 'denied',
    });
    expect(mockQueueBarklogEvent).toHaveBeenCalledWith('permission_result', {
      capability: 'notifications',
      status: 'denied',
      surface: 'care_calendar_reminders',
    });
  });

  it('skips notification scheduling unless the reminder is explicitly enabled', async () => {
    await expect(
      scheduleCareTaskReminder(
        makeCareTaskModel({
          dueAt: '2026-04-28',
          reminderEnabled: false,
        }),
      ),
    ).resolves.toEqual({
      message: 'Care task is saved without a notification reminder.',
      scheduledCount: 0,
      status: 'skipped',
    });
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('schedules one future reminder when permission is granted', async () => {
    await expect(
      scheduleCareTaskReminder(
        makeCareTaskModel({
          dueAt: '2026-04-30',
          reminderEnabled: true,
          title: 'Refill prevention',
          type: 'parasite_prevention',
        }),
      ),
    ).resolves.toEqual({
      message: 'Care calendar reminder scheduled.',
      scheduledCount: 1,
      status: 'scheduled',
    });
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'barklog-care-care-task-1',
      }),
    );
  });
});
