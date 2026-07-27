import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function readRepoFile(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return listSourceFiles(fullPath);
    }

    return /\.(ts|tsx)$/.test(fullPath) && !/\.test\.(ts|tsx)$/.test(fullPath)
      ? [fullPath]
      : [];
  });
}

describe('AI Edge Function contracts', () => {
  it('keeps provider usage and server AI keys out of Expo client source', () => {
    const clientSource = ['app', 'src']
      .flatMap((directory) => listSourceFiles(join(process.cwd(), directory)))
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    const legacyHostPattern = new RegExp(
      ['api', 'anthropic', 'com'].join('\\.'),
    );
    const legacyHeaderName = ['x', 'api', 'key'].join('-');
    const legacyAnthropicKeyName = ['ANTHROPIC', 'API', 'KEY'].join('_');
    const textAiSecretName = ['BARKLOG', 'TEXT', 'AI', 'API', 'KEY'].join('_');
    const visionAiSecretName = ['BARKLOG', 'VISION', 'AI', 'API', 'KEY'].join(
      '_',
    );

    expect(clientSource).not.toMatch(legacyHostPattern);
    expect(clientSource).not.toMatch(new RegExp(legacyHeaderName, 'i'));
    expect(clientSource).not.toMatch(new RegExp(legacyAnthropicKeyName));
    expect(clientSource).not.toMatch(new RegExp(textAiSecretName));
    expect(clientSource).not.toMatch(new RegExp(visionAiSecretName));
  });

  it('requires premium access before non-emergency Ask BarkLog AI model calls', () => {
    const source = readRepoFile('supabase/functions/ask-barklog-ai/index.ts');
    const premiumGateIndex = source.indexOf('await requirePremiumAccess');
    const modelCallIndex = source.indexOf('await createTextAiMessage');

    expect(premiumGateIndex).toBeGreaterThan(-1);
    expect(modelCallIndex).toBeGreaterThan(-1);
    expect(premiumGateIndex).toBeLessThan(modelCallIndex);
    expect(source).toContain('EMERGENCY_ESCALATION');
    expect(source).toContain('Never diagnose');
    expect(source).toContain('Training context');
    expect(source).toContain('Never claim to replace a professional trainer');
    expect(source).toContain('Use positive reinforcement language only');
  });

  it('requires premium access and no-diagnosis wording for weekly insights', () => {
    const source = readRepoFile(
      'supabase/functions/generate-weekly-insight/index.ts',
    );
    const premiumGateIndex = source.indexOf('await requirePremiumAccess');
    const modelCallIndex = source.indexOf('await createTextAiMessage');

    expect(premiumGateIndex).toBeGreaterThan(-1);
    expect(modelCallIndex).toBeGreaterThan(-1);
    expect(premiumGateIndex).toBeLessThan(modelCallIndex);
    expect(source).toContain('Never diagnose');
    expect(source).toContain('Never say "your dog has"');
    expect(source).toContain('This week training');
    expect(source).toContain('Do not give step-by-step training advice here.');
  });

  it('requires premium access and training safety wording for training insights', () => {
    const source = readRepoFile(
      'supabase/functions/generate-training-insight/index.ts',
    );
    const premiumGateIndex = source.indexOf('await requirePremiumAccess');
    const modelCallIndex = source.indexOf('await createTextAiMessage');

    expect(premiumGateIndex).toBeGreaterThan(-1);
    expect(modelCallIndex).toBeGreaterThan(-1);
    expect(premiumGateIndex).toBeLessThan(modelCallIndex);
    expect(source).toContain('Never give medical advice');
    expect(source).toContain('Never claim to replace a professional trainer');
    expect(source).toContain('suggest shorter sessions');
    expect(source).toContain('Use positive reinforcement language only');
    expect(source).toContain('Do not prescribe treatment');
  });

  it('requires premium access and summary safety wording for care summaries', () => {
    const source = readRepoFile(
      'supabase/functions/generate-care-summary/index.ts',
    );
    const premiumGateIndex = source.indexOf('await requirePremiumAccess');
    const modelCallIndex = source.indexOf('await createTextAiMessage');

    expect(premiumGateIndex).toBeGreaterThan(-1);
    expect(modelCallIndex).toBeGreaterThan(-1);
    expect(premiumGateIndex).toBeLessThan(modelCallIndex);
    expect(source).toContain('Never diagnose');
    expect(source).toContain('Never say "your dog has"');
    expect(source).toContain('Do not generate medication dosage advice');
    expect(source).toContain('Use positive reinforcement language');
  });

  it('requires premium access and vet-report safety wording for generated vet reports', () => {
    const source = readRepoFile(
      'supabase/functions/generate-vet-report/index.ts',
    );
    const premiumGateIndex = source.indexOf('await requirePremiumAccess');
    const modelCallIndex = source.indexOf('await createTextAiMessage');

    expect(premiumGateIndex).toBeGreaterThan(-1);
    expect(modelCallIndex).toBeGreaterThan(-1);
    expect(premiumGateIndex).toBeLessThan(modelCallIndex);
    expect(source).toContain('Never diagnose');
    expect(source).toContain('Never say "your dog has"');
    expect(source).toContain('Never give medication dosage instructions');
    expect(source).toContain('not replace a veterinarian');
    expect(source).toContain('valid JSON');
  });
});
