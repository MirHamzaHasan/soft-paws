import {
  clampSentences,
  createTextAiMessage,
  stripMarkdown,
} from '../_shared/aiProvider.ts';
import { HttpError, requirePremiumAccess } from '../_shared/auth.ts';
import {
  jsonResponse,
  optionsResponse,
  readJsonBody,
} from '../_shared/http.ts';

const PROMPT_VERSION = 'care-summary-v1';

const SUMMARY_KINDS = [
  'weekly_health',
  'monthly_health',
  'mood',
  'behavior',
  'medication_adherence',
  'nutrition_consistency',
  'expense',
  'training',
] as const;

type SummaryKind = (typeof SUMMARY_KINDS)[number];

type CareSummaryBody = {
  context?: {
    comparisonSummary?: string;
    currentPeriodSummary?: string;
    dog?: {
      ageYears?: number | null;
      breed?: string | null;
      name?: string;
      weightLbs?: number | null;
    };
    expenseSummary?: string;
    focusSummary?: string;
    kind?: SummaryKind;
    medicationSummary?: string;
    rangeEnd?: string;
    rangeStart?: string;
  };
  dogId?: string;
  promptVersion?: string;
};

function isCareSummaryBody(body: unknown): body is CareSummaryBody {
  return Boolean(body && typeof body === 'object' && !Array.isArray(body));
}

function isSummaryKind(value: unknown): value is SummaryKind {
  return (
    typeof value === 'string' && SUMMARY_KINDS.includes(value as SummaryKind)
  );
}

function buildUserPrompt(body: CareSummaryBody) {
  const { context } = body;
  const dog = context?.dog;

  return `Summary kind: ${context?.kind ?? 'unknown'}
Dog: ${dog?.name ?? 'Dog'}, ${dog?.breed ?? 'unknown breed'}, ${
    dog?.ageYears ?? 'unknown'
  }y, ${dog?.weightLbs ?? 'unknown'}lbs
Range: ${context?.rangeStart ?? 'unknown'} to ${context?.rangeEnd ?? 'unknown'}
Current period: ${context?.currentPeriodSummary ?? 'No logs available.'}
Comparison period: ${context?.comparisonSummary ?? 'No comparison logs available.'}
Focus data: ${context?.focusSummary ?? 'No focused logs available.'}
Medication context: ${context?.medicationSummary ?? 'No medication context.'}
Expense context: ${context?.expenseSummary ?? 'No expense context.'}`;
}

const CARE_SUMMARY_SYSTEM_PROMPT = `You are BarkLog's generated summary writer.
Write one short Premium summary for a dog caregiver using only the provided BarkLog logs.

RULES:
- 1-3 sentences only.
- Never diagnose.
- Never say "your dog has".
- Never give treatment instructions.
- Do not generate medication dosage advice.
- Use "logged", "appears", "pattern", "trend", and "worth discussing" language.
- If urgent or repeated health concern patterns appear, say the logs are worth reviewing with a vet or Emergency SOS.
- Behavior and mood logs are caregiver observations, not clinical findings.
- Use positive reinforcement language only for training summaries and never claim to replace a trainer, behaviorist, or veterinarian.
- Expense summaries should be factual and category-based.
- No markdown, headings, or bullet lists.

Output only the summary.`;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return optionsResponse();
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      {
        error: 'method_not_allowed',
        message: 'Use POST for generate-care-summary.',
      },
      405,
    );
  }

  const body = await readJsonBody(request);

  if (!isCareSummaryBody(body)) {
    return jsonResponse(
      {
        error: 'invalid_request',
        message: 'Expected a JSON request body.',
      },
      400,
    );
  }

  if (
    body.promptVersion !== PROMPT_VERSION ||
    !body.dogId ||
    !isSummaryKind(body.context?.kind) ||
    !body.context?.rangeStart ||
    !body.context?.rangeEnd
  ) {
    return jsonResponse(
      {
        error: 'invalid_prompt_contract',
        message: `Expected ${PROMPT_VERSION} with dogId, summary kind, and date range.`,
      },
      400,
    );
  }

  try {
    await requirePremiumAccess({
      dogId: body.dogId,
      request,
    });

    const rawSummary = await createTextAiMessage({
      feature: 'generate-care-summary',
      maxTokens: 190,
      promptVersion: PROMPT_VERSION,
      system: CARE_SUMMARY_SYSTEM_PROMPT,
      user: buildUserPrompt(body),
    });
    const content = clampSentences(stripMarkdown(rawSummary), 3);

    return jsonResponse({
      summary: {
        content,
        dog_id: body.dogId,
        generated_at: new Date().toISOString(),
        id: `${body.dogId}-${body.context.kind}-${body.context.rangeStart}`,
        kind: body.context.kind,
        prompt_version: PROMPT_VERSION,
        range_end: body.context.rangeEnd,
        range_start: body.context.rangeStart,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse(
        {
          error: error.code,
          message: error.message,
        },
        error.status,
      );
    }

    return jsonResponse(
      {
        error: 'ai_generation_failed',
        message:
          'BarkLog AI is unavailable right now. Raw logs remain available.',
      },
      502,
    );
  }
});
