import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function readRepoFile(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('barklog-sync Edge Function contract', () => {
  it('requires premium access before pull or push actions execute', () => {
    const source = readRepoFile('supabase/functions/barklog-sync/index.ts');
    const premiumGateIndex = source.indexOf('await requirePremiumSyncAccess');
    const pullIndex = source.indexOf("if (body.action === 'pull')");
    const pushIndex = source.indexOf("if (body.action === 'push')");

    expect(premiumGateIndex).toBeGreaterThan(-1);
    expect(pullIndex).toBeGreaterThan(-1);
    expect(pushIndex).toBeGreaterThan(-1);
    expect(premiumGateIndex).toBeLessThan(pullIndex);
    expect(premiumGateIndex).toBeLessThan(pushIndex);
    expect(source).toContain('premium_required');
    expect(source).toContain('cloud backup and sync');
  });

  it('scopes household sync by shared dog permissions', () => {
    const source = readRepoFile('supabase/functions/barklog-sync/index.ts');

    expect(source).toContain('readAccessibleDogIds');
    expect(source).toContain('readWritableDogIds');
    expect(source).toContain('readManageableDogRecordIds');
    expect(source).toContain('view_logs');
    expect(source).toContain('create_logs');
    expect(source).toContain('manage_medications');
    expect(source).toContain('allowed_dog_ids');
    expect(source).toContain('dog_id.in.');
    expect(source).toContain('assertDogScopedRecordsAreAllowed');
  });
});
