#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

const appConfigPath = 'app.json';
const androidSourceManifestPath = 'android/app/src/main/AndroidManifest.xml';
const androidReleaseManifestPath =
  'android/app/build/intermediates/merged_manifest/release/processReleaseMainManifest/AndroidManifest.xml';
const iosInfoPlistPath = 'ios/BarkLog/Info.plist';
const iosEntitlementsPath = 'ios/BarkLog/BarkLog.entitlements';

const expectedAndroidPermissions = [
  'android.permission.POST_NOTIFICATIONS',
  'com.android.vending.BILLING',
];

const removableAndroidPermissions = [
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.WRITE_EXTERNAL_STORAGE',
];

const forbiddenAndroidPermissions = [
  ...removableAndroidPermissions,
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.ACTIVITY_RECOGNITION',
  'android.permission.BODY_SENSORS',
  'android.permission.CAMERA',
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.RECORD_AUDIO',
];

const forbiddenIosInfoKeys = [
  'NSCameraUsageDescription',
  'NSHealthShareUsageDescription',
  'NSHealthUpdateUsageDescription',
  'NSLocationAlwaysAndWhenInUseUsageDescription',
  'NSLocationWhenInUseUsageDescription',
  'NSMicrophoneUsageDescription',
  'NSPhotoLibraryAddUsageDescription',
  'NSPhotoLibraryUsageDescription',
];

const forbiddenIosEntitlements = [
  'com.apple.developer.healthkit',
  'com.apple.developer.location.push',
];

const failures = [];
const notes = [];

const toAbsolutePath = (relativePath) => path.join(rootDir, relativePath);

const pathExists = (relativePath) =>
  fs.existsSync(toAbsolutePath(relativePath));

const readText = (relativePath) =>
  fs.readFileSync(toAbsolutePath(relativePath), 'utf8');

const readJson = (relativePath) => JSON.parse(readText(relativePath));

const recordFailure = (message) => {
  failures.push(message);
};

const getExpoConfig = () => readJson(appConfigPath).expo || {};

const hasPermissionDeclaration = (text, permission) =>
  text.includes(`android:name="${permission}"`);

const hasActivePermissionDeclaration = (text, permission) => {
  const declarationPattern = new RegExp(
    `<uses-permission[^>]+android:name="${permission.replace(/\./g, '\\.').replace(/\$/g, '\\$')}"[^>]*>`,
    'g',
  );

  return [...text.matchAll(declarationPattern)].some(
    ([declaration]) => !declaration.includes('tools:node="remove"'),
  );
};

const validateAppConfig = () => {
  const expoConfig = getExpoConfig();
  const androidConfig = expoConfig.android || {};
  const androidPermissions = androidConfig.permissions || [];
  const blockedAndroidPermissions = androidConfig.blockedPermissions || [];

  expectedAndroidPermissions.forEach((permission) => {
    if (!androidPermissions.includes(permission)) {
      recordFailure(`app.json android.permissions is missing ${permission}.`);
    }
  });

  removableAndroidPermissions.forEach((permission) => {
    if (!blockedAndroidPermissions.includes(permission)) {
      recordFailure(
        `app.json android.blockedPermissions is missing ${permission}.`,
      );
    }
  });

  forbiddenAndroidPermissions.forEach((permission) => {
    if (
      !expectedAndroidPermissions.includes(permission) &&
      androidPermissions.includes(permission)
    ) {
      recordFailure(`app.json actively declares forbidden ${permission}.`);
    }
  });

  if (expoConfig.ios && expoConfig.ios.infoPlist) {
    forbiddenIosInfoKeys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(expoConfig.ios.infoPlist, key)) {
        recordFailure(`app.json ios.infoPlist declares ${key}.`);
      }
    });
  }
};

const validateAndroidSourceManifest = () => {
  const sourceManifest = readText(androidSourceManifestPath);

  expectedAndroidPermissions.forEach((permission) => {
    if (!hasActivePermissionDeclaration(sourceManifest, permission)) {
      recordFailure(`${androidSourceManifestPath} is missing ${permission}.`);
    }
  });

  removableAndroidPermissions.forEach((permission) => {
    if (!hasPermissionDeclaration(sourceManifest, permission)) {
      recordFailure(
        `${androidSourceManifestPath} is missing blocked declaration ${permission}.`,
      );
    } else if (hasActivePermissionDeclaration(sourceManifest, permission)) {
      recordFailure(
        `${androidSourceManifestPath} actively declares blocked ${permission}.`,
      );
    }
  });

  forbiddenAndroidPermissions.forEach((permission) => {
    if (
      !removableAndroidPermissions.includes(permission) &&
      hasActivePermissionDeclaration(sourceManifest, permission)
    ) {
      recordFailure(
        `${androidSourceManifestPath} declares forbidden ${permission}.`,
      );
    }
  });
};

const validateAndroidReleaseManifest = () => {
  if (!pathExists(androidReleaseManifestPath)) {
    recordFailure(
      `${androidReleaseManifestPath} is missing. Run ./gradlew :app:processReleaseMainManifest first.`,
    );
    return;
  }

  const releaseManifest = readText(androidReleaseManifestPath);

  expectedAndroidPermissions.forEach((permission) => {
    if (!hasActivePermissionDeclaration(releaseManifest, permission)) {
      recordFailure(`${androidReleaseManifestPath} is missing ${permission}.`);
    }
  });

  forbiddenAndroidPermissions.forEach((permission) => {
    if (hasActivePermissionDeclaration(releaseManifest, permission)) {
      recordFailure(
        `${androidReleaseManifestPath} actively declares forbidden ${permission}.`,
      );
    }
  });
};

const validateIosNativeFiles = () => {
  const infoPlist = pathExists(iosInfoPlistPath)
    ? readText(iosInfoPlistPath)
    : '';
  const entitlements = pathExists(iosEntitlementsPath)
    ? readText(iosEntitlementsPath)
    : '';

  if (!infoPlist) {
    recordFailure(`${iosInfoPlistPath} is missing.`);
  }

  forbiddenIosInfoKeys.forEach((key) => {
    if (infoPlist.includes(`<key>${key}</key>`)) {
      recordFailure(`${iosInfoPlistPath} declares ${key}.`);
    }
  });

  forbiddenIosEntitlements.forEach((key) => {
    if (entitlements.includes(`<key>${key}</key>`)) {
      recordFailure(`${iosEntitlementsPath} declares ${key}.`);
    }
  });
};

validateAppConfig();
validateAndroidSourceManifest();
validateAndroidReleaseManifest();
validateIosNativeFiles();

if (failures.length === 0) {
  notes.push(
    'Android release manifest keeps expected notification and billing capability checks.',
  );
  notes.push(
    'Camera, location, media-library, microphone, storage, overlay, and health capabilities are absent from the checked native files.',
  );
}

if (failures.length > 0) {
  console.error('Native release capability check failed:');
  failures.forEach((failure) => {
    console.error(`- ${failure}`);
  });
  process.exit(1);
}

console.log('Native release capability check passed.');
notes.forEach((note) => {
  console.log(`- ${note}`);
});
