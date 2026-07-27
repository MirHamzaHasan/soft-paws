import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

import type { TrainingEnrollmentStatus } from '@/types/training';

export class TrainingEnrollmentModel extends Model {
  static table = 'dog_training_enrollments';

  static associations = {
    dogs: { type: 'belongs_to', key: 'dog_id' },
    users: { type: 'belongs_to', key: 'user_id' },
  } as const;

  @field('completed_at') completedAt: number | null;

  @field('created_at') createdAt: number;

  @field('current_step') currentStep: number;

  @field('dog_id') dogId: string;

  @text('program_id') programId: string;

  @field('started_at') startedAt: number;

  @text('status') status: TrainingEnrollmentStatus;

  @field('user_id') userId: string;
}
