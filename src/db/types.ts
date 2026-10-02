import type { Database as LocalRecordDatabase, Json } from '@/types/local';

export type BarklogSubscriptionTier =
  LocalRecordDatabase['public']['Tables']['users']['Row']['subscription_tier'];
export type BarklogDogSex =
  LocalRecordDatabase['public']['Tables']['dogs']['Row']['sex'];
export type BarklogEventType =
  LocalRecordDatabase['public']['Tables']['events']['Row']['type'];
export type BarklogMedicationFrequency =
  LocalRecordDatabase['public']['Tables']['medications']['Row']['frequency'];
export type BarklogExpenseCategory =
  LocalRecordDatabase['public']['Tables']['expenses']['Row']['category'];
export type BarklogTrainingProgramCategory =
  LocalRecordDatabase['public']['Tables']['training_programs']['Row']['category'];
export type BarklogTrainingProgramDifficulty =
  LocalRecordDatabase['public']['Tables']['training_programs']['Row']['difficulty'];
export type BarklogTrainingEnrollmentStatus = NonNullable<
  LocalRecordDatabase['public']['Tables']['dog_training_enrollments']['Row']['status']
>;
export type BarklogTrainingSessionDogMood =
  LocalRecordDatabase['public']['Tables']['training_sessions']['Row']['dog_mood'];
export type BarklogCareTaskType =
  LocalRecordDatabase['public']['Tables']['care_tasks']['Row']['type'];
export type BarklogCareTaskRecurrence =
  LocalRecordDatabase['public']['Tables']['care_tasks']['Row']['recurrence'];
export type BarklogPhotoBaselineCategory =
  LocalRecordDatabase['public']['Tables']['photo_baselines']['Row']['category'];

export type UnixTimestampInput = Date | number;

export type LocalEventWriteSource = 'detail' | 'import' | 'instant' | 'sync';

export type CreateLocalEventInput = {
  createdAt?: UnixTimestampInput;
  details?: Json;
  dogId: string;
  loggedAt?: UnixTimestampInput;
  notes?: string | null;
  occurredAt?: UnixTimestampInput;
  photoUrl?: string | null;
  source?: LocalEventWriteSource;
  synced?: boolean;
  type: BarklogEventType;
  userId: string;
};
