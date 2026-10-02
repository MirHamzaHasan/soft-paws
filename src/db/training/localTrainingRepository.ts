/* eslint-disable no-param-reassign */
import { type Collection, Q } from '@nozbe/watermelondb';

import type { TrainingDetails } from '@/types/events';
import type {
  TrainingEnrollmentStatus,
  TrainingSessionDogMood,
} from '@/types/training';

import { getBarklogDatabase } from '../database';
import type {
  EventModel,
  TrainingEnrollmentModel,
  TrainingSessionModel,
} from '../models';
import type { UnixTimestampInput } from '../types';
import { toUnixTimestamp } from '../utils';

export type LocalTrainingEnrollmentInput = {
  completedAt?: UnixTimestampInput | null;
  currentStep?: number;
  dogId: string;
  programId: string;
  startedAt?: UnixTimestampInput;
  status?: TrainingEnrollmentStatus;
  userId: string;
};

export type UpdateLocalTrainingEnrollmentInput = Partial<
  Omit<LocalTrainingEnrollmentInput, 'dogId' | 'programId' | 'userId'>
> & {
  enrollmentId: string;
};

export type LocalTrainingSessionInput = {
  completedAt?: UnixTimestampInput;
  dogId: string;
  dogMood?: TrainingSessionDogMood | null;
  durationMin?: number | null;
  enrollmentId: string;
  notes?: string | null;
  stepId: string;
  successRating?: number | null;
  userId: string;
};

export type LocalTrainingSessionWithEventInput = LocalTrainingSessionInput & {
  programName: string;
  stepNumber: number;
  stepTitle: string;
};

function getTrainingEnrollmentCollection() {
  return getBarklogDatabase().get(
    'dog_training_enrollments',
  ) as Collection<TrainingEnrollmentModel>;
}

function getTrainingSessionCollection() {
  return getBarklogDatabase().get(
    'training_sessions',
  ) as Collection<TrainingSessionModel>;
}

function getEventCollection() {
  return getBarklogDatabase().get('events') as Collection<EventModel>;
}

export async function getLocalTrainingEnrollmentById(enrollmentId: string) {
  try {
    return await getTrainingEnrollmentCollection().find(enrollmentId);
  } catch {
    return null;
  }
}

export async function listLocalTrainingEnrollmentsForDog(dogId: string) {
  return getTrainingEnrollmentCollection()
    .query(
      Q.where('dog_id', dogId),
      Q.sortBy('created_at', Q.desc),
      Q.sortBy('started_at', Q.desc),
    )
    .fetch();
}

export async function createLocalTrainingEnrollment(
  input: LocalTrainingEnrollmentInput,
) {
  const database = getBarklogDatabase();
  const enrollmentCollection = getTrainingEnrollmentCollection();
  const now = Date.now();

  const enrollment = await database.write(
    async () =>
      enrollmentCollection.create((record) => {
        record.completedAt = toUnixTimestamp(input.completedAt) ?? null;
        record.createdAt = now;
        record.currentStep = input.currentStep ?? 1;
        record.dogId = input.dogId;
        record.programId = input.programId;
        record.startedAt = toUnixTimestamp(input.startedAt) ?? now;
        record.status = input.status ?? 'active';
        record.userId = input.userId;
      }),
    'createLocalTrainingEnrollment',
  );


  return enrollment;
}

export async function updateLocalTrainingEnrollment(
  input: UpdateLocalTrainingEnrollmentInput,
) {
  const database = getBarklogDatabase();
  const enrollmentCollection = getTrainingEnrollmentCollection();

  const enrollment = await database.write(async () => {
    const existingEnrollment = await enrollmentCollection.find(
      input.enrollmentId,
    );

    return existingEnrollment.update((record) => {
      if (input.completedAt !== undefined) {
        record.completedAt = toUnixTimestamp(input.completedAt);
      }

      if (input.currentStep !== undefined) {
        record.currentStep = input.currentStep;
      }

      if (input.startedAt !== undefined) {
        record.startedAt = toUnixTimestamp(input.startedAt) ?? record.startedAt;
      }

      if (input.status !== undefined) {
        record.status = input.status;
      }
    });
  }, 'updateLocalTrainingEnrollment');


  return enrollment;
}

export async function createLocalTrainingSession(
  input: LocalTrainingSessionInput,
) {
  const database = getBarklogDatabase();
  const sessionCollection = getTrainingSessionCollection();
  const now = Date.now();

  const session = await database.write(
    async () =>
      sessionCollection.create((record) => {
        record.completedAt = toUnixTimestamp(input.completedAt) ?? now;
        record.createdAt = now;
        record.dogId = input.dogId;
        record.dogMood = input.dogMood ?? null;
        record.durationMin = input.durationMin ?? null;
        record.enrollmentId = input.enrollmentId;
        record.notes = input.notes?.trim() || null;
        record.stepId = input.stepId;
        record.successRating = input.successRating ?? null;
        record.userId = input.userId;
      }),
    'createLocalTrainingSession',
  );


  return session;
}

function buildTrainingEventDetails(
  input: LocalTrainingSessionWithEventInput,
): TrainingDetails {
  return {
    enrollment_id: input.enrollmentId,
    program_name: input.programName,
    step_number: input.stepNumber,
    step_title: input.stepTitle,
    ...(input.durationMin !== undefined && input.durationMin !== null
      ? { duration_min: input.durationMin }
      : {}),
    ...(input.successRating !== undefined && input.successRating !== null
      ? { success_rating: input.successRating }
      : {}),
    ...(input.dogMood ? { dog_mood: input.dogMood } : {}),
  };
}

export async function createLocalTrainingSessionWithEvent(
  input: LocalTrainingSessionWithEventInput,
) {
  const database = getBarklogDatabase();
  const eventCollection = getEventCollection();
  const sessionCollection = getTrainingSessionCollection();
  const now = Date.now();
  const completedAt = toUnixTimestamp(input.completedAt) ?? now;
  const notes = input.notes?.trim() || null;

  const result = await database.write(async () => {
    const session = sessionCollection.prepareCreate((record) => {
      record.completedAt = completedAt;
      record.createdAt = now;
      record.dogId = input.dogId;
      record.dogMood = input.dogMood ?? null;
      record.durationMin = input.durationMin ?? null;
      record.enrollmentId = input.enrollmentId;
      record.notes = notes;
      record.stepId = input.stepId;
      record.successRating = input.successRating ?? null;
      record.userId = input.userId;
    });
    const event = eventCollection.prepareCreate((record) => {
      record.createdAt = now;
      record.details = buildTrainingEventDetails(input);
      record.dogId = input.dogId;
      record.loggedAt = completedAt;
      record.notes = notes;
      record.occurredAt = completedAt;
      record.photoUrl = null;
      record.synced = false;
      record.type = 'training';
      record.userId = input.userId;
    });

    await database.batch(session, event);

    return { event, session };
  }, 'createLocalTrainingSessionWithEvent');


  return result;
}

export async function listLocalTrainingSessionsForDog(dogId: string) {
  return getTrainingSessionCollection()
    .query(
      Q.where('dog_id', dogId),
      Q.sortBy('completed_at', Q.desc),
      Q.sortBy('created_at', Q.desc),
    )
    .fetch();
}

export async function listLocalTrainingSessionsForEnrollment(
  enrollmentId: string,
) {
  return getTrainingSessionCollection()
    .query(
      Q.where('enrollment_id', enrollmentId),
      Q.sortBy('completed_at', Q.desc),
      Q.sortBy('created_at', Q.desc),
    )
    .fetch();
}
