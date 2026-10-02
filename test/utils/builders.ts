import type { BarklogDogRow, BarklogUserRow } from '@/api/localProfile';
import type {
  CareTaskModel,
  EventModel,
  ExpenseModel,
  MedicationModel,
  PhotoBaselineModel,
} from '@/db';

export function makeDogRow(
  overrides: Partial<BarklogDogRow> = {},
): BarklogDogRow {
  return {
    birthdate: '2021-04-15',
    breed: 'Rescue mix',
    created_at: '2026-04-01T00:00:00.000Z',
    id: 'dog-1',
    is_primary: true,
    name: 'Milo',
    photo_url: null,
    sex: 'neutered_male',
    user_id: 'user-1',
    weight_lbs: 28.5,
    ...overrides,
  };
}

export function makeUserRow(
  overrides: Partial<BarklogUserRow> = {},
): BarklogUserRow {
  return {
    created_at: '2026-04-01T00:00:00.000Z',
    email: 'caregiver@example.com',
    id: 'user-1',
    revenuecat_user_id: null,
    subscription_tier: 'trial',
    trial_ends_at: '2099-05-03T00:00:00.000Z',
    ...overrides,
  };
}

export function makeEventModel(
  overrides: Partial<EventModel> = {},
): EventModel {
  return {
    createdAt: Date.parse('2026-04-26T08:00:00.000Z'),
    details: {},
    dogId: 'dog-1',
    id: 'event-1',
    loggedAt: Date.parse('2026-04-26T08:02:00.000Z'),
    notes: null,
    occurredAt: Date.parse('2026-04-26T08:00:00.000Z'),
    photoUrl: null,
    synced: false,
    type: 'meal',
    userId: 'user-1',
    ...overrides,
  } as EventModel;
}

export function makeExpenseModel(
  overrides: Partial<ExpenseModel> = {},
): ExpenseModel {
  return {
    amount: 42.5,
    category: 'vet',
    createdAt: Date.parse('2026-04-26T08:00:00.000Z'),
    date: '2026-04-26',
    description: 'Wellness visit',
    dogId: 'dog-1',
    id: 'expense-1',
    receiptPhotoUrl: null,
    userId: 'user-1',
    ...overrides,
  } as ExpenseModel;
}

export function makeMedicationModel(
  overrides: Partial<MedicationModel> = {},
): MedicationModel {
  return {
    active: true,
    createdAt: Date.parse('2026-04-26T08:00:00.000Z'),
    dogId: 'dog-1',
    doseMg: 5,
    endDate: null,
    frequency: 'daily',
    giveWithFood: true,
    id: 'medication-1',
    name: 'Carprofen',
    notes: null,
    refillDate: null,
    scheduleTimes: ['08:00'],
    startDate: '2026-04-26',
    ...overrides,
  } as MedicationModel;
}

export function makeCareTaskModel(
  overrides: Partial<CareTaskModel> = {},
): CareTaskModel {
  return {
    completedAt: null,
    createdAt: Date.parse('2026-04-26T08:00:00.000Z'),
    dogId: 'dog-1',
    dueAt: '2026-04-30',
    id: 'care-task-1',
    notes: null,
    recurrence: 'none',
    relatedMedicationId: null,
    remainingCount: null,
    reminderEnabled: false,
    title: 'Book grooming',
    type: 'grooming',
    userId: 'user-1',
    ...overrides,
  } as CareTaskModel;
}

export function makePhotoBaselineModel(
  overrides: Partial<PhotoBaselineModel> = {},
): PhotoBaselineModel {
  return {
    bodyArea: 'left ear',
    capturedAt: Date.parse('2026-04-26T08:00:00.000Z'),
    category: 'skin',
    createdAt: Date.parse('2026-04-26T08:02:00.000Z'),
    dogId: 'dog-1',
    id: 'photo-baseline-1',
    notes: null,
    photoUri: 'local-photo://baseline/skin/1',
    title: 'Left ear reference',
    userId: 'user-1',
    ...overrides,
  } as PhotoBaselineModel;
}
