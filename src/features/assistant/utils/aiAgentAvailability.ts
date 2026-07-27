import type { WeeklyDashboardSnapshot } from '@/features/insights/utils/insightSummaries';

import {
  AI_AGENT_REQUIRED_DATA_LABELS,
  type AiAgentDefinition,
  type AiAgentRequiredDataKey,
} from '../data/aiAgentCatalog';

export type AiAgentDataAvailability = Record<AiAgentRequiredDataKey, boolean>;

export type AiAgentCardState =
  | {
      actionLabel: string;
      disabled: false;
      helper: string;
      kind: 'locked' | 'ready';
      missingData: [];
    }
  | {
      actionLabel: string;
      disabled: true;
      helper: string;
      kind: 'error' | 'loading' | 'needs_data' | 'no_dog';
      missingData: AiAgentRequiredDataKey[];
    };

function hasAnyEvent(snapshot: WeeklyDashboardSnapshot | null) {
  if (!snapshot) {
    return false;
  }

  return Object.values(snapshot.context.thisWeek.eventCounts).some(
    (count) => count > 0,
  );
}

function hasActiveMedication(snapshot: WeeklyDashboardSnapshot | null) {
  if (!snapshot) {
    return false;
  }

  return (
    snapshot.medicationCount > 0 ||
    snapshot.currentMedicationsSummary !== 'No active medications saved.'
  );
}

export function createAiAgentDataAvailability(input: {
  hasDog: boolean;
  snapshot: WeeklyDashboardSnapshot | null;
}): AiAgentDataAvailability {
  const { hasDog, snapshot } = input;
  const thisWeek = snapshot?.context.thisWeek;

  return {
    behavior_logs: (thisWeek?.behaviorCount ?? 0) > 0,
    dog_profile: hasDog,
    expense_logs: false,
    household_members: false,
    meal_logs: (thisWeek?.mealCount ?? 0) > 0,
    medications: hasActiveMedication(snapshot),
    mood_logs: (thisWeek?.moodCount ?? 0) > 0,
    photos: false,
    recent_logs: hasAnyEvent(snapshot),
    training_sessions: (thisWeek?.trainingCount ?? 0) > 0,
    vet_records: false,
  };
}

function getMissingData(
  agent: AiAgentDefinition,
  availability: AiAgentDataAvailability,
) {
  return agent.requiredData.filter((dataKey) => !availability[dataKey]);
}

function formatMissingData(missingData: AiAgentRequiredDataKey[]) {
  const labels = missingData.map((key) => AI_AGENT_REQUIRED_DATA_LABELS[key]);

  if (labels.length === 0) {
    return '';
  }

  if (labels.length === 1) {
    return labels[0];
  }

  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

export function getAiAgentCardState(input: {
  agent: AiAgentDefinition;
  availability: AiAgentDataAvailability;
  hasPremiumAccess: boolean;
  isLoadingContext: boolean;
  loadError: string | null;
}): AiAgentCardState {
  const { agent, availability, hasPremiumAccess, isLoadingContext, loadError } =
    input;

  if (!hasPremiumAccess) {
    return {
      actionLabel: 'Unlock Premium',
      disabled: false,
      helper:
        'Premium unlocks AI agents. Offline logging and manual export stay free.',
      kind: 'locked',
      missingData: [],
    };
  }

  if (isLoadingContext) {
    return {
      actionLabel: 'Loading context',
      disabled: true,
      helper: 'Checking local logs for useful agent context.',
      kind: 'loading',
      missingData: [],
    };
  }

  if (loadError) {
    return {
      actionLabel: 'Context unavailable',
      disabled: true,
      helper: loadError,
      kind: 'error',
      missingData: [],
    };
  }

  if (!availability.dog_profile) {
    return {
      actionLabel: 'Add a dog first',
      disabled: true,
      helper: 'AI agents need a selected dog profile.',
      kind: 'no_dog',
      missingData: ['dog_profile'],
    };
  }

  const missingData = getMissingData(agent, availability);

  if (missingData.length > 0) {
    return {
      actionLabel: 'Needs more logs',
      disabled: true,
      helper: `Log ${formatMissingData(
        missingData,
      )} before this agent can be useful.`,
      kind: 'needs_data',
      missingData,
    };
  }

  return {
    actionLabel: 'Open agent',
    disabled: false,
    helper: 'Ready to open with local BarkLog context.',
    kind: 'ready',
    missingData: [],
  };
}
