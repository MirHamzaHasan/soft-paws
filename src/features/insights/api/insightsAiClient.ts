import type { BarklogUserRow } from '@/api';
import { getSupabaseClient } from '@/api';
import type {
  GeneratedVetReport,
  VetReportAiContext,
} from '@/features/vet/utils/vetReportBuilder';
import { VET_REPORT_PROMPT_VERSION } from '@/features/vet/utils/vetReportBuilder';
import type { TrainingInsightContext } from '@/types/training';

import {
  assertPremiumAiAccess,
  BARKLOG_AI_SAFE_FAILURE_MESSAGE,
  getSafeAiErrorMessage,
} from '../utils/aiSafety';
import {
  CARE_SUMMARY_PROMPT_VERSION,
  type CareSummaryContext,
  type GeneratedSummary,
} from '../utils/generatedSummaries';
import type { WeeklyInsightContext } from '../utils/insightSummaries';

export const WEEKLY_INSIGHT_PROMPT_VERSION = 'weekly-insight-v1';
export const ASK_BARKLOG_AI_PROMPT_VERSION = 'ask-barklog-ai-v1';
export const TRAINING_INSIGHT_PROMPT_VERSION = 'training-insight-v1';
export const VET_REPORT_PROMPT_VERSION_CLIENT = VET_REPORT_PROMPT_VERSION;
export const CARE_SUMMARY_PROMPT_VERSION_CLIENT = CARE_SUMMARY_PROMPT_VERSION;

export type WeeklyInsightRequest = {
  context: WeeklyInsightContext;
  dogId: string;
  user: BarklogUserRow | null | undefined;
  weekStart: string;
};

export type WeeklyInsightResponse = {
  content: string;
  generatedAt: string;
  promptVersion: typeof WEEKLY_INSIGHT_PROMPT_VERSION;
};

export type AskBarkLogAiRequest = {
  context: {
    currentMedicationsSummary: string;
    dog: WeeklyInsightContext['dog'];
    last30DaysSummary: string;
    trainingContextSummary: string;
  };
  dogId: string;
  question: string;
  user: BarklogUserRow | null | undefined;
};

export type AskBarkLogAiResponse = {
  content: string;
  promptVersion: typeof ASK_BARKLOG_AI_PROMPT_VERSION;
};

export type GenerateTrainingInsightRequest = {
  context: TrainingInsightContext;
  user: BarklogUserRow | null | undefined;
};

export type GenerateTrainingInsightResponse = {
  generated_at: string;
  observation: string;
  prompt_version: typeof TRAINING_INSIGHT_PROMPT_VERSION;
};

export type GenerateCareSummaryRequest = {
  context: CareSummaryContext;
  dogId: string;
  user: BarklogUserRow | null | undefined;
};

export type GenerateCareSummaryResponse = {
  summary: GeneratedSummary;
};

export type GenerateVetReportRequest = {
  context: VetReportAiContext;
  dogId: string;
  user: BarklogUserRow | null | undefined;
};

export type GenerateVetReportResponse = {
  report: GeneratedVetReport;
};

function unwrapFunctionResponse<T>(input: {
  data: T | null;
  error: Error | null;
  fallbackMessage: string;
}) {
  if (input.error) {
    throw new Error(input.fallbackMessage);
  }

  if (!input.data) {
    throw new Error(input.fallbackMessage);
  }

  return input.data;
}

export async function generateWeeklyInsight(input: WeeklyInsightRequest) {
  try {
    assertPremiumAiAccess(input.user, 'weekly-insights');

    const supabase = getSupabaseClient();
    const { data, error } =
      await supabase.functions.invoke<WeeklyInsightResponse>(
        'generate-weekly-insight',
        {
          body: {
            context: input.context,
            dogId: input.dogId,
            promptVersion: WEEKLY_INSIGHT_PROMPT_VERSION,
            weekStart: input.weekStart,
          },
        },
      );

    return unwrapFunctionResponse({
      data,
      error,
      fallbackMessage: BARKLOG_AI_SAFE_FAILURE_MESSAGE,
    });
  } catch (error) {
    throw new Error(getSafeAiErrorMessage(error));
  }
}

export async function askBarkLogAi(input: AskBarkLogAiRequest) {
  try {
    assertPremiumAiAccess(input.user, 'ask-barklog-ai');

    const supabase = getSupabaseClient();
    const { data, error } =
      await supabase.functions.invoke<AskBarkLogAiResponse>('ask-barklog-ai', {
        body: {
          context: input.context,
          dogId: input.dogId,
          promptVersion: ASK_BARKLOG_AI_PROMPT_VERSION,
          question: input.question,
        },
      });

    return unwrapFunctionResponse({
      data,
      error,
      fallbackMessage: BARKLOG_AI_SAFE_FAILURE_MESSAGE,
    });
  } catch (error) {
    throw new Error(getSafeAiErrorMessage(error));
  }
}

export async function generateTrainingInsight(
  input: GenerateTrainingInsightRequest,
) {
  try {
    assertPremiumAiAccess(input.user, 'training-programs');

    const supabase = getSupabaseClient();
    const { data, error } =
      await supabase.functions.invoke<GenerateTrainingInsightResponse>(
        'generate-training-insight',
        {
          body: {
            ...input.context,
            promptVersion: TRAINING_INSIGHT_PROMPT_VERSION,
          },
        },
      );

    return unwrapFunctionResponse({
      data,
      error,
      fallbackMessage: BARKLOG_AI_SAFE_FAILURE_MESSAGE,
    });
  } catch (error) {
    throw new Error(getSafeAiErrorMessage(error));
  }
}

export async function generateCareSummary(input: GenerateCareSummaryRequest) {
  try {
    assertPremiumAiAccess(input.user, 'care-summaries');

    const supabase = getSupabaseClient();
    const { data, error } =
      await supabase.functions.invoke<GenerateCareSummaryResponse>(
        'generate-care-summary',
        {
          body: {
            context: input.context,
            dogId: input.dogId,
            promptVersion: CARE_SUMMARY_PROMPT_VERSION,
          },
        },
      );

    return unwrapFunctionResponse({
      data,
      error,
      fallbackMessage: BARKLOG_AI_SAFE_FAILURE_MESSAGE,
    });
  } catch (error) {
    throw new Error(getSafeAiErrorMessage(error));
  }
}

export async function generateVetReport(input: GenerateVetReportRequest) {
  try {
    assertPremiumAiAccess(input.user, 'vet-pdf-reports');

    const supabase = getSupabaseClient();
    const { data, error } =
      await supabase.functions.invoke<GenerateVetReportResponse>(
        'generate-vet-report',
        {
          body: {
            context: input.context,
            dogId: input.dogId,
            promptVersion: VET_REPORT_PROMPT_VERSION,
          },
        },
      );

    return unwrapFunctionResponse({
      data,
      error,
      fallbackMessage: BARKLOG_AI_SAFE_FAILURE_MESSAGE,
    });
  } catch (error) {
    throw new Error(getSafeAiErrorMessage(error));
  }
}
