/* eslint-disable no-param-reassign */
import { type Collection, Q } from '@nozbe/watermelondb';

import { getBarklogDatabase } from '../database';
import type { MedicationModel } from '../models';
import type { BarklogMedicationFrequency } from '../types';

export type LocalMedicationFrequency = Exclude<
  BarklogMedicationFrequency,
  null
>;

type LocalMedicationInput = {
  active?: boolean;
  dogId: string;
  doseMg?: number | null;
  endDate?: string | null;
  frequency: LocalMedicationFrequency;
  giveWithFood: boolean;
  name: string;
  notes?: string | null;
  refillDate?: string | null;
  scheduleTimes: string[];
  startDate?: string | null;
};

type UpdateLocalMedicationInput = Partial<
  Omit<LocalMedicationInput, 'dogId'>
> & {
  medicationId: string;
};

function getMedicationCollection() {
  return getBarklogDatabase().get('medications') as Collection<MedicationModel>;
}

export async function getLocalMedicationById(medicationId: string) {
  try {
    return await getMedicationCollection().find(medicationId);
  } catch {
    return null;
  }
}

export async function listActiveMedicationsForDog(dogId: string) {
  return getMedicationCollection()
    .query(
      Q.where('dog_id', dogId),
      Q.where('active', true),
      Q.sortBy('name', Q.asc),
    )
    .fetch();
}

export async function createLocalMedication(input: LocalMedicationInput) {
  const database = getBarklogDatabase();
  const medicationCollection = getMedicationCollection();
  const now = Date.now();

  const medication = await database.write(
    async () =>
      medicationCollection.create((record) => {
        record.active = input.active ?? true;
        record.createdAt = now;
        record.dogId = input.dogId;
        record.doseMg = input.doseMg ?? null;
        record.endDate = input.endDate ?? null;
        record.frequency = input.frequency;
        record.giveWithFood = input.giveWithFood;
        record.name = input.name;
        record.notes = input.notes ?? null;
        record.refillDate = input.refillDate ?? null;
        record.scheduleTimes = input.scheduleTimes;
        record.startDate = input.startDate ?? null;
      }),
    'createLocalMedication',
  );


  return medication;
}

export async function updateLocalMedication(input: UpdateLocalMedicationInput) {
  const database = getBarklogDatabase();
  const medicationCollection = getMedicationCollection();

  const medication = await database.write(async () => {
    const existingMedication = await medicationCollection.find(
      input.medicationId,
    );

    return existingMedication.update((record) => {
      if (input.active !== undefined) {
        record.active = input.active;
      }

      if (input.doseMg !== undefined) {
        record.doseMg = input.doseMg;
      }

      if (input.endDate !== undefined) {
        record.endDate = input.endDate;
      }

      if (input.frequency !== undefined) {
        record.frequency = input.frequency;
      }

      if (input.giveWithFood !== undefined) {
        record.giveWithFood = input.giveWithFood;
      }

      if (input.name !== undefined) {
        record.name = input.name;
      }

      if (input.notes !== undefined) {
        record.notes = input.notes;
      }

      if (input.refillDate !== undefined) {
        record.refillDate = input.refillDate;
      }

      if (input.scheduleTimes !== undefined) {
        record.scheduleTimes = input.scheduleTimes;
      }

      if (input.startDate !== undefined) {
        record.startDate = input.startDate;
      }
    });
  }, 'updateLocalMedication');


  return medication;
}

export async function deactivateLocalMedication(medicationId: string) {
  return updateLocalMedication({
    active: false,
    medicationId,
  });
}
