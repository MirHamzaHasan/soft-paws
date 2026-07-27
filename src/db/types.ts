import type {
  SyncPullArgs,
  SyncPullResult,
  SyncPushArgs,
  SyncPushResult,
} from '@nozbe/watermelondb/sync';

import type { Database as SupabaseDatabase, Json } from '@/types/supabase';

export type BarklogSubscriptionTier =
  SupabaseDatabase['public']['Tables']['users']['Row']['subscription_tier'];
export type BarklogDogSex =
  SupabaseDatabase['public']['Tables']['dogs']['Row']['sex'];
export type BarklogEventType =
  SupabaseDatabase['public']['Tables']['events']['Row']['type'];
export type BarklogMedicationFrequency =
  SupabaseDatabase['public']['Tables']['medications']['Row']['frequency'];
export type BarklogExpenseCategory =
  SupabaseDatabase['public']['Tables']['expenses']['Row']['category'];
export type BarklogTrainingProgramCategory =
  SupabaseDatabase['public']['Tables']['training_programs']['Row']['category'];
export type BarklogTrainingProgramDifficulty =
  SupabaseDatabase['public']['Tables']['training_programs']['Row']['difficulty'];
export type BarklogTrainingEnrollmentStatus = NonNullable<
  SupabaseDatabase['public']['Tables']['dog_training_enrollments']['Row']['status']
>;
export type BarklogTrainingSessionDogMood =
  SupabaseDatabase['public']['Tables']['training_sessions']['Row']['dog_mood'];
export type BarklogCareTaskType =
  SupabaseDatabase['public']['Tables']['care_tasks']['Row']['type'];
export type BarklogCareTaskRecurrence =
  SupabaseDatabase['public']['Tables']['care_tasks']['Row']['recurrence'];
export type BarklogPhotoBaselineCategory =
  SupabaseDatabase['public']['Tables']['photo_baselines']['Row']['category'];

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

export type BarklogSyncPhase = 'error' | 'idle' | 'syncing';
export type BarklogSyncTrigger =
  | 'app_foreground'
  | 'auth_bootstrap'
  | 'local_write'
  | 'manual';
export type CloudSyncAccess = 'local_only' | 'premium_enabled' | 'unknown';
export type SyncCapabilityReason =
  | 'error'
  | 'loading'
  | 'local_only'
  | 'premium';

export type SyncCapability = {
  access: CloudSyncAccess;
  canPullFromCloud: boolean;
  canPushToCloud: boolean;
  canRestoreFromCloud: boolean;
  reason: SyncCapabilityReason;
};

export type BarklogSyncMetadata = {
  lastCloudSyncAccess?: CloudSyncAccess;
  lastLocalWriteAt?: number;
  lastPullCompletedAt?: number;
  lastPushCompletedAt?: number;
  lastSyncFinishedAt?: number;
  lastSyncAttemptAt?: number;
  lastSyncError?: string | null;
  lastSyncLocalChangeCount?: number;
  lastSyncRemoteChangeCount?: number;
  lastSyncSkippedReason?: Exclude<SyncCapabilityReason, 'premium'>;
  lastSyncTrigger?: BarklogSyncTrigger;
  phase: BarklogSyncPhase;
};

export type BarklogSyncStatusSnapshot = BarklogSyncMetadata & {
  pendingLocalChanges: boolean;
};

export type BarklogSyncPullRequest = SyncPullArgs;
export type BarklogSyncPullResponse = SyncPullResult;
export type BarklogSyncPushRequest = SyncPushArgs;
export type BarklogSyncPushResponse = SyncPushResult;
