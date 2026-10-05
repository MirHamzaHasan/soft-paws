import type { WeeklyDashboardSnapshot } from '@/features/insights/utils/insightSummaries';

import {
  buildLocalFactAnswer,
  classifyLocalQuestion,
  isLocalFactQuestion,
  isSupportedIntentQuestion,
  LOCAL_QUESTION_EXAMPLES,
} from './localAnswers';
import { embedLocalTexts, isStarterModelInstalled } from './localModel';

let exampleEmbeddingsPromise: Promise<number[][]> | null = null;

export async function tryAnswerLocalQuestion(input: {
  question: string;
  snapshot: WeeklyDashboardSnapshot;
}): Promise<string | null> {
  if (
    !isLocalFactQuestion(input.question) ||
    !(await isStarterModelInstalled())
  ) {
    return null;
  }
  if (!exampleEmbeddingsPromise) {
    exampleEmbeddingsPromise = embedLocalTexts(
      LOCAL_QUESTION_EXAMPLES.map((example) => example.question),
    ).catch((error: unknown) => {
      exampleEmbeddingsPromise = null;
      throw error;
    });
  }
  const examples = await exampleEmbeddingsPromise;
  const question = await embedLocalTexts([input.question]);
  const intent = question[0] && classifyLocalQuestion(question[0], examples);
  return intent && isSupportedIntentQuestion(intent, input.question)
    ? buildLocalFactAnswer(intent, input.snapshot)
    : null;
}
