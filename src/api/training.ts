import { queryOptions } from '@tanstack/react-query';

import type { Database } from '@/types/supabase';

import { getSupabaseClient } from './supabaseClient';

export type TrainingProgramRow =
  Database['public']['Tables']['training_programs']['Row'];
export type TrainingStepRow =
  Database['public']['Tables']['training_steps']['Row'];
export type DogTrainingEnrollmentRow =
  Database['public']['Tables']['dog_training_enrollments']['Row'];
export type TrainingSessionRow =
  Database['public']['Tables']['training_sessions']['Row'];

export type TrainingProgramWithSteps = TrainingProgramRow & {
  steps: TrainingStepRow[];
};

export type TrainingQueryViewState<TData> =
  | {
      data: null;
      error: null;
      isEmpty: false;
      status: 'loading';
    }
  | {
      data: null;
      error: Error;
      isEmpty: false;
      status: 'error';
    }
  | {
      data: TData;
      error: null;
      isEmpty: boolean;
      status: 'success';
    };

export const trainingQueryKeys = {
  enrollmentsForDog: (dogId: string) =>
    ['training', 'enrollments', dogId] as const,
  programSteps: (programId: string) =>
    ['training', 'program-steps', programId] as const,
  programs: ['training', 'programs'] as const,
  programsWithSteps: ['training', 'programs-with-steps'] as const,
  sessionsForEnrollment: (enrollmentId: string) =>
    ['training', 'sessions', 'enrollment', enrollmentId] as const,
} as const;

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

function compareNullableNumber(a: number | null, b: number | null) {
  return (a ?? 0) - (b ?? 0);
}

function isEmptyData(data: unknown) {
  return Array.isArray(data) ? data.length === 0 : !data;
}

export function createTrainingQueryViewState<TData>(input: {
  data?: TData;
  error?: unknown;
  isLoading?: boolean;
}): TrainingQueryViewState<TData> {
  if (input.isLoading) {
    return {
      data: null,
      error: null,
      isEmpty: false,
      status: 'loading',
    };
  }

  if (input.error) {
    return {
      data: null,
      error: toError(input.error),
      isEmpty: false,
      status: 'error',
    };
  }

  if (input.data === undefined) {
    return {
      data: null,
      error: toError('Training data was not loaded.'),
      isEmpty: false,
      status: 'error',
    };
  }

  return {
    data: input.data,
    error: null,
    isEmpty: isEmptyData(input.data),
    status: 'success',
  };
}

export async function listTrainingPrograms() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('training_programs')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listTrainingStepsForProgram(programId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('training_steps')
    .select('*')
    .eq('program_id', programId)
    .order('step_number', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listTrainingStepsForPrograms(programIds: string[]) {
  if (programIds.length === 0) {
    return [];
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('training_steps')
    .select('*')
    .in('program_id', programIds)
    .order('program_id', { ascending: true })
    .order('step_number', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listTrainingProgramsWithSteps() {
  const programs = await listTrainingPrograms();
  const steps = await listTrainingStepsForPrograms(
    programs.map((program) => program.id),
  );

  return programs
    .map<TrainingProgramWithSteps>((program) => ({
      ...program,
      steps: steps
        .filter((step) => step.program_id === program.id)
        .sort((a, b) => a.step_number - b.step_number),
    }))
    .sort(
      (a, b) =>
        compareNullableNumber(a.sort_order, b.sort_order) ||
        a.name.localeCompare(b.name),
    );
}

export async function listDogTrainingEnrollments(dogId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('dog_training_enrollments')
    .select('*')
    .eq('dog_id', dogId)
    .order('started_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listTrainingSessionsForEnrollment(enrollmentId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .order('completed_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export function trainingProgramsQueryOptions() {
  return queryOptions({
    queryFn: listTrainingProgramsWithSteps,
    queryKey: trainingQueryKeys.programsWithSteps,
  });
}

export function trainingProgramStepsQueryOptions(programId: string) {
  return queryOptions({
    queryFn: () => listTrainingStepsForProgram(programId),
    queryKey: trainingQueryKeys.programSteps(programId),
  });
}

export function dogTrainingEnrollmentsQueryOptions(dogId: string) {
  return queryOptions({
    queryFn: () => listDogTrainingEnrollments(dogId),
    queryKey: trainingQueryKeys.enrollmentsForDog(dogId),
  });
}

export function trainingSessionsForEnrollmentQueryOptions(
  enrollmentId: string,
) {
  return queryOptions({
    queryFn: () => listTrainingSessionsForEnrollment(enrollmentId),
    queryKey: trainingQueryKeys.sessionsForEnrollment(enrollmentId),
  });
}
