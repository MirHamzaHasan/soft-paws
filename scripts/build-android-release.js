#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const requiredSigningEnv = [
  'BARKLOG_ANDROID_KEYSTORE_FILE',
  'BARKLOG_ANDROID_KEYSTORE_PASSWORD',
  'BARKLOG_ANDROID_KEY_ALIAS',
  'BARKLOG_ANDROID_KEY_PASSWORD',
];

function loadPublicEnv(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) return;
  fs.readFileSync(absolute, 'utf8')
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const separator = trimmed.indexOf('=');
      if (separator < 1) throw new Error(`Invalid ${relativePath} line.`);
      const key = trimmed.slice(0, separator).trim();
      if (!key.startsWith('EXPO_PUBLIC_'))
        throw new Error(`${relativePath} must contain client-safe keys only.`);
      process.env[key] = trimmed.slice(separator + 1).trim();
    });
}

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {
    cwd,
    env: process.env,
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    process.exit(typeof result.status === 'number' ? result.status : 1);
}

function configureSigning() {
  const gradlePath = path.join(root, 'android/app/build.gradle');
  const source = fs.readFileSync(gradlePath, 'utf8');
  const debugConfig = '    signingConfigs {\n        debug {';
  const releaseBuild =
    '        release {\n            // Caution! In production, you need to generate your own keystore file.';
  if (!source.includes(debugConfig) || !source.includes(releaseBuild)) {
    throw new Error(
      'Generated Android signing template changed; inspect android/app/build.gradle before building.',
    );
  }
  const withReleaseConfig = source.replace(
    debugConfig,
    `    signingConfigs {
        release {
            storeFile file(System.getenv('BARKLOG_ANDROID_KEYSTORE_FILE'))
            storePassword System.getenv('BARKLOG_ANDROID_KEYSTORE_PASSWORD')
            keyAlias System.getenv('BARKLOG_ANDROID_KEY_ALIAS')
            keyPassword System.getenv('BARKLOG_ANDROID_KEY_PASSWORD')
        }
        debug {`,
  );
  const releaseStart = withReleaseConfig.indexOf(releaseBuild);
  const before = withReleaseConfig.slice(0, releaseStart);
  const after = withReleaseConfig
    .slice(releaseStart)
    .replace(
      'signingConfig signingConfigs.debug',
      'signingConfig signingConfigs.release',
    );
  fs.writeFileSync(gradlePath, before + after);
}

loadPublicEnv('.env.production');
process.env.EXPO_PUBLIC_APP_ENV = 'production';
process.env.NODE_ENV = 'production';
if (
  !process.env.ANDROID_HOME &&
  !process.env.ANDROID_SDK_ROOT &&
  process.platform === 'win32'
) {
  const defaultSdk = path.join(
    process.env.LOCALAPPDATA || '',
    'Android',
    'Sdk',
  );
  if (fs.existsSync(defaultSdk)) process.env.ANDROID_HOME = defaultSdk;
}
const missing = requiredSigningEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(
    `Set local Android signing environment variables: ${missing.join(', ')}`,
  );
  process.exit(1);
}
const keystore = path.resolve(root, process.env.BARKLOG_ANDROID_KEYSTORE_FILE);
if (!fs.existsSync(keystore)) {
  console.error('Android release keystore file does not exist.');
  process.exit(1);
}
process.env.BARKLOG_ANDROID_KEYSTORE_FILE = keystore;

run('corepack', [
  'pnpm',
  'exec',
  'expo',
  'prebuild',
  '-p',
  'android',
  '--clean',
  '--no-install',
]);
configureSigning();
run(
  process.platform === 'win32' ? 'gradlew.bat' : './gradlew',
  ['bundleRelease', 'assembleRelease'],
  path.join(root, 'android'),
);
console.log('Signed Android AAB and APK are in android/app/build/outputs.');
