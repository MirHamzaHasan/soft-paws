#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const reactPackage = fs.realpathSync(require.resolve('react/package.json'));
const virtualStoreDir = path.resolve(path.dirname(reactPackage), '../../..');

if (!path.relative(root, virtualStoreDir).startsWith('..')) {
  process.exit(0);
}

const projectModules = path.join(root, 'node_modules');
const hoistedModules = path.join(virtualStoreDir, 'node_modules');

function linkPackage(parts) {
  const source = path.join(projectModules, ...parts);
  const link = path.join(hoistedModules, ...parts);
  if (fs.existsSync(link) || !fs.statSync(source).isDirectory()) return 0;
  fs.mkdirSync(path.dirname(link), { recursive: true });
  fs.symlinkSync(fs.realpathSync(source), link, 'junction');
  return 1;
}

let linked = 0;
fs.readdirSync(projectModules, { withFileTypes: true })
  .filter((entry) => !entry.name.startsWith('.'))
  .forEach((entry) => {
    if (entry.name.startsWith('@')) {
      const scope = path.join(projectModules, entry.name);
      fs.readdirSync(scope, { withFileTypes: true }).forEach((child) => {
        linked += linkPackage([entry.name, child.name]);
      });
    } else {
      linked += linkPackage([entry.name]);
    }
  });
if (linked) {
  console.log(
    `Linked ${linked} project packages into the short external pnpm virtual store.`,
  );
}
