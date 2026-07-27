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

const PROMPT_VERSION = 'vet-report-v1';

type VetReportBody = {
  context?: Record<string, unknown>;
  dogId?: string;
  promptVersion?: string;
};

type ParsedVetReport = {
  questions: string[];
  summary: string;
};

const VET_REPORT_SYSTEM_PROMPT = `You are BarkLog's vet report preparation assistant.
Create a short, factual caregiver-facing report summary and questions for a veterinary visit using only the provided BarkLog logs.

RULES:
- Never diagnose.
- Never say "your dog has".
- Never give medication dosage instructions or treatment instructions.
- Keep outputs factual, timestamp-aware, and source-aware.
- Treat caregiver-entered logs as observations, not clinical findings.
- Mention urgent or severe logs only as "worth reviewing with a vet" or "use Emergency SOS for urgent signs".
- Do not replace a veterinarian, trainer, or behaviorist.
- Return valid JSON only with this shape: {"summary":"1-3 short sentences","questions":["question 1","question 2","question 3"]}.
- No markdown.`;

function isVetReportBody(body: unknown): body is VetReportBody {
  return Boolean(body && typeof body === 'object' && !Array.isArray(body));
}

function buildUserPrompt(body: VetReportBody) {
  return JSON.stringify(
    {
      context: body.context,
      dogId: body.dogId,
      promptVersion: body.promptVersion,
    },
    null,
    2,
  );
}

function parseReportJson(rawText: string): ParsedVetReport {
  try {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    const summary =
      typeof parsed.summary === 'string'
        ? clampSentences(stripMarkdown(parsed.summary), 3)
        : clampSentences(stripMarkdown(rawText), 3);
    const questions = Array.isArray(parsed.questions)
      ? parsed.questions
          .filter(
            (question): question is string => typeof question === 'string',
          )
          .map((question) => stripMarkdown(question).replace(/\?*$/, '?'))
          .filter(Boolean)
          .slice(0, 5)
      : [];

    return {
      questions,
      summary,
    };
  } catch {
    return {
      questions: [
        'Do any recent logs need follow-up or monitoring?',
        'Should any medication schedule notes be updated in BarkLog?',
        'Are meal, bathroom, walk, mood, and behavior patterns useful context for the care plan?',
      ],
      summary: clampSentences(stripMarkdown(rawText), 3),
    };
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return optionsResponse();
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      {
        error: 'method_not_allowed',
        message: 'Use POST for generate-vet-report.',
      },
      405,
    );
  }

  const body = await readJsonBody(request);

  if (!isVetReportBody(body)) {
    return jsonResponse(
      {
        error: 'invalid_request',
        message: 'Expected a JSON request body.',
      },
      400,
    );
  }

  if (body.promptVersion !== PROMPT_VERSION || !body.dogId || !body.context) {
    return jsonResponse(
      {
        error: 'invalid_prompt_contract',
        message: `Expected ${PROMPT_VERSION} with dogId and report context.`,
      },
      400,
    );
  }

  try {
    await requirePremiumAccess({
      dogId: body.dogId,
      request,
    });

    const rawReport = await createTextAiMessage({
      feature: 'generate-vet-report',
      maxTokens: 450,
      promptVersion: PROMPT_VERSION,
      system: VET_REPORT_SYSTEM_PROMPT,
      user: buildUserPrompt(body),
    });
    const parsedReport = parseReportJson(rawReport);

    return jsonResponse({
      report: {
        generatedAt: new Date().toISOString(),
        promptVersion: PROMPT_VERSION,
        questions: parsedReport.questions,
        summary: parsedReport.summary,
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
          'BarkLog AI is unavailable right now. Raw logs and manual export remain available.',
      },
      502,
    );
  }
});
