import { Model } from '@nozbe/watermelondb';
import { field, json, text } from '@nozbe/watermelondb/decorators';

import type { Json } from '@/types/local';

import type { BarklogEventType } from '../types';
import { sanitizeJsonValue } from '../utils';

const sanitizeEventDetails = (value: unknown) => sanitizeJsonValue(value, {});

export class EventModel extends Model {
  static table = 'events';

  static associations = {
    dogs: { type: 'belongs_to', key: 'dog_id' },
    users: { type: 'belongs_to', key: 'user_id' },
  } as const;

  @field('created_at') createdAt: number;

  @json('details', sanitizeEventDetails, { memo: true }) details: Json;

  @field('dog_id') dogId: string;

  @field('logged_at') loggedAt: number | null;

  @field('notes') notes: string | null;

  @field('occurred_at') occurredAt: number;

  @field('photo_url') photoUrl: string | null;

  @field('synced') synced: boolean;

  @text('type') type: BarklogEventType;

  @field('user_id') userId: string;
}
