import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

import type { BarklogSubscriptionTier } from '../types';

export class UserModel extends Model {
  static table = 'users';

  static associations = {
    dogs: { type: 'has_many', foreignKey: 'user_id' },
    events: { type: 'has_many', foreignKey: 'user_id' },
    expenses: { type: 'has_many', foreignKey: 'user_id' },
  } as const;

  @field('created_at') createdAt: number;

  @text('email') email: string;

  @field('revenuecat_user_id') revenuecatUserId: string | null;

  @text('subscription_tier') subscriptionTier: BarklogSubscriptionTier;

  @field('trial_ends_at') trialEndsAt: number | null;
}
