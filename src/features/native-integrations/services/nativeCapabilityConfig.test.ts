import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('native capability configuration', () => {
  it('does not advertise camera, location, or health permissions before adapters are configured', () => {
    const appConfig = JSON.parse(
      readFileSync(join(process.cwd(), 'app.json'), 'utf8'),
    ) as {
      expo: {
        android?: {
          blockedPermissions?: string[];
          permissions?: string[];
        };
        ios?: {
          infoPlist?: Record<string, unknown>;
        };
      };
    };
    const androidPermissions = appConfig.expo.android?.permissions ?? [];
    const blockedAndroidPermissions =
      appConfig.expo.android?.blockedPermissions ?? [];
    const infoPlist = appConfig.expo.ios?.infoPlist ?? {};

    expect(androidPermissions).toEqual([
      'android.permission.POST_NOTIFICATIONS',
      'com.android.vending.BILLING',
    ]);
    expect(blockedAndroidPermissions).toEqual(
      expect.arrayContaining([
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.SYSTEM_ALERT_WINDOW',
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ]),
    );
    expect(androidPermissions).not.toEqual(
      expect.arrayContaining([
        'android.permission.CAMERA',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
      ]),
    );
    expect(Object.keys(infoPlist)).not.toEqual(
      expect.arrayContaining([
        'NSCameraUsageDescription',
        'NSHealthShareUsageDescription',
        'NSHealthUpdateUsageDescription',
        'NSLocationWhenInUseUsageDescription',
      ]),
    );
  });
});
