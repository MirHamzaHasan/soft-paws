#!/usr/bin/env node
/* eslint-disable no-console */

const { spawnSync } = require('child_process');

const checks = [
  {
    args: ['scripts/check-release-env-boundary.js'],
    command: 'node',
    label: 'Client/server environment boundary',
  },
  {
    args: ['scripts/check-native-release-capabilities.js', '--config-only'],
    command: 'node',
    label: 'Native release capabilities',
  },
  {
    args: [
      'pnpm',
      'exec',
      'eslint',
      'scripts/build-android-release.js',
      'scripts/ensure-external-pnpm-store-links.js',
      'scripts/check-release-env-boundary.js',
      'scripts/check-native-release-capabilities.js',
      'scripts/check-production-release-readiness.js',
      'scripts/run-local-release-gates.js',
    ],
    command: 'corepack',
    label: 'Release script lint',
  },
  {
    args: ['pnpm', 'check-types'],
    command: 'corepack',
    label: 'TypeScript',
  },
];

const results = checks.map((check) => {
  console.log(`\n== ${check.label} ==`);

  const result = spawnSync(check.command, check.args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  return {
    label: check.label,
    status: typeof result.status === 'number' ? result.status : 1,
  };
});

const failures = results.filter((result) => result.status !== 0);

if (failures.length > 0) {
  console.error('\nLocal release gates failed:');
  failures.forEach((failure) => {
    console.error(`- ${failure.label}`);
  });
  process.exit(1);
}

console.log('\nLocal release gates passed.');
console.log(
  '- Signed native builds, device QA, and store sign-off are tracked separately.',
);
