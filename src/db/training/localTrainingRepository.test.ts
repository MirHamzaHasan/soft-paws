import { getBarklogDatabase } from '@/db/database';
import {
  createLocalTrainingEnrollment,
  createLocalTrainingSession,
  createLocalTrainingSessionWithEvent,
  updateLocalTrainingEnrollment,
} from '@/db/training';

import { createWatermelonWriteHarness } from '../../../test/utils/watermelon';

jest.mock('@/db/database', () => ({
  getBarklogDatabase: jest.fn(),
}));

type LocalEnrollmentWriteRecord = {
  completedAt?: number | null;
  createdAt?: number;
  currentStep?: number;
  dogId?: string;
  programId?: string;
  startedAt?: number;
  status?: string;
  userId?: string;
};

type LocalSessionWriteRecord = {
  completedAt?: number;
  createdAt?: number;
  dogId?: string;
  dogMood?: string | null;
  durationMin?: number | null;
  enrollmentId?: string;
  notes?: string | null;
  stepId?: string;
  successRating?: number | null;
  userId?: string;
};

type LocalTrainingEventWriteRecord = {
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

describe('local training repository', () => {
  const now = Date.parse('2026-04-27T10:00:00.000Z');

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates enrollments locally on device', async () => {
    const { database, record } =
      createWatermelonWriteHarness<LocalEnrollmentWriteRecord>();
    const startedAt = Date.parse('2026-04-26T08:00:00.000Z');

    getBarklogDatabaseMock.mockReturnValue(
      database as unknown as ReturnType<typeof getBarklogDatabase>,
    );

    const enrollment = await createLocalTrainingEnrollment({
      currentStep: 2,
      dogId: 'dog-1',
      programId: 'program-1',
      startedAt,
      status: 'active',
      userId: 'user-1',
    });

    expect(enrollment).toBe(record);
    expect(database.get).toHaveBeenCalledWith('dog_training_enrollments');
    expect(database.write).toHaveBeenCalledWith(
      expect.any(Function),
      'createLocalTrainingEnrollment',
    );
    expect(record).toMatchObject({
      completedAt: null,
      createdAt: now,
      currentStep: 2,
      dogId: 'dog-1',
      programId: 'program-1',
      startedAt,
      status: 'active',
      userId: 'user-1',
    });
  });

  it('creates training sessions locally with mood and rating fields', async () => {
    const { database, record } =
      createWatermelonWriteHarness<LocalSessionWriteRecord>();

    getBarklogDatabaseMock.mockReturnValue(
      database as unknown as ReturnType<typeof getBarklogDatabase>,
    );

    await createLocalTrainingSession({
      dogId: 'dog-1',
      dogMood: 'calm',
      durationMin: 12,
      enrollmentId: 'enrollment-1',
      notes: '  Relaxed in the first reps.  ',
      stepId: 'step-1',
      successRating: 4,
      userId: 'user-1',
    });

    expect(database.get).toHaveBeenCalledWith('training_sessions');
    expect(record).toMatchObject({
      completedAt: now,
      createdAt: now,
      dogId: 'dog-1',
      dogMood: 'calm',
      durationMin: 12,
      enrollmentId: 'enrollment-1',
      notes: 'Relaxed in the first reps.',
      stepId: 'step-1',
      successRating: 4,
      userId: 'user-1',
    });
  });

  it('creates a training session and matching timeline event in one local write', async () => {
    const sessionRecord = {} as LocalSessionWriteRecord;
    const eventRecord = {} as LocalTrainingEventWriteRecord;
    const sessionCollection = {
      prepareCreate: jest.fn(
        (builder: (record: LocalSessionWriteRecord) => void) => {
          builder(sessionRecord);

          return sessionRecord;
        },
      ),
    };
    const eventCollection = {
      prepareCreate: jest.fn(
        (builder: (record: LocalTrainingEventWriteRecord) => void) => {
          builder(eventRecord);

          return eventRecord;
        },
      ),
    };
    const database = {
      batch: jest.fn(async () => undefined),
      get: jest.fn((table: string) =>
        table === 'training_sessions' ? sessionCollection : eventCollection,
      ),
      localStorage: {
        get: jest.fn(async () => undefined),
        set: jest.fn(async () => undefined),
      },
      write: jest.fn(async (work: () => unknown) => work()),
    };

    getBarklogDatabaseMock.mockReturnValue(
      database as unknown as ReturnType<typeof getBarklogDatabase>,
    );

    const result = await createLocalTrainingSessionWithEvent({
      dogId: 'dog-1',
      dogMood: 'calm',
      durationMin: 12,
      enrollmentId: 'enrollment-1',
      notes: '  Three calm reps. ',
      programName: 'Loose leash walking',
      stepId: 'step-1',
      stepNumber: 3,
      stepTitle: 'Add mild distractions',
      successRating: 4,
      userId: 'user-1',
    });

    expect(result).toEqual({
      event: eventRecord,
      session: sessionRecord,
    });
    expect(database.get).toHaveBeenCalledWith('events');
    expect(database.get).toHaveBeenCalledWith('training_sessions');
    expect(database.write).toHaveBeenCalledWith(
      expect.any(Function),
      'createLocalTrainingSessionWithEvent',
    );
    expect(database.batch).toHaveBeenCalledWith(sessionRecord, eventRecord);
    expect(sessionRecord).toMatchObject({
      completedAt: now,
      createdAt: now,
      dogId: 'dog-1',
      dogMood: 'calm',
      durationMin: 12,
      enrollmentId: 'enrollment-1',
      notes: 'Three calm reps.',
      stepId: 'step-1',
      successRating: 4,
      userId: 'user-1',
    });
    expect(eventRecord).toMatchObject({
      createdAt: now,
      details: {
        dog_mood: 'calm',
        duration_min: 12,
        enrollment_id: 'enrollment-1',
        program_name: 'Loose leash walking',
        step_number: 3,
        step_title: 'Add mild distractions',
        success_rating: 4,
      },
      dogId: 'dog-1',
      loggedAt: now,
      notes: 'Three calm reps.',
      occurredAt: now,
      photoUrl: null,
      synced: false,
      type: 'training',
      userId: 'user-1',
    });
  });

  it('does not record sync metadata when the timeline event cannot be prepared', async () => {
    const sessionCollection = {
      prepareCreate: jest.fn(
        (builder: (record: LocalSessionWriteRecord) => void) => {
          const sessionRecord = {} as LocalSessionWriteRecord;
          builder(sessionRecord);

          return sessionRecord;
        },
      ),
    };
    const eventCollection = {
      prepareCreate: jest.fn(() => {
        throw new Error('event failed');
      }),
    };
    const database = {
      batch: jest.fn(async () => undefined),
      get: jest.fn((table: string) =>
        table === 'training_sessions' ? sessionCollection : eventCollection,
      ),
      localStorage: {
        get: jest.fn(async () => undefined),
        set: jest.fn(async () => undefined),
      },
      write: jest.fn(async (work: () => unknown) => work()),
    };

    getBarklogDatabaseMock.mockReturnValue(
      database as unknown as ReturnType<typeof getBarklogDatabase>,
    );

    await expect(
      createLocalTrainingSessionWithEvent({
        dogId: 'dog-1',
        durationMin: 10,
        enrollmentId: 'enrollment-1',
        programName: 'Recall',
        stepId: 'step-1',
        stepNumber: 1,
        stepTitle: 'Name game',
        successRating: 3,
        userId: 'user-1',
      }),
    ).rejects.toThrow('event failed');

    expect(database.batch).not.toHaveBeenCalled();
  });

  it('updates enrollment progress locally on device', async () => {
    const record: LocalEnrollmentWriteRecord & {
      update: jest.Mock<
        LocalEnrollmentWriteRecord,
        [(nextRecord: LocalEnrollmentWriteRecord) => void]
      >;
    } = {
      completedAt: null,
      currentStep: 2,
      status: 'active',
      update: jest.fn((builder) => {
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

    const completedAt = Date.parse('2026-04-27T10:30:00.000Z');
    await updateLocalTrainingEnrollment({
      completedAt,
      currentStep: 7,
      enrollmentId: 'enrollment-1',
      status: 'completed',
    });

    expect(database.get).toHaveBeenCalledWith('dog_training_enrollments');
    expect(collection.find).toHaveBeenCalledWith('enrollment-1');
    expect(database.write).toHaveBeenCalledWith(
      expect.any(Function),
      'updateLocalTrainingEnrollment',
    );
    expect(record).toMatchObject({
      completedAt,
      currentStep: 7,
      status: 'completed',
    });
  });
});
