import { getBarklogDatabase } from '@/db/database';
import { createLocalEvent } from '@/db/events/createLocalEvent';
import { mergeBarklogSyncMetadata } from '@/db/sync';

import { createWatermelonWriteHarness } from '../../../test/utils/watermelon';

jest.mock('@/db/database', () => ({
  getBarklogDatabase: jest.fn(),
}));

jest.mock('@/db/sync', () => ({
  mergeBarklogSyncMetadata: jest.fn(),
}));

type LocalEventWriteRecord = {
  createdAt?: number;
  details?: unknown;
  dogId?: string;
  loggedAt?: number;
  notes?: string | null;
  occurredAt?: number;
  photoUrl?: string | null;
  synced?: boolean;
  type?: string;
  userId?: string;
};

const getBarklogDatabaseMock = jest.mocked(getBarklogDatabase);
const mergeBarklogSyncMetadataMock = jest.mocked(mergeBarklogSyncMetadata);

describe('createLocalEvent', () => {
  const now = Date.parse('2026-04-26T12:00:00.000Z');

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
    mergeBarklogSyncMetadataMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('persists a local event before sync and records local write metadata', async () => {
    const { database, record } =
      createWatermelonWriteHarness<LocalEventWriteRecord>();

    getBarklogDatabaseMock.mockReturnValue(
      database as unknown as ReturnType<typeof getBarklogDatabase>,
    );

    const occurredAt = Date.parse('2026-04-26T09:30:00.000Z');
    const loggedAt = new Date('2026-04-26T09:31:00.000Z');
    const event = await createLocalEvent({
      details: {
        duration_min: 25,
      },
      dogId: 'dog-1',
      loggedAt,
      notes: 'Morning walk',
      occurredAt,
      photoUrl: 'https://example.invalid/walk.jpg',
      synced: false,
      type: 'walk',
      userId: 'user-1',
    });

    expect(event).toBe(record);
    expect(database.get).toHaveBeenCalledWith('events');
    expect(database.write).toHaveBeenCalledWith(
      expect.any(Function),
      'createLocalEvent',
    );
    expect(record).toEqual({
      createdAt: now,
      details: {
        duration_min: 25,
      },
      dogId: 'dog-1',
      loggedAt: loggedAt.getTime(),
      notes: 'Morning walk',
      occurredAt,
      photoUrl: 'https://example.invalid/walk.jpg',
      synced: false,
      type: 'walk',
      userId: 'user-1',
    });
    expect(mergeBarklogSyncMetadataMock).toHaveBeenCalledWith(database, {
      lastLocalWriteAt: now,
    });
  });

  it('defaults optional fields so quick logging remains offline-first', async () => {
    const { database, record } =
      createWatermelonWriteHarness<LocalEventWriteRecord>();

    getBarklogDatabaseMock.mockReturnValue(
      database as unknown as ReturnType<typeof getBarklogDatabase>,
    );

    await createLocalEvent({
      dogId: 'dog-1',
      type: 'pee',
      userId: 'user-1',
    });

    expect(record).toMatchObject({
      createdAt: now,
      details: {},
      dogId: 'dog-1',
      loggedAt: now,
      notes: null,
      occurredAt: now,
      photoUrl: null,
      synced: false,
      type: 'pee',
      userId: 'user-1',
    });
  });

  it('persists mood detail contracts as local event JSON', async () => {
    const { database, record } =
      createWatermelonWriteHarness<LocalEventWriteRecord>();

    getBarklogDatabaseMock.mockReturnValue(
      database as unknown as ReturnType<typeof getBarklogDatabase>,
    );

    await createLocalEvent({
      details: {
        energy: 'normal',
        mood: 'calm',
      },
      dogId: 'dog-1',
      type: 'mood',
      userId: 'user-1',
    });

    expect(record).toMatchObject({
      details: {
        energy: 'normal',
        mood: 'calm',
      },
      type: 'mood',
    });
  });

  it('persists behavior detail contracts as local event JSON', async () => {
    const { database, record } =
      createWatermelonWriteHarness<LocalEventWriteRecord>();

    getBarklogDatabaseMock.mockReturnValue(
      database as unknown as ReturnType<typeof getBarklogDatabase>,
    );

    await createLocalEvent({
      details: {
        behavior: 'barking',
        intensity: 'moderate',
        trigger: 'guests',
      },
      dogId: 'dog-1',
      type: 'behavior',
      userId: 'user-1',
    });

    expect(record).toMatchObject({
      details: {
        behavior: 'barking',
        intensity: 'moderate',
        trigger: 'guests',
      },
      type: 'behavior',
    });
  });

  it('persists training detail contracts as local event JSON', async () => {
    const { database, record } =
      createWatermelonWriteHarness<LocalEventWriteRecord>();

    getBarklogDatabaseMock.mockReturnValue(
      database as unknown as ReturnType<typeof getBarklogDatabase>,
    );

    await createLocalEvent({
      details: {
        dog_mood: 'calm',
        duration_min: 10,
        enrollment_id: 'enrollment-1',
        program_name: 'Sit & stay foundations',
        step_number: 2,
        step_title: 'Build the stay cue',
        success_rating: 4,
      },
      dogId: 'dog-1',
      type: 'training',
      userId: 'user-1',
    });

    expect(record).toMatchObject({
      details: {
        dog_mood: 'calm',
        duration_min: 10,
        enrollment_id: 'enrollment-1',
        program_name: 'Sit & stay foundations',
        step_number: 2,
        step_title: 'Build the stay cue',
        success_rating: 4,
      },
      type: 'training',
    });
  });
});
