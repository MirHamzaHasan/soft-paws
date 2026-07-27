import type { PremiumFeatureKey } from '@/features/premium/utils/premiumAccess';

export type AiAgentCategory =
  | 'behavior'
  | 'health'
  | 'household'
  | 'lifestyle'
  | 'records'
  | 'training';

export type AiAgentRequiredDataKey =
  | 'behavior_logs'
  | 'dog_profile'
  | 'expense_logs'
  | 'household_members'
  | 'meal_logs'
  | 'medications'
  | 'mood_logs'
  | 'photos'
  | 'recent_logs'
  | 'training_sessions'
  | 'vet_records';

export type AiAgentSafetyLevel = 'high' | 'low' | 'medium';

export type AiAgentEdgeFunctionName =
  | 'ask-barklog-ai'
  | 'generate-care-summary'
  | 'generate-training-insight'
  | 'generate-weekly-insight';

export type AiAgentRoute =
  | '/ask-ai'
  | '/expenses'
  | '/insights'
  | '/memory-book'
  | '/training'
  | '/vet-prep';

export type AiAgentId =
  | 'behavior-pattern'
  | 'care-coordinator'
  | 'expense-summary'
  | 'medication-adherence'
  | 'memory-book'
  | 'mood-pattern'
  | 'nutrition-consistency'
  | 'training-observer'
  | 'vet-prep'
  | 'weekly-health-summary';

export type AiAgentDefinition = {
  category: AiAgentCategory;
  description: string;
  edgeFunctionName?: AiAgentEdgeFunctionName;
  id: AiAgentId;
  premium: true;
  premiumFeature: PremiumFeatureKey;
  requiredData: AiAgentRequiredDataKey[];
  route: AiAgentRoute;
  safetyLevel: AiAgentSafetyLevel;
  title: string;
};

export const AI_AGENT_CATEGORY_LABELS: Record<AiAgentCategory, string> = {
  behavior: 'Mood and behavior',
  health: 'Health intelligence',
  household: 'Care coordination',
  lifestyle: 'Lifestyle',
  records: 'Records and reports',
  training: 'Training',
};

export const AI_AGENT_CATEGORY_ORDER: AiAgentCategory[] = [
  'health',
  'behavior',
  'training',
  'records',
  'lifestyle',
  'household',
];

export const AI_AGENT_REQUIRED_DATA_LABELS: Record<
  AiAgentRequiredDataKey,
  string
> = {
  behavior_logs: 'behavior logs',
  dog_profile: 'a dog profile',
  expense_logs: 'expense logs',
  household_members: 'household members',
  meal_logs: 'meal logs',
  medications: 'medication records',
  mood_logs: 'mood check-ins',
  photos: 'photos',
  recent_logs: 'recent logs',
  training_sessions: 'training sessions',
  vet_records: 'vet records',
};

export const APPROVED_AI_AGENT_EDGE_FUNCTIONS: AiAgentEdgeFunctionName[] = [
  'ask-barklog-ai',
  'generate-care-summary',
  'generate-training-insight',
  'generate-weekly-insight',
];

export const AI_AGENT_CATALOG: AiAgentDefinition[] = [
  {
    category: 'health',
    description:
      'Turns recent logs into a short weekly observation about care rhythms and changes.',
    edgeFunctionName: 'generate-weekly-insight',
    id: 'weekly-health-summary',
    premium: true,
    premiumFeature: 'weekly-insights',
    requiredData: ['dog_profile', 'recent_logs'],
    route: '/insights',
    safetyLevel: 'medium',
    title: 'Weekly Health Summary Agent',
  },
  {
    category: 'records',
    description:
      'Organizes recent care history into a vet-ready preparation workflow.',
    id: 'vet-prep',
    premium: true,
    premiumFeature: 'vet-pdf-reports',
    requiredData: ['dog_profile', 'recent_logs'],
    route: '/vet-prep',
    safetyLevel: 'medium',
    title: 'Vet Prep Agent',
  },
  {
    category: 'training',
    description:
      'Reviews training sessions with mood and behavior context for progress patterns.',
    edgeFunctionName: 'generate-training-insight',
    id: 'training-observer',
    premium: true,
    premiumFeature: 'training-programs',
    requiredData: ['dog_profile', 'training_sessions'],
    route: '/training',
    safetyLevel: 'medium',
    title: 'Training Observer Agent',
  },
  {
    category: 'behavior',
    description:
      'Summarizes behavior logs by incident, trigger, intensity, and context.',
    edgeFunctionName: 'ask-barklog-ai',
    id: 'behavior-pattern',
    premium: true,
    premiumFeature: 'ai-agents',
    requiredData: ['dog_profile', 'behavior_logs'],
    route: '/ask-ai',
    safetyLevel: 'medium',
    title: 'Behavior Pattern Agent',
  },
  {
    category: 'behavior',
    description:
      'Looks across mood check-ins and energy patterns without making health claims.',
    edgeFunctionName: 'ask-barklog-ai',
    id: 'mood-pattern',
    premium: true,
    premiumFeature: 'ai-agents',
    requiredData: ['dog_profile', 'mood_logs'],
    route: '/ask-ai',
    safetyLevel: 'low',
    title: 'Mood Pattern Agent',
  },
  {
    category: 'health',
    description:
      'Reviews medication logs and reminder history for adherence patterns.',
    edgeFunctionName: 'ask-barklog-ai',
    id: 'medication-adherence',
    premium: true,
    premiumFeature: 'ai-agents',
    requiredData: ['dog_profile', 'medications'],
    route: '/ask-ai',
    safetyLevel: 'medium',
    title: 'Medication Adherence Agent',
  },
  {
    category: 'health',
    description:
      'Compares meals and appetite logs to describe nutrition consistency.',
    edgeFunctionName: 'ask-barklog-ai',
    id: 'nutrition-consistency',
    premium: true,
    premiumFeature: 'ai-agents',
    requiredData: ['dog_profile', 'meal_logs'],
    route: '/ask-ai',
    safetyLevel: 'medium',
    title: 'Nutrition Consistency Agent',
  },
  {
    category: 'records',
    description:
      'Groups expense logs into simple care-cost summaries and categories.',
    id: 'expense-summary',
    premium: true,
    premiumFeature: 'expense-tracker',
    requiredData: ['dog_profile', 'expense_logs'],
    route: '/expenses',
    safetyLevel: 'low',
    title: 'Expense Summary Agent',
  },
  {
    category: 'lifestyle',
    description:
      'Uses photos and milestones to prepare memory-book story moments.',
    id: 'memory-book',
    premium: true,
    premiumFeature: 'memory-book',
    requiredData: ['dog_profile', 'photos'],
    route: '/memory-book',
    safetyLevel: 'low',
    title: 'Memory Book Agent',
  },
  {
    category: 'household',
    description:
      'Helps organize handoffs, shared care notes, and caregiver follow-ups.',
    edgeFunctionName: 'ask-barklog-ai',
    id: 'care-coordinator',
    premium: true,
    premiumFeature: 'ai-agents',
    requiredData: ['dog_profile', 'recent_logs'],
    route: '/ask-ai',
    safetyLevel: 'medium',
    title: 'Care Coordinator Agent',
  },
];

export function getAiAgentById(agentId: AiAgentId) {
  return AI_AGENT_CATALOG.find((agent) => agent.id === agentId) ?? null;
}

export function groupAiAgentsByCategory(agents = AI_AGENT_CATALOG) {
  return AI_AGENT_CATEGORY_ORDER.map((category) => ({
    agents: agents.filter((agent) => agent.category === category),
    category,
    label: AI_AGENT_CATEGORY_LABELS[category],
  })).filter((group) => group.agents.length > 0);
}

export function getAiAgentMissingDataLabels(
  missingData: AiAgentRequiredDataKey[],
) {
  return missingData.map((key) => AI_AGENT_REQUIRED_DATA_LABELS[key]);
}

export function isApprovedAiAgentEdgeFunctionName(
  value: string,
): value is AiAgentEdgeFunctionName {
  return APPROVED_AI_AGENT_EDGE_FUNCTIONS.includes(
    value as AiAgentEdgeFunctionName,
  );
}
