import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function readRepoFile(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('household sharing Edge Function contracts', () => {
  it('requires premium access before accepting cloud household invites', () => {
    const source = readRepoFile(
      'supabase/functions/accept-household-invite/index.ts',
    );
    const premiumGateIndex = source.indexOf('await requirePremiumAccess');
    const membershipInsertIndex = source.indexOf(
      "createRestPath('household_members'",
    );

    expect(premiumGateIndex).toBeGreaterThan(-1);
    expect(membershipInsertIndex).toBeGreaterThan(-1);
    expect(premiumGateIndex).toBeLessThan(membershipInsertIndex);
    expect(source).toContain('invite_expired');
    expect(source).toContain('sitter_expires_at');
    expect(source).toContain('allowed_dog_ids');
  });

  it('defines RLS helpers for shared dog visibility and writes', () => {
    const source = readRepoFile(
      'supabase/migrations/202604270039_household_sharing_and_sitter_mode.sql',
    );

    expect(source).toContain('current_user_can_view_shared_dog');
    expect(source).toContain('current_user_can_create_shared_dog_log');
    expect(source).toContain('current_user_has_household_permission');
    expect(source).toContain('public.current_user_has_premium_access()');
    expect(source).toContain('sitter_expires_at > now()');
    expect(source).toContain('allowed_dog_ids ? target_dog_id::text');
  });
});
