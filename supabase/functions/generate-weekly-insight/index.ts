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

const PROMPT_VERSION = 'weekly-insight-v1';

type EventSummary = {
  behaviorSummary?: string;
  eventsSummary?: string;
  moodSummary?: string;
  trainingSummary?: string;
};

type WeeklyInsightBody = {
  context?: {
    dog?: {
      ageYears?: number | null;
      breed?: string | null;
      name?: string;
      weightLbs?: number | null;
    };
    lastWeek?: EventSummary;
    thisWeek?: EventSummary;
  };
  dogId?: string;
  promptVersion?: string;
  weekStart?: string;
};

function isWeeklyInsightBody(body: unknown): body is WeeklyInsightBody {
  return Boolean(body && typeof body === 'object' && !Array.isArray(body));
}

function buildWeeklyInsightPrompt(body: WeeklyInsightBody) {
  const dog = body.context?.dog;

  return `Dog: ${dog?.name ?? 'Dog'}, ${dog?.breed ?? 'unknown breed'}, ${
    dog?.ageYears ?? 'unknown'
  }y, ${dog?.weightLbs ?? 'unknown'}lbs
This week: ${body.context?.thisWeek?.eventsSummary ?? 'No events logged.'}
This week mood: ${
    body.context?.thisWeek?.moodSummary ?? 'No mood check-ins recorded.'
  }
This week behavior: ${
    body.context?.thisWeek?.behaviorSummary ?? 'No behavior logs recorded.'
  }
This week training: ${
    body.context?.thisWeek?.trainingSummary ?? 'No training sessions recorded.'
  }
Last week: ${body.context?.lastWeek?.eventsSummary ?? 'No events logged.'}
Last week mood: ${
    body.context?.lastWeek?.moodSummary ?? 'No mood check-ins recorded.'
  }
Last week behavior: ${
    body.context?.lastWeek?.behaviorSummary ?? 'No behavior logs recorded.'
  }
Last week training: ${
    body.context?.lastWeek?.trainingSummary ?? 'No training sessions recorded.'
  }`;
}

const WEEKLY_INSIGHT_SYSTEM_PROMPT = `You are a veterinary health observer for the BarkLog app.
Analyze 7 days of dog activity data and write ONE short, helpful observation.

RULES:
- 1-2 sentences only.
- Never diagnose and never give treatment instructions.
- Never say "your dog has" or claim a condition is present.
- If logs mention emergency language, say the pattern is worth immediate vet or Emergency SOS review.
- Focus on patterns: compared to prior week, unusual gaps, positive streaks.
- Mood check-ins are caregiver observations. Use them only for pattern context.
- Behavior logs are caregiver observations. Use frequency, trigger, and intensity only as pattern context.
- Training sessions are caregiver logs. You may mention consistency, success rating trends, program names, and mood patterns.
- Do not diagnose behavioral disorders or claim BarkLog replaces a trainer, behaviorist, or veterinarian.
- Do not give step-by-step training advice here.
- Warm, supportive tone. Never alarming.
- If nothing notable: write an encouraging observation.

Output only the observation. No preamble. No markdown.`;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return optionsResponse();
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      {
        error: 'method_not_allowed',
        message: 'Use POST for generate-weekly-insight.',
      },
      405,
    );
  }

  const body = await readJsonBody(request);

  if (!isWeeklyInsightBody(body)) {
    return jsonResponse(
      {
        error: 'invalid_request',
        message: 'Expected a JSON request body.',
      },
      400,
    );
  }

  if (body.promptVersion !== PROMPT_VERSION || !body.dogId || !body.weekStart) {
    return jsonResponse(
      {
        error: 'invalid_prompt_contract',
        message: `Expected ${PROMPT_VERSION} with dogId and weekStart.`,
      },
      400,
    );
  }

  try {
    await requirePremiumAccess({
      dogId: body.dogId,
      request,
    });

    const rawObservation = await createTextAiMessage({
      feature: 'generate-weekly-insight',
      maxTokens: 120,
      promptVersion: PROMPT_VERSION,
      system: WEEKLY_INSIGHT_SYSTEM_PROMPT,
      user: buildWeeklyInsightPrompt(body),
    });
    const content = clampSentences(stripMarkdown(rawObservation), 2);

    return jsonResponse({
      content,
      generatedAt: new Date().toISOString(),
      promptVersion: PROMPT_VERSION,
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
          'BarkLog AI is unavailable right now. Your logs remain available.',
      },
      502,
    );
  }
});
