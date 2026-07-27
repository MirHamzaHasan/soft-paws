import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

import type { BarklogExpenseCategory } from '../types';

export class ExpenseModel extends Model {
  static table = 'expenses';

  static associations = {
    dogs: { type: 'belongs_to', key: 'dog_id' },
    users: { type: 'belongs_to', key: 'user_id' },
  } as const;

  @field('amount') amount: number;

  @text('category') category: BarklogExpenseCategory;

  @field('created_at') createdAt: number;

  @text('date') date: string;

  @field('description') description: string | null;

  @field('dog_id') dogId: string;

  @field('receipt_photo_url') receiptPhotoUrl: string | null;

  @field('user_id') userId: string;
}
