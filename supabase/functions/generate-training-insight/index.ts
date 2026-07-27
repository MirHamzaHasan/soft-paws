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

const PROMPT_VERSION = 'training-insight-v1';

type TrainingInsightBody = {
  behavior_summary?: string;
  dog?: {
    age?: number | null;
    breed?: string | null;
    id?: string;
    name?: string;
    weight_lbs?: number | null;
  };
  enrollment?: {
    current_step?: number;
    program_name?: string;
    total_steps?: number;
  };
  mood_summary?: string;
  promptVersion?: string;
  training_summary?: string;
};

function isTrainingInsightBody(body: unknown): body is TrainingInsightBody {
  return Boolean(body && typeof body === 'object' && !Array.isArray(body));
}

function buildTrainingInsightPrompt(body: TrainingInsightBody) {
  const { dog } = body;
  const { enrollment } = body;

  return `Dog: ${dog?.name ?? 'Dog'}, ${dog?.breed ?? 'unknown breed'}, ${
    dog?.age ?? 'unknown'
  }y, ${dog?.weight_lbs ?? 'unknown'}lbs
Recent behavior events: ${body.behavior_summary ?? 'No behavior logs recorded.'}
Recent mood events: ${body.mood_summary ?? 'No mood check-ins recorded.'}
Training sessions: ${body.training_summary ?? 'No training sessions recorded.'}
Enrolled program: ${
    enrollment?.program_name ?? 'No active program'
  }, current step: ${enrollment?.current_step ?? 'unknown'}/${
    enrollment?.total_steps ?? 'unknown'
  }`;
}

const TRAINING_INSIGHT_SYSTEM_PROMPT = `You are a supportive dog training observer for the BarkLog app.
Analyze this dog's recent behavior logs, mood patterns, and training sessions.
Write 2-3 short, encouraging sentences about training progress.

RULES:
- Never give medical advice or diagnose behavioral disorders.
- Never claim to replace a professional trainer, behaviorist, or veterinarian.
- Focus on patterns: session consistency, success rating trends, behavior frequency changes, and mood correlations.
- If behavior incidents decreased since training started, mention it carefully as an observed log trend.
- If mood is often anxious before training sessions, suggest shorter sessions.
- Use positive reinforcement language only.
- Celebrate small wins.
- Do not prescribe treatment, tools, punishment, dominance methods, or aversive techniques.

Output only the observation. No preamble. No markdown.`;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return optionsResponse();
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      {
        error: 'method_not_allowed',
        message: 'Use POST for generate-training-insight.',
      },
      405,
    );
  }

  const body = await readJsonBody(request);

  if (!isTrainingInsightBody(body)) {
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
    !body.dog?.id ||
    !body.enrollment?.program_name
  ) {
    return jsonResponse(
      {
        error: 'invalid_prompt_contract',
        message: `Expected ${PROMPT_VERSION} with dog and enrollment context.`,
      },
      400,
    );
  }

  try {
    await requirePremiumAccess({
      dogId: body.dog.id,
      request,
    });

    const rawObservation = await createTextAiMessage({
      feature: 'generate-training-insight',
      maxTokens: 180,
      promptVersion: PROMPT_VERSION,
      system: TRAINING_INSIGHT_SYSTEM_PROMPT,
      user: buildTrainingInsightPrompt(body),
    });
    const observation = clampSentences(stripMarkdown(rawObservation), 3);

    return jsonResponse({
      generated_at: new Date().toISOString(),
      observation,
      prompt_version: PROMPT_VERSION,
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
          'BarkLog AI is unavailable right now. Training logs remain saved.',
      },
      502,
    );
  }
});
