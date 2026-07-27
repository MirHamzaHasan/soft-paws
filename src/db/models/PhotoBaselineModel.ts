import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

import type { PhotoBaselineCategory } from '@/types/photoBaseline';

export class PhotoBaselineModel extends Model {
  static table = 'photo_baselines';

  static associations = {
    dogs: { type: 'belongs_to', key: 'dog_id' },
  } as const;

  @field('body_area') bodyArea: string | null;

  @field('captured_at') capturedAt: number;

  @field('category') category: PhotoBaselineCategory;

  @field('created_at') createdAt: number;

  @field('dog_id') dogId: string;

  @text('notes') notes: string | null;

  @field('photo_uri') photoUri: string | null;

  @text('title') title: string;

  @field('user_id') userId: string;
}
