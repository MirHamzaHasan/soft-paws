import { useFocusEffect } from '@react-navigation/native';
import { type Href, useRouter } from 'expo-router';
import {
  AlertCircle,
  Bot,
  Brain,
  ChevronRight,
  FileText,
  GraduationCap,
  HeartPulse,
  Image,
  Lock,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react-native';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { Button, Paragraph, XStack, YStack } from 'tamagui';

import {
  BarklogButton,
  BarklogCard,
  BarklogScreenShell,
  useBarklogFeedback,
} from '@/components/ui';
import {
  AI_AGENT_CATALOG,
  type AiAgentCategory,
  type AiAgentDefinition,
  groupAiAgentsByCategory,
} from '@/features/assistant/data/aiAgentCatalog';
import {
  createAiAgentDataAvailability,
  getAiAgentCardState,
} from '@/features/assistant/utils/aiAgentAvailability';
import type { WeeklyDashboardSnapshot } from '@/features/insights/utils/insightSummaries';
import { loadWeeklyDashboardSnapshot } from '@/features/insights/utils/insightSummaries';
import {
  captureBarklogError,
  queueBarklogEvent,
} from '@/features/observability';
import { hasPremiumAccess } from '@/features/premium/utils/premiumAccess';
import { openPremiumGate } from '@/features/premium/utils/premiumNavigation';
import { SkeletonBlock } from '@/features/states/components/SkeletonBlock';
import HapticManager from '@/managers/HapticManager';
import { getSelectedDog, useLocalProfileStore } from '@/stores';
import { barklogTypography } from '@/theme/tokens';

type ContextLoadState = 'error' | 'idle' | 'loading';

const categoryIconMap: Record<AiAgentCategory, ReactNode> = {
  behavior: <Brain size={20} />,
  health: <HeartPulse size={20} />,
  household: <Users size={20} />,
  lifestyle: <Image size={20} />,
  records: <FileText size={20} />,
  training: <GraduationCap size={20} />,
};

function AgentCenterSkeleton() {
  return (
    <YStack gap="$md" accessibilityLabel="Loading AI Agent Center">
      <SkeletonBlock height={92} borderRadius={18} />
      <SkeletonBlock height={144} borderRadius={18} />
      <SkeletonBlock height={144} borderRadius={18} />
      <SkeletonBlock height={144} borderRadius={18} />
    </YStack>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: 'locked' | 'ready' | 'waiting';
}) {
  const colorByTone = {
    locked: '$aiText',
    ready: '$success',
    waiting: '$textMuted',
  };

  return (
    <XStack
      ai="center"
      minHeight={30}
      px="$sm"
      br="$pill"
      bg="$surface"
      bc="$borderColor"
      bw={1}
    >
      <Paragraph
        color={colorByTone[tone]}
        fontFamily="$body"
        fontSize={barklogTypography.caption}
        lineHeight={16}
        fontWeight="500"
      >
        {label}
      </Paragraph>
    </XStack>
  );
}

function getStatusTone(kind: ReturnType<typeof getAiAgentCardState>['kind']) {
  if (kind === 'ready') {
    return 'ready';
  }

  if (kind === 'locked') {
    return 'locked';
  }

  return 'waiting';
}

function AgentCard({
  agent,
  contextLoadState,
  loadError,
  onPress,
  premiumAccess,
  snapshot,
  selectedDogExists,
}: {
  agent: AiAgentDefinition;
  contextLoadState: ContextLoadState;
  loadError: string | null;
  onPress: (agent: AiAgentDefinition) => void;
  premiumAccess: boolean;
  selectedDogExists: boolean;
  snapshot: WeeklyDashboardSnapshot | null;
}) {
  const availability = createAiAgentDataAvailability({
    hasDog: selectedDogExists,
    snapshot,
  });
  const cardState = getAiAgentCardState({
    agent,
    availability,
    hasPremiumAccess: premiumAccess,
    isLoadingContext: contextLoadState === 'loading',
    loadError,
  });
  const statusTone = getStatusTone(cardState.kind);

  return (
    <Button
      unstyled
      accessibilityLabel={`${agent.title}. ${cardState.kind}. ${agent.description}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: cardState.disabled }}
      bg="transparent"
      p={0}
      pressStyle={{ opacity: cardState.disabled ? 1 : 0.92 }}
      onPress={() => onPress(agent)}
    >
      <BarklogCard
        bg={cardState.kind === 'locked' ? '$aiBackground' : '$surfaceRaised'}
        bc={cardState.kind === 'locked' ? '$aiBorder' : '$borderColor'}
        p="$lg"
        gap="$md"
      >
        <XStack ai="flex-start" gap="$md">
          <YStack
            w={46}
            h={46}
            br="$lg"
            ai="center"
            jc="center"
            bg="$aiBackground"
            bc="$aiBorder"
            bw={1}
          >
            {cardState.kind === 'locked' ? (
              <Lock size={20} />
            ) : (
              <Bot size={20} />
            )}
          </YStack>

          <YStack flex={1} gap="$xs">
            <XStack ai="flex-start" jc="space-between" gap="$sm">
              <Paragraph
                flex={1}
                color="$textPrimary"
                fontFamily="$body"
                fontSize={barklogTypography.title}
                lineHeight={24}
                fontWeight="500"
              >
                {agent.title}
              </Paragraph>
              <ChevronRight size={20} />
            </XStack>
            <Paragraph
              color="$textMuted"
              fontFamily="$body"
              fontSize={barklogTypography.body}
              lineHeight={20}
            >
              {agent.description}
            </Paragraph>
          </YStack>
        </XStack>

        <XStack flexWrap="wrap" gap="$sm">
          <StatusPill label={cardState.actionLabel} tone={statusTone} />
          <StatusPill label={`${agent.safetyLevel} safety`} tone="waiting" />
        </XStack>

        <Paragraph
          color="$textMuted"
          fontFamily="$body"
          fontSize={barklogTypography.caption}
          lineHeight={18}
        >
          {cardState.helper}
        </Paragraph>
      </BarklogCard>
    </Button>
  );
}

export default function AiAgentCenterScreen() {
  const router = useRouter();
  const barklogUser = useLocalProfileStore((state) => state.barklogUser);
  const dogs = useLocalProfileStore((state) => state.dogs);
  const selectedDogId = useLocalProfileStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const premiumAccess = hasPremiumAccess(barklogUser);
  const [snapshot, setSnapshot] = useState<WeeklyDashboardSnapshot | null>(
    null,
  );
  const [contextLoadState, setContextLoadState] =
    useState<ContextLoadState>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const feedback = useBarklogFeedback();
  const groupedAgents = useMemo(
    () => groupAiAgentsByCategory(AI_AGENT_CATALOG),
    [],
  );

  const loadAgentContext = useCallback(
    (shouldSkipUpdate?: () => boolean) => {
      if (!selectedDog) {
        setSnapshot(null);
        setContextLoadState('idle');
        setLoadError(null);
        return;
      }

      setContextLoadState('loading');
      setLoadError(null);

      loadWeeklyDashboardSnapshot({ dog: selectedDog })
        .then((nextSnapshot) => {
          if (!shouldSkipUpdate?.()) {
            setSnapshot(nextSnapshot);
            setContextLoadState('idle');
          }
        })
        .catch((contextError) => {
          if (!shouldSkipUpdate?.()) {
            captureBarklogError(contextError, {
              source: 'ai_agent_center.context_load',
              extra: {
                dog_id: selectedDog.id,
              },
            });
            setSnapshot(null);
            setContextLoadState('error');
            setLoadError('Unable to load local agent context.');
          }
        });
    },
    [selectedDog],
  );

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      loadAgentContext(() => !isMounted);

      return () => {
        isMounted = false;
      };
    }, [loadAgentContext]),
  );

  const handleAgentPress = (agent: AiAgentDefinition) => {
    const availability = createAiAgentDataAvailability({
      hasDog: Boolean(selectedDog),
      snapshot,
    });
    const cardState = getAiAgentCardState({
      agent,
      availability,
      hasPremiumAccess: premiumAccess,
      isLoadingContext: contextLoadState === 'loading',
      loadError,
    });

    if (cardState.kind === 'locked') {
      HapticManager.light().catch(() => undefined);
      queueBarklogEvent('ai_agent_locked', {
        agent_category: agent.category,
        agent_id: agent.id,
      });
      openPremiumGate(router, agent.premiumFeature);
      return;
    }

    if (cardState.disabled) {
      HapticManager.warning().catch(() => undefined);
      feedback.showWarning({
        title:
          cardState.kind === 'loading'
            ? 'Agent context loading'
            : 'Agent not ready',
        description: cardState.helper,
      });
      return;
    }

    HapticManager.light().catch(() => undefined);
    queueBarklogEvent('ai_agent_opened', {
      agent_category: agent.category,
      agent_id: agent.id,
    });
    router.push(agent.route as Href);
  };

  return (
    <BarklogScreenShell
      title="AI Agent Center"
      subtitle="Specialist assistants for summaries, records, training, and care coordination. BarkLog AI organizes patterns and never diagnoses."
    >
      <YStack gap="$lg">
        <BarklogCard tone="ai">
          <XStack ai="flex-start" gap="$md">
            <YStack
              w={46}
              h={46}
              br="$lg"
              ai="center"
              jc="center"
              bg="$surfaceRaised"
              bc="$aiBorder"
              bw={1}
            >
              <Sparkles size={22} />
            </YStack>
            <YStack flex={1} gap="$xs">
              <Paragraph
                color="$aiText"
                fontFamily="$body"
                fontSize={barklogTypography.title}
                lineHeight={24}
                fontWeight="500"
              >
                {premiumAccess ? 'AI agents' : 'Browse every agent'}
              </Paragraph>
              <Paragraph
                color="$textMuted"
                fontFamily="$body"
                fontSize={barklogTypography.body}
                lineHeight={20}
              >
                {premiumAccess
                  ? 'AI agents are unavailable in this local-only build.'
                  : 'Free users keep offline logging, Timeline access, and manual export. Premium unlocks AI agents.'}
              </Paragraph>
            </YStack>
            {!premiumAccess ? <Lock size={20} /> : null}
          </XStack>
        </BarklogCard>

        {!selectedDog ? (
          <BarklogCard bg="$surfaceRaised">
            <XStack ai="center" gap="$sm">
              <AlertCircle size={22} />
              <Paragraph
                color="$textPrimary"
                fontFamily="$body"
                fontSize={barklogTypography.title}
                lineHeight={24}
                fontWeight="500"
              >
                Add a dog to use AI agents
              </Paragraph>
            </XStack>
            <Paragraph
              color="$textMuted"
              fontFamily="$body"
              fontSize={barklogTypography.body}
              lineHeight={20}
            >
              You can still browse the agent catalog. A dog profile gives each
              agent the right care-record context.
            </Paragraph>
          </BarklogCard>
        ) : null}

        {contextLoadState === 'loading' ? <AgentCenterSkeleton /> : null}

        {contextLoadState === 'error' ? (
          <BarklogCard bg="$surfaceRaised">
            <XStack ai="center" gap="$sm">
              <AlertCircle size={22} />
              <Paragraph
                color="$textPrimary"
                fontFamily="$body"
                fontSize={barklogTypography.title}
                lineHeight={24}
                fontWeight="500"
              >
                Agent context unavailable
              </Paragraph>
            </XStack>
            <Paragraph
              color="$textMuted"
              fontFamily="$body"
              fontSize={barklogTypography.body}
              lineHeight={20}
            >
              {loadError}
            </Paragraph>
            <BarklogButton
              label="Retry"
              tone="secondary"
              leadingIcon={<RefreshCw size={18} />}
              onPress={() => loadAgentContext()}
            />
          </BarklogCard>
        ) : null}

        {groupedAgents.map((group) => (
          <YStack key={group.category} gap="$sm">
            <XStack ai="center" gap="$sm">
              {categoryIconMap[group.category]}
              <Paragraph
                color="$textMuted"
                fontFamily="$body"
                fontSize={barklogTypography.overline}
                lineHeight={16}
                fontWeight="500"
                letterSpacing={1.2}
                textTransform="uppercase"
              >
                {group.label}
              </Paragraph>
            </XStack>

            {group.agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                contextLoadState={contextLoadState}
                loadError={loadError}
                premiumAccess={premiumAccess}
                selectedDogExists={Boolean(selectedDog)}
                snapshot={snapshot}
                onPress={handleAgentPress}
              />
            ))}
          </YStack>
        ))}
      </YStack>
    </BarklogScreenShell>
  );
}
