#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

const requiredClientKeys = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_REVENUECAT_IOS_KEY',
  'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY',
  'EXPO_PUBLIC_MIXPANEL_TOKEN',
  'EXPO_PUBLIC_SENTRY_DSN',
  'EXPO_PUBLIC_APP_ENV',
];

const requiredServerSecretKeys = [
  'BARKLOG_TEXT_AI_PROVIDER',
  'BARKLOG_TEXT_AI_BASE_URL',
  'BARKLOG_TEXT_AI_API_KEY',
  'BARKLOG_TEXT_AI_MODEL',
  'BARKLOG_TEXT_AI_THINKING',
  'BARKLOG_VISION_AI_PROVIDER',
  'BARKLOG_VISION_AI_BASE_URL',
  'BARKLOG_VISION_AI_API_KEY',
  'BARKLOG_VISION_AI_MODEL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const requiredFunctions = [
  'accept-household-invite',
  'ask-barklog-ai',
  'barklog-sync',
  'generate-care-summary',
  'generate-training-insight',
  'generate-vet-report',
  'generate-weekly-insight',
  'resolve-vet-share-link',
  'toxicity-lookup',
];

const clientBoundaryTargets = [
  'app.json',
  'eas.json',
  'env.example',
  'app',
  'src',
];

const localEnvFiles = ['.env', '.env.local', '.env.preview', '.env.production'];

const forbiddenClientMarkers = [
  'BARKLOG_TEXT_AI_API_KEY',
  'BARKLOG_VISION_AI_API_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'sk-ant',
  'service_role',
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

const collectFiles = (relativePath) => {
  const absolutePath = toAbsolutePath(relativePath);

  if (!fs.existsSync(absolutePath)) {
    return [];
  }

  const stats = fs.statSync(absolutePath);

  if (stats.isFile()) {
    return [relativePath];
  }

  return fs.readdirSync(absolutePath).flatMap((entry) => {
    const childRelativePath = path.join(relativePath, entry);
    const childStats = fs.statSync(toAbsolutePath(childRelativePath));

    if (childStats.isDirectory()) {
      return collectFiles(childRelativePath);
    }

    return [childRelativePath];
  });
};

const scanClientBoundary = () => {
  const files = clientBoundaryTargets.flatMap(collectFiles);
  const envFiles = localEnvFiles.filter(pathExists);

  files.concat(envFiles).forEach((relativePath) => {
    const text = readText(relativePath);

    forbiddenClientMarkers.forEach((marker) => {
      if (text.includes(marker)) {
        recordFailure(`${relativePath} contains server-only marker ${marker}.`);
      }
    });
  });

  notes.push(`Scanned ${files.length} tracked client boundary files.`);

  if (envFiles.length > 0) {
    notes.push(
      `Checked local env file names without printing values: ${envFiles.join(', ')}`,
    );
  }
};

const validateEnvFileKeys = (relativePath) => {
  if (!pathExists(relativePath)) {
    return;
  }

  readText(relativePath)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .forEach((line) => {
      const key = line.split('=')[0].trim();

      if (key && !key.startsWith('EXPO_PUBLIC_')) {
        recordFailure(`${relativePath} contains non-client env key ${key}.`);
      }
    });
};

const validateClientKeyReferences = () => {
  const envExample = readText('env.example');
  const clientEnv = readText('src/utils/clientEnv.ts');

  requiredClientKeys.forEach((key) => {
    if (!envExample.includes(`${key}=`)) {
      recordFailure(`env.example is missing ${key}.`);
    }

    if (!clientEnv.includes(key)) {
      recordFailure(`src/utils/clientEnv.ts is missing ${key}.`);
    }
  });

  localEnvFiles.forEach(validateEnvFileKeys);
};

const validateEasProfileEnv = () => {
  const easConfig = readJson('eas.json');
  const buildProfiles = easConfig.build || {};

  ['development', 'preview', 'production'].forEach((profileName) => {
    const profile = buildProfiles[profileName] || {};
    const env = profile.env || {};

    Object.keys(env).forEach((key) => {
      if (!key.startsWith('EXPO_PUBLIC_')) {
        recordFailure(
          `eas.json build.${profileName}.env contains non-client key ${key}.`,
        );
      }
    });

    if (env.EXPO_PUBLIC_APP_ENV !== profileName) {
      recordFailure(
        `eas.json build.${profileName}.env.EXPO_PUBLIC_APP_ENV must be ${profileName}.`,
      );
    }
  });
};

const validateSupabaseFunctionBoundary = () => {
  const edgeEnv = readText('supabase/functions/_shared/env.ts');

  requiredServerSecretKeys.forEach((key) => {
    if (!edgeEnv.includes(key)) {
      recordFailure(`supabase/functions/_shared/env.ts is missing ${key}.`);
    }
  });

  requiredFunctions.forEach((functionName) => {
    const functionPath = `supabase/functions/${functionName}/index.ts`;

    if (!pathExists(functionPath)) {
      recordFailure(`Missing required Supabase Edge Function ${functionPath}.`);
    }
  });
};

scanClientBoundary();
validateClientKeyReferences();
validateEasProfileEnv();
validateSupabaseFunctionBoundary();

if (failures.length > 0) {
  console.error('Release environment boundary check failed:');
  failures.forEach((failure) => {
    console.error(`- ${failure}`);
  });
  process.exit(1);
}

console.log('Release environment boundary check passed.');
notes.forEach((note) => {
  console.log(`- ${note}`);
});
