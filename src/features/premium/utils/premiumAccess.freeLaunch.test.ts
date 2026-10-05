import { makeUserRow } from '../../../../test/utils/builders';
import {
  getPremiumEntitlementState,
  hasPremiumAccess,
  shouldPromptForExpiredTrial,
} from './premiumAccess';

jest.mock('@/config/releaseMode', () => ({ FREE_V1_RELEASE: true }));

describe('free v1.0.0 access', () => {
  it('includes previously gated features even for a free or expired owner', () => {
    const owner = makeUserRow({
      subscription_tier: 'expired',
      trial_ends_at: '2026-01-01T00:00:00.000Z',
    });

    expect(getPremiumEntitlementState(owner)).toMatchObject({
      hasAccess: true,
      kind: 'included',
    });
    expect(hasPremiumAccess(owner)).toBe(true);
    expect(shouldPromptForExpiredTrial(owner)).toBe(false);
  });
});
