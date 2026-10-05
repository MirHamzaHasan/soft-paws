import { areAiFeaturesEnabled } from './featureFlags';

jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

jest.mock('@/features/auth/services/firebaseAiAuth', () => ({
  isFirebaseAiAuthConfigured: () => true,
}));

jest.mock('../../feature-flags.json', () => ({ aiFeatures: true }));

describe('AI release gate', () => {
  const original = process.env.EXPO_PUBLIC_APP_ENV;

  afterAll(() => {
    if (original === undefined) delete process.env.EXPO_PUBLIC_APP_ENV;
    else process.env.EXPO_PUBLIC_APP_ENV = original;
  });

  const enabledFor = (environment?: string) => {
    if (environment === undefined) delete process.env.EXPO_PUBLIC_APP_ENV;
    else process.env.EXPO_PUBLIC_APP_ENV = environment;
    return areAiFeaturesEnabled();
  };

  it('fails closed when the build environment is missing or production', () => {
    expect(enabledFor()).toBe(false);
    expect(enabledFor('production')).toBe(false);
  });

  it('allows configured development and preview builds', () => {
    expect(enabledFor('development')).toBe(true);
    expect(enabledFor('preview')).toBe(true);
  });
});
