import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function readRepoFile(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('safety free access contract', () => {
  it('exposes a Safety Center route without a Premium gate', () => {
    expect(existsSync(join(process.cwd(), 'app/safety.tsx'))).toBe(true);

    const source = readRepoFile(
      'src/features/safety/screens/SafetyCenterScreen.tsx',
    );

    expect(source).toContain('Free offline safety pack');
    expect(source).toContain('Open Emergency SOS');
    expect(source).not.toContain('openPremiumGate');
    expect(source).not.toContain('hasPremiumAccess');
  });

  it('keeps urgent safety routes free of Premium gate imports', () => {
    const safetySources = [
      'src/features/safety/screens/EmergencySosScreen.tsx',
      'src/features/safety/screens/FirstAidGuideScreen.tsx',
      'src/features/safety/screens/ToxicityScannerScreen.tsx',
      'src/features/safety/screens/SafetyCenterScreen.tsx',
    ].map(readRepoFile);

    safetySources.forEach((source) => {
      expect(source).not.toContain('openPremiumGate');
      expect(source).not.toContain('premium_required');
    });
  });
});
