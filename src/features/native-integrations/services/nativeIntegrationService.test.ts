import {
  getHealthActivityCapabilityLabel,
  requestNativeCapability,
} from '@/features/native-integrations/services/nativeIntegrationService';

const mockQueueBarklogEvent = jest.fn();

jest.mock('@/features/observability', () => ({
  queueBarklogEvent: (...args: unknown[]) => mockQueueBarklogEvent(...args),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(async () => ({ granted: false })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
}));

describe('native integration capability copy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('labels iOS health activity without requesting health permissions', async () => {
    expect(getHealthActivityCapabilityLabel()).toBe('Apple Health');

    await expect(requestNativeCapability('health_activity')).resolves.toEqual({
      message:
        'Apple Health import is opt-in and needs the native activity adapter before it can connect. BarkLog will not request health data in this build.',
      status: 'not_configured',
    });
    expect(mockQueueBarklogEvent).toHaveBeenCalledWith('permission_result', {
      capability: 'health_activity',
      status: 'not_configured',
    });
  });

  it('reports camera and location as not configured instead of prompting', async () => {
    await expect(requestNativeCapability('camera')).resolves.toMatchObject({
      status: 'not_configured',
    });
    await expect(requestNativeCapability('location')).resolves.toMatchObject({
      status: 'not_configured',
    });
  });
});
