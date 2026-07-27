import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

import type { TrainingSessionDogMood } from '@/types/training';

export class TrainingSessionModel extends Model {
  static table = 'training_sessions';

  static associations = {
    dog_training_enrollments: {
      type: 'belongs_to',
      key: 'enrollment_id',
    },
    dogs: { type: 'belongs_to', key: 'dog_id' },
    users: { type: 'belongs_to', key: 'user_id' },
  } as const;

  @field('completed_at') completedAt: number;

  @field('created_at') createdAt: number;

  @field('dog_id') dogId: string;

  @field('dog_mood') dogMood: TrainingSessionDogMood | null;

  @field('duration_min') durationMin: number | null;

  @field('enrollment_id') enrollmentId: string;

  @field('notes') notes: string | null;

  @field('success_rating') successRating: number | null;

  @text('step_id') stepId: string;

  @field('user_id') userId: string;
}
