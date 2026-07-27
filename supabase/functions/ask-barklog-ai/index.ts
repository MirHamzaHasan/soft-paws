import {
  clampWords,
  createTextAiMessage,
  stripMarkdown,
} from '../_shared/aiProvider.ts';
import { HttpError, requirePremiumAccess } from '../_shared/auth.ts';
import {
  jsonResponse,
  optionsResponse,
  readJsonBody,
} from '../_shared/http.ts';

const PROMPT_VERSION = 'ask-barklog-ai-v1';

type AskBarkLogAiBody = {
  context?: {
    currentMedicationsSummary?: string;
    dog?: {
      ageYears?: number | null;
      breed?: string | null;
      name?: string;
      weightLbs?: number | null;
    };
    last30DaysSummary?: string;
    trainingContextSummary?: string;
  };
  dogId?: string;
  promptVersion?: string;
  question?: string;
};

const EMERGENCY_PATTERN =
  /collapse|collapsed|trouble breathing|can't breathe|cannot breathe|seizure|poison|toxin|ate chocolate|ate grapes|xylitol|bloody stool|black stool|bloat|unconscious|hit by car/i;
const EMERGENCY_ESCALATION =
  'This could be urgent. Please call your vet or use Emergency SOS now, especially if breathing trouble, collapse, poisoning, bloat, seizure, or black/red stool is involved.';

function isAskBody(body: unknown): body is AskBarkLogAiBody {
  return Boolean(body && typeof body === 'object' && !Array.isArray(body));
}

function buildSystemPrompt(body: AskBarkLogAiBody) {
  const dog = body.context?.dog;

  return `You are BarkLog AI, a knowledgeable dog health assistant.
You have access to this dog's health data:
- Name: ${dog?.name ?? 'Dog'}, Breed: ${dog?.breed ?? 'unknown'}, Age: ${
    dog?.ageYears ?? 'unknown'
  }, Weight: ${dog?.weightLbs ?? 'unknown'}
- Recent events: ${
    body.context?.last30DaysSummary ?? 'No recent BarkLog events available.'
  }
- Current medications: ${
    body.context?.currentMedicationsSummary ?? 'No active medications saved.'
  }
- Training context: ${
    body.context?.trainingContextSummary ?? 'No active training context saved.'
  }
- Known conditions: none recorded

RULES:
- Always warm and supportive. Never clinical.
- Never diagnose. Say "This could be worth discussing with your vet" not "Your dog has X."
- Use training context only as logged observations. Never diagnose behavior disorders.
- Never claim to replace a professional trainer, behaviorist, or veterinarian.
- Use positive reinforcement language only. Do not recommend punishment, dominance theory, or aversive tools.
- Use breed-specific knowledge when relevant.
- Max 150 words per response.
- If emergency signs mentioned, immediately recommend calling vet or using Emergency SOS.
- End with a helpful follow-up question when appropriate.`;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return optionsResponse();
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      {
        error: 'method_not_allowed',
        message: 'Use POST for ask-barklog-ai.',
      },
      405,
    );
  }

  const body = await readJsonBody(request);

  if (!isAskBody(body) || !body.question?.trim()) {
    return jsonResponse(
      {
        error: 'invalid_request',
        message: 'Expected a question and BarkLog context.',
      },
      400,
    );
  }

  if (
    body.promptVersion !== PROMPT_VERSION ||
    !body.dogId ||
    typeof body.dogId !== 'string'
  ) {
    return jsonResponse(
      {
        error: 'invalid_prompt_contract',
        message: `Expected ${PROMPT_VERSION} with dogId.`,
      },
      400,
    );
  }

  if (EMERGENCY_PATTERN.test(body.question)) {
    return jsonResponse({
      content: EMERGENCY_ESCALATION,
      promptVersion: PROMPT_VERSION,
    });
  }

  try {
    await requirePremiumAccess({
      dogId: body.dogId,
      request,
    });

    const rawAnswer = await createTextAiMessage({
      feature: 'ask-barklog-ai',
      maxTokens: 240,
      promptVersion: PROMPT_VERSION,
      system: buildSystemPrompt(body),
      user: body.question,
    });
    const content = clampWords(stripMarkdown(rawAnswer), 150);

    return jsonResponse({
      content,
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
