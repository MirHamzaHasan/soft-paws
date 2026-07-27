import {
  completeLocalCareTask,
  createLocalCareTask,
  updateLocalCareTask,
} from '@/db/care';
import { getBarklogDatabase } from '@/db/database';
import { mergeBarklogSyncMetadata } from '@/db/sync';

import { createWatermelonWriteHarness } from '../../../test/utils/watermelon';

jest.mock('@/db/database', () => ({
  getBarklogDatabase: jest.fn(),
}));

jest.mock('@/db/sync', () => ({
  mergeBarklogSyncMetadata: jest.fn(),
}));

type LocalCareTaskWriteRecord = {
  completedAt?: string | null;
  createdAt?: number;
  dogId?: string;
  dueAt?: string;
  notes?: string | null;
  recurrence?: string;
  relatedMedicationId?: string | null;
  remainingCount?: number | null;
  reminderEnabled?: boolean;
  title?: string;
  type?: string;
  update?: jest.Mock;
  userId?: string;
};

const getBarklogDatabaseMock = jest.mocked(getBarklogDatabase);
const mergeBarklogSyncMetadataMock = jest.mocked(mergeBarklogSyncMetadata);

describe('local care task repository', () => {
  const now = Date.parse('2026-04-27T10:00:00.000Z');

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
    mergeBarklogSyncMetadataMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates local care tasks with refill planning fields before sync', async () => {
    const { database, record } =
      createWatermelonWriteHarness<LocalCareTaskWriteRecord>();

    getBarklogDatabaseMock.mockReturnValue(
      database as unknown as ReturnType<typeof getBarklogDatabase>,
    );

    const careTask = await createLocalCareTask({
      dogId: 'dog-1',
      dueAt: '2026-05-02',
      notes: '  Order before the weekend. ',
      recurrence: 'monthly',
      relatedMedicationId: 'medication-1',
      remainingCount: 5,
      reminderEnabled: true,
      title: 'Refill Carprofen',
      type: 'medication_refill',
      userId: 'user-1',
    });

    expect(careTask).toBe(record);
    expect(database.get).toHaveBeenCalledWith('care_tasks');
    expect(record).toMatchObject({
      completedAt: null,
      createdAt: now,
      dogId: 'dog-1',
      dueAt: '2026-05-02',
      notes: 'Order before the weekend.',
      recurrence: 'monthly',
      relatedMedicationId: 'medication-1',
      remainingCount: 5,
      reminderEnabled: true,
      title: 'Refill Carprofen',
      type: 'medication_refill',
      userId: 'user-1',
    });
    expect(mergeBarklogSyncMetadataMock).toHaveBeenCalledWith(database, {
      lastLocalWriteAt: now,
    });
  });

  it('updates a local care task without overwriting unspecified fields', async () => {
    const record: LocalCareTaskWriteRecord = {
      dueAt: '2026-05-02',
      notes: 'Original',
      title: 'Refill medication',
      update: jest.fn((builder: (next: LocalCareTaskWriteRecord) => void) => {
        builder(record);

        return record;
      }),
    };
    const collection = {
      find: jest.fn(async () => record),
    };
    const database = {
      get: jest.fn(() => collection),
      localStorage: {
        get: jest.fn(async () => undefined),
        set: jest.fn(async () => undefined),
      },
      write: jest.fn(async (work: () => unknown) => work()),
    };

    getBarklogDatabaseMock.mockReturnValue(
      database as unknown as ReturnType<typeof getBarklogDatabase>,
    );

    await updateLocalCareTask({
      careTaskId: 'task-1',
      notes: '  Updated note ',
    });

    expect(record.update).toHaveBeenCalled();
    expect(record).toMatchObject({
      dueAt: '2026-05-02',
      notes: 'Updated note',
      title: 'Refill medication',
    });
  });

  it('advances recurring tasks instead of marking them complete', async () => {
    const record: LocalCareTaskWriteRecord = {
      completedAt: null,
      dueAt: '2026-04-20',
      recurrence: 'weekly',
      update: jest.fn((builder: (next: LocalCareTaskWriteRecord) => void) => {
        builder(record);

        return record;
      }),
    };
    const collection = {
      find: jest.fn(async () => record),
    };
    const database = {
      get: jest.fn(() => collection),
      localStorage: {
        get: jest.fn(async () => undefined),
        set: jest.fn(async () => undefined),
      },
      write: jest.fn(async (work: () => unknown) => work()),
    };

    getBarklogDatabaseMock.mockReturnValue(
      database as unknown as ReturnType<typeof getBarklogDatabase>,
    );

    await completeLocalCareTask({
      careTaskId: 'task-1',
      completedAt: new Date('2026-04-27T10:00:00.000Z'),
    });

    expect(record.completedAt).toBeNull();
    expect(record.dueAt).toBe('2026-05-04');
  });
});
