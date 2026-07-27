/* eslint-disable no-param-reassign */
import { type Collection, Q } from '@nozbe/watermelondb';

import { getNextCareTaskDueAt } from '@/features/care/utils/careTaskSchedule';
import type { CareTaskRecurrence, CareTaskType } from '@/types/care';

import { getBarklogDatabase } from '../database';
import type { CareTaskModel } from '../models';
import { mergeBarklogSyncMetadata } from '../sync';

export type LocalCareTaskInput = {
  completedAt?: string | null;
  dogId: string;
  dueAt: string;
  notes?: string | null;
  recurrence?: CareTaskRecurrence;
  relatedMedicationId?: string | null;
  remainingCount?: number | null;
  reminderEnabled?: boolean;
  title: string;
  type: CareTaskType;
  userId: string;
};

export type UpdateLocalCareTaskInput = Partial<
  Omit<LocalCareTaskInput, 'dogId' | 'userId'>
> & {
  careTaskId: string;
};

function getCareTaskCollection() {
  return getBarklogDatabase().get('care_tasks') as Collection<CareTaskModel>;
}

export async function getLocalCareTaskById(careTaskId: string) {
  try {
    return await getCareTaskCollection().find(careTaskId);
  } catch {
    return null;
  }
}

export async function listLocalCareTasksForDog(dogId: string) {
  return getCareTaskCollection()
    .query(
      Q.where('dog_id', dogId),
      Q.sortBy('due_at', Q.asc),
      Q.sortBy('created_at', Q.desc),
    )
    .fetch();
}

export async function listOpenCareTasksForDog(dogId: string) {
  const tasks = await listLocalCareTasksForDog(dogId);

  return tasks.filter((task) => !task.completedAt);
}

export async function createLocalCareTask(input: LocalCareTaskInput) {
  const database = getBarklogDatabase();
  const careTaskCollection = getCareTaskCollection();
  const now = Date.now();

  const careTask = await database.write(
    async () =>
      careTaskCollection.create((record) => {
        record.completedAt = input.completedAt ?? null;
        record.createdAt = now;
        record.dogId = input.dogId;
        record.dueAt = input.dueAt;
        record.notes = input.notes?.trim() || null;
        record.recurrence = input.recurrence ?? 'none';
        record.relatedMedicationId = input.relatedMedicationId ?? null;
        record.remainingCount = input.remainingCount ?? null;
        record.reminderEnabled = input.reminderEnabled ?? false;
        record.title = input.title.trim();
        record.type = input.type;
        record.userId = input.userId;
      }),
    'createLocalCareTask',
  );

  await mergeBarklogSyncMetadata(database, {
    lastLocalWriteAt: now,
  });

  return careTask;
}

export async function updateLocalCareTask(input: UpdateLocalCareTaskInput) {
  const database = getBarklogDatabase();
  const careTaskCollection = getCareTaskCollection();
  const now = Date.now();

  const careTask = await database.write(async () => {
    const existingCareTask = await careTaskCollection.find(input.careTaskId);

    return existingCareTask.update((record) => {
      if (input.completedAt !== undefined) {
        record.completedAt = input.completedAt;
      }

      if (input.dueAt !== undefined) {
        record.dueAt = input.dueAt;
      }

      if (input.notes !== undefined) {
        record.notes = input.notes?.trim() || null;
      }

      if (input.recurrence !== undefined) {
        record.recurrence = input.recurrence;
      }

      if (input.relatedMedicationId !== undefined) {
        record.relatedMedicationId = input.relatedMedicationId;
      }

      if (input.remainingCount !== undefined) {
        record.remainingCount = input.remainingCount;
      }

      if (input.reminderEnabled !== undefined) {
        record.reminderEnabled = input.reminderEnabled;
      }

      if (input.title !== undefined) {
        record.title = input.title.trim();
      }

      if (input.type !== undefined) {
        record.type = input.type;
      }
    });
  }, 'updateLocalCareTask');

  await mergeBarklogSyncMetadata(database, {
    lastLocalWriteAt: now,
  });

  return careTask;
}

export async function completeLocalCareTask(input: {
  careTaskId: string;
  completedAt?: Date;
}) {
  const database = getBarklogDatabase();
  const careTaskCollection = getCareTaskCollection();
  const now = Date.now();
  const completedAt = input.completedAt ?? new Date();

  const careTask = await database.write(async () => {
    const existingCareTask = await careTaskCollection.find(input.careTaskId);
    const nextDueAt = getNextCareTaskDueAt({
      completedAt,
      dueAt: existingCareTask.dueAt,
      recurrence: existingCareTask.recurrence,
    });

    return existingCareTask.update((record) => {
      if (nextDueAt) {
        record.completedAt = null;
        record.dueAt = nextDueAt;
      } else {
        record.completedAt = completedAt.toISOString();
      }
    });
  }, 'completeLocalCareTask');

  await mergeBarklogSyncMetadata(database, {
    lastLocalWriteAt: now,
  });

  return careTask;
}
