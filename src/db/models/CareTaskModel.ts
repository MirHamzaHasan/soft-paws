import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

import type { CareTaskRecurrence, CareTaskType } from '@/types/care';

export class CareTaskModel extends Model {
  static table = 'care_tasks';

  static associations = {
    dogs: { type: 'belongs_to', key: 'dog_id' },
    medications: { type: 'belongs_to', key: 'related_medication_id' },
  } as const;

  @field('completed_at') completedAt: string | null;

  @field('created_at') createdAt: number;

  @field('dog_id') dogId: string;

  @field('due_at') dueAt: string;

  @field('recurrence') recurrence: CareTaskRecurrence;

  @field('related_medication_id') relatedMedicationId: string | null;

  @field('remaining_count') remainingCount: number | null;

  @field('reminder_enabled') reminderEnabled: boolean;

  @text('notes') notes: string | null;

  @text('title') title: string;

  @field('type') type: CareTaskType;

  @field('user_id') userId: string;
}
