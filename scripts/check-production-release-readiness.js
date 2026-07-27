#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const preflightPath = 'docs/deployment/release-preflight-checklist.md';
const storeChecklistPath = 'docs/deployment/store-submission-checklist.md';

const requiredReleaseFields = [
  'App version',
  'Build profile',
  'iOS build URL',
  'Android build URL',
  'Supabase project',
  'RevenueCat project',
  'Mixpanel project',
  'Sentry project',
  'Release owner',
  'Decision',
];

const requiredRollbackFields = [
  'Last known good app version',
  'Last known good iOS build URL',
  'Last known good Android build URL',
  'Last known good Supabase function versions',
  'RevenueCat rollback action',
  'Server rollback action',
  'Store rollback action',
];

const requiredStoreChecklistPhrases = [
  'BarkLog is a dog care journal',
  'does not diagnose',
  'Free users keep basic logging',
  'Privacy policy',
  'RevenueCat',
  'Mixpanel',
  'Sentry',
  'Supabase',
];

const failures = [];

const readText = (relativePath) =>
  fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

const recordFailure = (message) => {
  failures.push(message);
};

const isSeparatorCell = (value) => /^-+$/.test(value.replace(/\s/g, ''));

const splitMarkdownRow = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

const collectSimpleTableRows = (markdown) =>
  markdown
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith('|'))
    .map(splitMarkdownRow)
    .filter((cells) => cells.length >= 2 && !cells.some(isSeparatorCell));

const collectFieldTable = (markdown, firstHeader, secondHeader) => {
  const rows = collectSimpleTableRows(markdown);
  const table = new Map();

  rows.forEach((cells) => {
    if (cells[0] === firstHeader && cells[1] === secondHeader) {
      return;
    }

    if (cells.length === 2) {
      table.set(cells[0], cells[1]);
    }
  });

  return table;
};

const valueLooksMissing = (value) => !value || value.trim().length === 0;

const valueLooksBlocked = (value) =>
  /\b(blocked|pending|not run|required)\b/i.test(value);

const validateReleaseDecisionFields = (preflight) => {
  const releaseFields = collectFieldTable(preflight, 'Field', 'Value');

  requiredReleaseFields.forEach((field) => {
    const value = releaseFields.get(field);

    if (valueLooksMissing(value)) {
      recordFailure(`Release decision field "${field}" is blank.`);
    }
  });

  const decision = releaseFields.get('Decision');

  if (decision && valueLooksBlocked(decision)) {
    recordFailure(
      'Release decision must not be blocked, pending, not run, or required before production builds.',
    );
  }
};

const validateGateStatuses = (preflight) => {
  collectSimpleTableRows(preflight).forEach((cells) => {
    const rowText = cells.join(' ');

    if (/\b(Pending|Blocked|Not run)\b/i.test(rowText)) {
      recordFailure(`Release preflight row is not complete: ${rowText}`);
    }
  });
};

const validateRollbackFields = (preflight) => {
  const rollbackSection =
    preflight.split('## Rollback And Hotfix Gate')[1] || '';
  const rollbackFields = collectFieldTable(rollbackSection, 'Field', 'Value');

  requiredRollbackFields.forEach((field) => {
    const value = rollbackFields.get(field);

    if (valueLooksMissing(value)) {
      recordFailure(`Rollback field "${field}" is blank.`);
    }
  });
};

const validateStoreChecklist = (storeChecklist) => {
  requiredStoreChecklistPhrases.forEach((phrase) => {
    if (!storeChecklist.includes(phrase)) {
      recordFailure(`Store checklist is missing required phrase: ${phrase}`);
    }
  });
};

const preflight = readText(preflightPath);
const storeChecklist = readText(storeChecklistPath);

validateReleaseDecisionFields(preflight);
validateGateStatuses(preflight);
validateRollbackFields(preflight);
validateStoreChecklist(storeChecklist);

if (failures.length > 0) {
  console.error('Production release readiness check failed:');
  failures.forEach((failure) => {
    console.error(`- ${failure}`);
  });
  process.exit(1);
}

console.log('Production release readiness check passed.');
console.log(
  '- Release preflight fields, gate statuses, store checklist, and rollback targets are complete.',
);
