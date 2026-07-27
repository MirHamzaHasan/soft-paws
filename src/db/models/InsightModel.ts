import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

export class InsightModel extends Model {
  static table = 'insights';

  static associations = {
    dogs: { type: 'belongs_to', key: 'dog_id' },
  } as const;

  @text('content') content: string;

  @field('dog_id') dogId: string;

  @field('generated_at') generatedAt: number | null;

  @field('prompt_version') promptVersion: string | null;

  @text('week_start') weekStart: string;
}
