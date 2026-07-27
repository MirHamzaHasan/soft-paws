#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const requireProjectId = process.argv.includes('--require-project-id');

const readJson = (relativePath) => {
  const absolutePath = path.join(rootDir, relativePath);

  try {
    return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  } catch (error) {
    throw new Error(`Could not read ${relativePath}: ${error.message}`);
  }
};

const appConfig = readJson('app.json');
const easConfig = readJson('eas.json');

const getValue = (source, keys) =>
  keys.reduce((value, key) => {
    if (value && Object.prototype.hasOwnProperty.call(value, key)) {
      return value[key];
    }

    return undefined;
  }, source);

const expoConfig = appConfig.expo || {};
const buildProfiles = easConfig.build || {};
const failures = [];
const notes = [];

const assertEqual = (label, actual, expected) => {
  if (actual !== expected) {
    failures.push(
      `${label} must be ${JSON.stringify(expected)}; received ${JSON.stringify(actual)}.`,
    );
  }
};

const assertMissing = (label, value) => {
  if (value !== undefined) {
    failures.push(
      `${label} must not be set; received ${JSON.stringify(value)}.`,
    );
  }
};

const isRealProjectId = (projectId) =>
  typeof projectId === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    projectId,
  );

assertEqual('expo.name', expoConfig.name, 'BarkLog');
assertEqual('expo.slug', expoConfig.slug, 'bark-log');
assertEqual('expo.version', expoConfig.version, '1.0.0');
assertEqual(
  'expo.ios.bundleIdentifier',
  getValue(expoConfig, ['ios', 'bundleIdentifier']),
  'com.dracoarts.barklog',
);
assertEqual(
  'expo.android.package',
  getValue(expoConfig, ['android', 'package']),
  'com.dracoarts.barklog',
);

assertEqual(
  'build.development.environment',
  getValue(buildProfiles, ['development', 'environment']),
  'development',
);
assertEqual(
  'build.development.developmentClient',
  getValue(buildProfiles, ['development', 'developmentClient']),
  true,
);
assertEqual(
  'build.preview.environment',
  getValue(buildProfiles, ['preview', 'environment']),
  'preview',
);
assertEqual(
  'build.preview.distribution',
  getValue(buildProfiles, ['preview', 'distribution']),
  'internal',
);
assertEqual(
  'build.production.environment',
  getValue(buildProfiles, ['production', 'environment']),
  'production',
);
assertEqual(
  'build.production.autoIncrement',
  getValue(buildProfiles, ['production', 'autoIncrement']),
  true,
);

assertMissing(
  'build.preview.developmentClient',
  getValue(buildProfiles, ['preview', 'developmentClient']),
);
assertMissing(
  'build.production.developmentClient',
  getValue(buildProfiles, ['production', 'developmentClient']),
);
assertMissing(
  'build.preview.ios.simulator',
  getValue(buildProfiles, ['preview', 'ios', 'simulator']),
);
assertMissing(
  'build.production.ios.simulator',
  getValue(buildProfiles, ['production', 'ios', 'simulator']),
);

const projectId = getValue(expoConfig, ['extra', 'eas', 'projectId']);

if (isRealProjectId(projectId)) {
  notes.push(`EAS project ID is present: ${projectId}`);
} else if (requireProjectId) {
  failures.push(
    'expo.extra.eas.projectId must be a real EAS project UUID before linked release builds.',
  );
} else {
  notes.push(
    'EAS project ID is not set yet; run with --require-project-id after linking BarkLog in Expo/EAS.',
  );
}

if (failures.length > 0) {
  console.error('EAS release config check failed:');
  failures.forEach((failure) => {
    console.error(`- ${failure}`);
  });
  process.exit(1);
}

console.log('EAS release config check passed.');
notes.forEach((note) => {
  console.log(`- ${note}`);
});
