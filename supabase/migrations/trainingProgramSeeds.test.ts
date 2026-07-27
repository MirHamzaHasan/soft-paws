import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  TRAINING_PROGRAM_CATEGORIES,
  TRAINING_PROGRAM_DIFFICULTIES,
} from '@/types/training';

const MIGRATION_PATH = join(
  process.cwd(),
  'supabase/migrations/202604270028_seed_initial_training_programs.sql',
);

const EXPECTED_PROGRAMS = [
  'sit-stay-foundations',
  'loose-leash-walking',
  'recall-come-when-called',
  'calm-greetings',
  'crate-training',
  'reactivity-management',
  'leave-it-drop-it',
  'separation-comfort',
] as const;

const FORBIDDEN_TRAINING_LANGUAGE =
  /\b(punish|punishment|dominance|alpha|correction|shock|prong|choke|aversive|yank|jerk|force|scold)\b/i;

type ProgramSeedRow = {
  category: string;
  description: string;
  difficulty: string;
  estimatedDays: number;
  icon: string;
  name: string;
  slug: string;
  sortOrder: number;
};

type StepSeedRow = {
  durationMin: number;
  instruction: string;
  programSlug: string;
  stepNumber: number;
  tip: string;
  title: string;
};

function readMigration() {
  return readFileSync(MIGRATION_PATH, 'utf8');
}

function readSection(input: string, start: string, end: string) {
  const startIndex = input.indexOf(start);
  const endIndex = input.indexOf(end, startIndex);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`Unable to find migration section: ${start}`);
  }

  return input.slice(startIndex, endIndex);
}

function requireCapture(match: RegExpMatchArray, index: number) {
  const value = match[index];

  if (value === undefined) {
    throw new Error(`Missing regex capture ${index}.`);
  }

  return value;
}

function parseProgramRows(sql: string): ProgramSeedRow[] {
  const section = readSection(
    sql,
    'insert into public.training_programs',
    'on conflict (slug)',
  );
  const rowPattern =
    /\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,\s*'([^']+)'\s*,\s*(\d+)\s*\)/g;

  return [...section.matchAll(rowPattern)].map((match) => ({
    category: requireCapture(match, 4),
    description: requireCapture(match, 3),
    difficulty: requireCapture(match, 5),
    estimatedDays: Number(requireCapture(match, 6)),
    icon: requireCapture(match, 7),
    name: requireCapture(match, 2),
    slug: requireCapture(match, 1),
    sortOrder: Number(requireCapture(match, 8)),
  }));
}

function parseStepRows(sql: string): StepSeedRow[] {
  const section = readSection(
    sql,
    'with step_seed',
    'insert into public.training_steps',
  );
  const rowPattern =
    /\(\s*'([^']+)'\s*,\s*(\d+)\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*\)/g;

  return [...section.matchAll(rowPattern)].map((match) => ({
    durationMin: Number(requireCapture(match, 6)),
    instruction: requireCapture(match, 4),
    programSlug: requireCapture(match, 1),
    stepNumber: Number(requireCapture(match, 2)),
    tip: requireCapture(match, 5),
    title: requireCapture(match, 3),
  }));
}

function sentenceCount(value: string) {
  return value.split(/[.!?]+/).filter((sentence) => sentence.trim()).length;
}

describe('initial training program seed migration', () => {
  const migration = readMigration();
  const programRows = parseProgramRows(migration);
  const stepRows = parseStepRows(migration);

  it('seeds the expected programs with complete metadata', () => {
    expect(programRows.map((program) => program.slug)).toEqual(
      EXPECTED_PROGRAMS,
    );

    programRows.forEach((program, index) => {
      expect(program.name.trim()).toBeTruthy();
      expect(program.description.trim()).toBeTruthy();
      expect(TRAINING_PROGRAM_CATEGORIES).toContain(program.category);
      expect(TRAINING_PROGRAM_DIFFICULTIES).toContain(program.difficulty);
      expect(program.estimatedDays).toBeGreaterThan(0);
      expect(program.icon.trim()).toBeTruthy();
      expect(program.sortOrder).toBe((index + 1) * 10);
    });
  });

  it('seeds five to eight ordered steps for every program', () => {
    EXPECTED_PROGRAMS.forEach((slug) => {
      const programSteps = stepRows.filter((step) => step.programSlug === slug);
      const stepNumbers = programSteps.map((step) => step.stepNumber);

      expect(programSteps.length).toBeGreaterThanOrEqual(5);
      expect(programSteps.length).toBeLessThanOrEqual(8);
      expect(stepNumbers).toEqual(
        Array.from({ length: programSteps.length }, (_, index) => index + 1),
      );
    });
  });

  it('keeps every step concrete, self-assessable, and mobile-readable', () => {
    stepRows.forEach((step) => {
      expect(step.title.trim().length).toBeGreaterThan(3);
      expect(step.title.length).toBeLessThanOrEqual(32);
      expect(sentenceCount(step.instruction)).toBeGreaterThanOrEqual(2);
      expect(sentenceCount(step.instruction)).toBeLessThanOrEqual(3);
      expect(step.instruction).toContain('Success looks like');
      expect(step.tip.trim().length).toBeGreaterThan(12);
      expect(step.durationMin).toBeGreaterThan(0);
      expect(step.durationMin).toBeLessThanOrEqual(20);
    });
  });

  it('keeps the seed migration idempotent and positive-reinforcement safe', () => {
    const seedCopy = [migration, ...programRows, ...stepRows]
      .map((value) => JSON.stringify(value))
      .join('\n');

    expect(migration).toContain('on conflict (slug) do update');
    expect(migration).toContain(
      'on conflict (program_id, step_number) do update',
    );
    expect(seedCopy).not.toMatch(FORBIDDEN_TRAINING_LANGUAGE);
  });
});
