import { Model } from '@nozbe/watermelondb';
import { field, json, text } from '@nozbe/watermelondb/decorators';

import type { BarklogMedicationFrequency } from '../types';
import { sanitizeStringArray } from '../utils';

export class MedicationModel extends Model {
  static table = 'medications';

  static associations = {
    dogs: { type: 'belongs_to', key: 'dog_id' },
  } as const;

  @field('active') active: boolean;

  @field('created_at') createdAt: number;

  @field('dog_id') dogId: string;

  @field('dose_mg') doseMg: number | null;

  @field('end_date') endDate: string | null;

  @field('frequency') frequency: BarklogMedicationFrequency;

  @field('give_with_food') giveWithFood: boolean;

  @text('name') name: string;

  @field('notes') notes: string | null;

  @field('refill_date') refillDate: string | null;

  @json('schedule_times', sanitizeStringArray, { memo: true })
  scheduleTimes: string[];

  @field('start_date') startDate: string | null;
}
