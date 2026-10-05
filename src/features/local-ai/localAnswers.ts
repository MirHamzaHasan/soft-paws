import type { WeeklyDashboardSnapshot } from '@/features/insights/utils/insightSummaries';

export type LocalQuestionIntent =
  | 'summary'
  | 'change'
  | 'walks'
  | 'meals'
  | 'mood'
  | 'behavior';

export const LOCAL_QUESTION_EXAMPLES: ReadonlyArray<{
  intent: LocalQuestionIntent;
  question: string;
}> = [
  { intent: 'summary', question: 'Summarize the last 7 days' },
  {
    intent: 'summary',
    question: "Give me a summary of this week's dog care logs",
  },
  { intent: 'summary', question: 'What did I log this week?' },
  { intent: 'change', question: 'What changed compared with last week?' },
  { intent: 'change', question: 'Compare this week and last week' },
  {
    intent: 'change',
    question: 'How did this week differ from the previous week?',
  },
  { intent: 'walks', question: 'How many walks this week?' },
  { intent: 'walks', question: 'How many walks did I record?' },
  { intent: 'walks', question: 'Show my dog walking activity this week' },
  { intent: 'meals', question: 'How many meals did I log?' },
  { intent: 'meals', question: 'How many times did my dog eat this week?' },
  { intent: 'meals', question: 'Show meal logs this week' },
  { intent: 'mood', question: 'What mood check-ins did I record?' },
  { intent: 'mood', question: 'Show mood logs this week' },
  { intent: 'mood', question: "How was my dog's mood this week?" },
  { intent: 'behavior', question: 'What behavior did I record?' },
  { intent: 'behavior', question: 'Show behavior logs this week' },
  { intent: 'behavior', question: 'What behavior incidents did I log?' },
];

const CLINICAL_OR_ADVICE =
  /\b(should|why|diagnos\w*|treat\w*|dose|dosage|recommend\w*|safe|sick|symptom\w*|medicine|medication\w*|vet\w*|poison\w*|toxi\w*|hurt\w*|pain\w*|emergenc\w*|urgent|first aid|vomit\w*|diarrhea|cough\w*|blood\w*|stool|breath\w*|seizure\w*|letharg\w*|weight|appetite|healthy|normal|improv\w*|worsen\w*|wellbeing|well-being|fine|okay|risk|concern\w*)\b/i;

export function isLocalFactQuestion(question: string): boolean {
  return question.length <= 500 && !CLINICAL_OR_ADVICE.test(question);
}

export function isSupportedIntentQuestion(
  intent: LocalQuestionIntent,
  question: string,
): boolean {
  switch (intent) {
    case 'summary':
      return /\b(summar\w*|recap|what did i log)\b/i.test(question);
    case 'change':
      return /\b(chang\w*|compar\w*|differ\w*)\b/i.test(question);
    case 'walks':
      return /\b(how many|number|count|total)\b.*\b(walk\w*)\b/i.test(question);
    case 'meals':
      return /\b(how many|number|count|total)\b.*\b(meal\w*|ate|eat)\b/i.test(
        question,
      );
    case 'mood':
      return /\b(what|show|how)\b.*\b(mood|feeling|felt)\b/i.test(question);
    case 'behavior':
      return /\b(what|show)\b.*\b(behavio\w*|incident\w*)\b/i.test(question);
    default:
      return false;
  }
}

function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length || a.length === 0) return -1;
  let dot = 0;
  for (let index = 0; index < a.length; index += 1) {
    dot += a[index]! * b[index]!;
  }
  return dot;
}

export function classifyLocalQuestion(
  question: readonly number[],
  examples: ReadonlyArray<readonly number[]>,
): LocalQuestionIntent | null {
  if (examples.length !== LOCAL_QUESTION_EXAMPLES.length) return null;
  const scores = new Map<LocalQuestionIntent, number>();
  examples.forEach((embedding, index) => {
    const { intent } = LOCAL_QUESTION_EXAMPLES[index]!;
    scores.set(
      intent,
      Math.max(scores.get(intent) ?? -1, cosineSimilarity(question, embedding)),
    );
  });
  const ranked = [...scores].sort((a, b) => b[1] - a[1]);
  if (!ranked[0] || !ranked[1]) return null;
  if (ranked[0][1] < 0.72 || ranked[0][1] - ranked[1][1] < 0.08) return null;
  return ranked[0][0];
}

function countLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function changeLabel(current: number, previous: number, name: string) {
  const delta = current - previous;
  if (delta === 0) return `${name} stayed at ${current}`;
  return `${name} ${delta > 0 ? 'rose' : 'fell'} from ${previous} to ${current}`;
}

export function buildLocalFactAnswer(
  intent: LocalQuestionIntent,
  snapshot: WeeklyDashboardSnapshot,
): string {
  const { thisWeek, lastWeek, dog } = snapshot.context;
  let content: string;
  switch (intent) {
    case 'summary':
      content = `${dog.name}'s logs this week include ${countLabel(thisWeek.mealCount, 'meal')}, ${countLabel(thisWeek.eventCounts.walk, 'walk')} (${Math.round(thisWeek.walkMinutes)} minutes), ${countLabel(thisWeek.moodCount, 'mood check-in')}, and ${countLabel(thisWeek.behaviorCount, 'behavior log')}.`;
      break;
    case 'change':
      content = `Compared with last week, ${changeLabel(thisWeek.mealCount, lastWeek.mealCount, 'meal logs')}; ${changeLabel(thisWeek.eventCounts.walk, lastWeek.eventCounts.walk, 'walk logs')}; and ${changeLabel(thisWeek.moodCount, lastWeek.moodCount, 'mood check-ins')}.`;
      break;
    case 'walks':
      content = `You logged ${countLabel(thisWeek.eventCounts.walk, 'walk')} totaling ${Math.round(thisWeek.walkMinutes)} minutes this week.`;
      break;
    case 'meals':
      content = `You logged ${countLabel(thisWeek.mealCount, 'meal')} this week.`;
      break;
    case 'mood':
      content = `${thisWeek.moodSummary} You logged ${countLabel(thisWeek.moodCount, 'mood check-in')} this week.`;
      break;
    case 'behavior':
      content = `${thisWeek.behaviorSummary} You logged ${countLabel(thisWeek.behaviorCount, 'behavior log')} this week.`;
      break;
    default:
      throw new Error('Unsupported local journal question.');
  }
  return `${content} These are caregiver logs, not a diagnosis.`;
}
