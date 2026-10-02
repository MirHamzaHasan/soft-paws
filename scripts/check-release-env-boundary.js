#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const requiredClientKeys = [
  'EXPO_PUBLIC_REVENUECAT_IOS_KEY',
  'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY',
  'EXPO_PUBLIC_MIXPANEL_TOKEN',
  'EXPO_PUBLIC_SENTRY_DSN',
  'EXPO_PUBLIC_APP_ENV',
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_ATLAS_APP_ID',
];
const forbiddenSecrets = [
  'BARKLOG_TEXT_AI_API_KEY',
  'BARKLOG_VISION_AI_API_KEY',
  'OPENAI_API_KEY',
  'DEEPSEEK_API_KEY',
  'SERVICE_ROLE_KEY',
  'ATLAS_API_KEY',
  'FIREBASE_PRIVATE_KEY',
  'sk-ant',
];
const failures = [];

function collectFiles(relative) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) return [];
  if (fs.statSync(absolute).isFile()) return [absolute];
  return fs
    .readdirSync(absolute)
    .flatMap((entry) => collectFiles(path.join(relative, entry)));
}

const envExample = fs.readFileSync(path.join(root, 'env.example'), 'utf8');
const clientEnv = fs.readFileSync(
  path.join(root, 'src/utils/clientEnv.ts'),
  'utf8',
);
requiredClientKeys.forEach((key) => {
  if (!envExample.includes(`${key}=`))
    failures.push(`env.example is missing ${key}.`);
  if (!clientEnv.includes(key))
    failures.push(`clientEnv.ts is missing ${key}.`);
});

const clientFiles = ['app.json', 'env.example', 'app', 'src']
  .flatMap(collectFiles)
  .filter((file) => !file.endsWith('.test.ts') && !file.endsWith('.test.tsx'));
['.env', '.env.local', '.env.development', '.env.production'].forEach(
  (relative) => {
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute)) return;
    const lines = fs.readFileSync(absolute, 'utf8').split(/\r?\n/);
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const key = trimmed.split('=')[0].trim();
      if (!key.startsWith('EXPO_PUBLIC_'))
        failures.push(`${relative} contains non-client key ${key}.`);
    });
    clientFiles.push(absolute);
  },
);

clientFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  forbiddenSecrets.forEach((marker) => {
    if (content.includes(marker))
      failures.push(
        `${path.relative(root, file)} contains server-only marker ${marker}.`,
      );
  });
});

if (failures.length) {
  console.error('Release environment boundary check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Local client environment boundary passed.');
