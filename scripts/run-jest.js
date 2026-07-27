/* eslint-disable no-process-exit */
const { spawnSync } = require('node:child_process');

const jestBin = require.resolve('jest/bin/jest');
const args = process.argv.slice(2).filter((arg) => arg !== '--');
const result = spawnSync(process.execPath, [jestBin, ...args], {
  stdio: 'inherit',
});

process.exit(typeof result.status === 'number' ? result.status : 1);
