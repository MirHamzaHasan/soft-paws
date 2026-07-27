import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

import type { BarklogDogSex } from '../types';

export class DogModel extends Model {
  static table = 'dogs';

  static associations = {
    users: { type: 'belongs_to', key: 'user_id' },
    events: { type: 'has_many', foreignKey: 'dog_id' },
    expenses: { type: 'has_many', foreignKey: 'dog_id' },
    insights: { type: 'has_many', foreignKey: 'dog_id' },
    medications: { type: 'has_many', foreignKey: 'dog_id' },
    vaccinations: { type: 'has_many', foreignKey: 'dog_id' },
  } as const;

  @field('birthdate') birthdate: string | null;

  @field('breed') breed: string | null;

  @field('created_at') createdAt: number;

  @field('is_primary') isPrimary: boolean;

  @text('name') name: string;

  @field('photo_url') photoUrl: string | null;

  @field('sex') sex: BarklogDogSex;

  @field('user_id') userId: string;

  @field('weight_lbs') weightLbs: number | null;
}
