import { useQuery } from '@tanstack/react-query';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertCircle,
  Check,
  ChevronLeft,
  Clock3,
  GraduationCap,
  Lock,
  PlayCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Button, Paragraph, XStack, YStack } from 'tamagui';

import {
  createTrainingQueryViewState,
  trainingProgramsQueryOptions,
  type TrainingProgramWithSteps,
  type TrainingStepRow,
} from '@/api/training';
import {
  BarklogButton,
  BarklogCard,
  BarklogScreenShell,
  BarklogToast,
} from '@/components/ui';
import {
  createLocalTrainingEnrollment,
  updateLocalTrainingEnrollment,
} from '@/db/training';
import { generateTrainingInsight } from '@/features/insights/api/insightsAiClient';
import { AI_FEATURES_ENABLED } from '@/config/featureFlags';
import { getSafeAiErrorMessage } from '@/features/insights/utils/aiSafety';
import { queueBarklogEvent } from '@/features/observability';
import { hasPremiumAccess } from '@/features/premium/utils/premiumAccess';
import { openPremiumGate } from '@/features/premium/utils/premiumNavigation';
import { SkeletonBlock } from '@/features/states/components/SkeletonBlock';
import HapticManager from '@/managers/HapticManager';
import { getSelectedDog, useLocalProfileStore } from '@/stores';
import { barklogTypography } from '@/theme/tokens';

import { useLocalTrainingEnrollments } from '../hooks/useLocalTrainingEnrollments';
import {
  cacheFreeWeeklyTrainingProgram,
  getCachedFreeWeeklyTrainingProgram,
} from '../utils/freeTrainingProgramCache';
import {
  getFreeWeeklyTrainingProgram,
  getTrainingProgramReadAccess,
} from '../utils/freeTrainingRotation';
import {
  hasEnoughTrainingInsightActivity,
  loadTrainingInsightContext,
} from '../utils/trainingInsightContext';
import {
  getCurrentTrainingStep,
  getNextTrainingEnrollmentUpdate,
  getTrainingCategoryEmoji,
  getTrainingCategoryLabel,
  getTrainingDifficultyLabel,
  getTrainingEnrollmentForProgram,
  getTrainingProgress,
} from '../utils/trainingPresentation';

type TrainingNotice = {
  description?: string;
  title: string;
  tone: 'danger' | 'success' | 'warning';
};

function DetailSkeleton() {
  return (
    <YStack gap="$md" accessibilityLabel="Loading training program">
      <SkeletonBlock height={140} borderRadius={18} />
      <SkeletonBlock height={96} borderRadius={18} />
      <SkeletonBlock height={220} borderRadius={18} />
    </YStack>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <YStack h={8} bg="$surface" br="$pill" overflow="hidden">
      <YStack h="100%" width={`${percent}%`} bg="$aiAccent" br="$pill" />
    </YStack>
  );
}

function DetailMessageCard({ body, title }: { body: string; title: string }) {
  return (
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
          {title}
        </Paragraph>
      </XStack>
      <Paragraph
        color="$textMuted"
        fontFamily="$body"
        fontSize={barklogTypography.body}
        lineHeight={20}
      >
        {body}
      </Paragraph>
    </BarklogCard>
  );
}

function MetadataPill({ label }: { label: string }) {
  return (
    <YStack
      minHeight={34}
      px="$sm"
      bg="$surface"
      bc="$borderColor"
      bw={1}
      br="$pill"
      ai="center"
      jc="center"
    >
      <Paragraph
        color="$textMuted"
        fontFamily="$body"
        fontSize={barklogTypography.caption}
        lineHeight={16}
        fontWeight="500"
      >
        {label}
      </Paragraph>
    </YStack>
  );
}

function StepStatusBadge({
  complete,
  current,
  stepNumber,
}: {
  complete: boolean;
  current: boolean;
  stepNumber: number;
}) {
  const background = complete || current ? '$aiAccent' : '$surfaceRaised';
  const border = complete || current ? '$aiAccent' : '$borderColor';
  const textColor = complete || current ? '$buttonText' : '$textMuted';

  return (
    <YStack
      w={34}
      h={34}
      br="$pill"
      bg={background}
      bc={border}
      bw={1}
      ai="center"
      jc="center"
    >
      {complete ? (
        <Check size={17} />
      ) : (
        <Paragraph
          color={textColor}
          fontFamily="$body"
          fontSize={barklogTypography.caption}
          lineHeight={16}
          fontWeight="500"
        >
          {stepNumber}
        </Paragraph>
      )}
    </YStack>
  );
}

function StepCard({
  currentStepNumber,
  forceExpanded = false,
  isComplete,
  step,
}: {
  currentStepNumber: number;
  forceExpanded?: boolean;
  isComplete: boolean;
  step: TrainingStepRow;
}) {
  const complete = isComplete || step.step_number < currentStepNumber;
  const current = !isComplete && step.step_number === currentStepNumber;
  const expanded = forceExpanded || current;

  return (
    <BarklogCard
      bg={current ? '$aiBackground' : '$surfaceRaised'}
      bc={current ? '$aiBorder' : '$borderColor'}
      gap="$sm"
    >
      <XStack ai="center" gap="$sm">
        <StepStatusBadge
          complete={complete}
          current={current}
          stepNumber={step.step_number}
        />
        <YStack flex={1} gap="$xs">
          <Paragraph
            color={current ? '$aiText' : '$textPrimary'}
            fontFamily="$body"
            fontSize={barklogTypography.body}
            lineHeight={20}
            fontWeight="500"
          >
            {step.title}
          </Paragraph>
          <Paragraph
            color="$textMuted"
            fontFamily="$body"
            fontSize={barklogTypography.caption}
            lineHeight={16}
          >
            {step.estimated_duration_min ?? 10} min
          </Paragraph>
        </YStack>
      </XStack>

      {expanded ? (
        <YStack gap="$sm">
          <Paragraph
            color="$textPrimary"
            fontFamily="$body"
            fontSize={barklogTypography.body}
            lineHeight={21}
          >
            {step.instruction}
          </Paragraph>
          {step.tip ? (
            <YStack
              bg="$surfaceRaised"
              bc="$aiBorder"
              bw={1}
              br="$lg"
              p="$md"
              gap="$xs"
            >
              <Paragraph
                color="$aiText"
                fontFamily="$body"
                fontSize={barklogTypography.caption}
                lineHeight={16}
                fontWeight="500"
              >
                Tip
              </Paragraph>
              <Paragraph
                color="$textMuted"
                fontFamily="$body"
                fontSize={barklogTypography.body}
                lineHeight={20}
              >
                {step.tip}
              </Paragraph>
            </YStack>
          ) : null}
        </YStack>
      ) : null}
    </BarklogCard>
  );
}

function CompletionCard({ program }: { program: TrainingProgramWithSteps }) {
  return (
    <BarklogCard tone="success">
      <XStack ai="center" gap="$sm">
        <GraduationCap size={24} />
        <YStack flex={1} gap="$xs">
          <Paragraph
            color="$textPrimary"
            fontFamily="$body"
            fontSize={barklogTypography.title}
            lineHeight={24}
            fontWeight="500"
          >
            Program complete
          </Paragraph>
          <Paragraph
            color="$textMuted"
            fontFamily="$body"
            fontSize={barklogTypography.body}
            lineHeight={20}
          >
            {program.name} has {program.steps.length} saved steps complete for
            this dog.
          </Paragraph>
        </YStack>
      </XStack>
    </BarklogCard>
  );
}

function TrainingInsightCard({
  body,
  isGenerating,
  premiumAccess,
  onGenerate,
  onUpgrade,
}: {
  body: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onUpgrade: () => void;
  premiumAccess: boolean;
}) {
  let actionLabel = 'Unlock with Premium';

  if (premiumAccess) {
    actionLabel = isGenerating ? 'Generating...' : 'Generate training insight';
  }

  return (
    <BarklogCard tone="ai">
      <XStack ai="center" gap="$sm">
        <Sparkles size={22} />
        <YStack flex={1} gap="$xs">
          <Paragraph
            color="$aiText"
            fontFamily="$body"
            fontSize={barklogTypography.title}
            lineHeight={24}
            fontWeight="500"
          >
            Training insight
          </Paragraph>
          <Paragraph
            color="$textMuted"
            fontFamily="$body"
            fontSize={barklogTypography.body}
            lineHeight={20}
          >
            {premiumAccess
              ? 'Generate a short observation from recent training, behavior, and mood logs.'
              : 'Premium turns saved training, behavior, and mood logs into safe observations.'}
          </Paragraph>
        </YStack>
      </XStack>

      {isGenerating ? (
        <YStack gap="$xs" accessibilityLabel="Generating training insight">
          <SkeletonBlock width="96%" height={16} borderRadius={8} />
          <SkeletonBlock width="88%" height={16} borderRadius={8} />
          <SkeletonBlock width="64%" height={16} borderRadius={8} />
        </YStack>
      ) : (
        <Paragraph
          color="$aiText"
          fontFamily="$body"
          fontSize={barklogTypography.body}
          lineHeight={21}
        >
          {body}
        </Paragraph>
      )}

      <BarklogButton
        label={actionLabel}
        tone={premiumAccess ? 'primary' : 'ai'}
        disabled={isGenerating}
        leadingIcon={
          premiumAccess ? <Sparkles size={18} /> : <Lock size={18} />
        }
        onPress={premiumAccess ? onGenerate : onUpgrade}
      />
    </BarklogCard>
  );
}

export default function TrainingProgramDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ programSlug?: string }>();
  const programSlug = Array.isArray(params.programSlug)
    ? params.programSlug[0]
    : params.programSlug;
  const barklogUser = useLocalProfileStore((state) => state.barklogUser);
  const dogs = useLocalProfileStore((state) => state.dogs);
  const selectedDogId = useLocalProfileStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const premiumAccess = hasPremiumAccess(barklogUser);
  const programsQuery = useQuery(trainingProgramsQueryOptions());
  const cachedFreeWeeklyProgram = useMemo(
    () => getCachedFreeWeeklyTrainingProgram(),
    [],
  );
  const programState = createTrainingQueryViewState({
    data: programsQuery.data,
    error: programsQuery.error,
    isLoading: programsQuery.isLoading,
  });
  const {
    enrollments,
    error: enrollmentError,
    refreshEnrollments,
  } = useLocalTrainingEnrollments(selectedDog?.id);
  const [notice, setNotice] = useState<TrainingNotice | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [trainingInsight, setTrainingInsight] = useState<string | null>(null);
  const [trainingInsightError, setTrainingInsightError] = useState<
    string | null
  >(null);
  const [isGeneratingTrainingInsight, setIsGeneratingTrainingInsight] =
    useState(false);
  const freeWeeklyProgram = useMemo(
    () =>
      programState.status === 'success'
        ? getFreeWeeklyTrainingProgram(programState.data)
        : cachedFreeWeeklyProgram,
    [cachedFreeWeeklyProgram, programState],
  );
  const program = useMemo(() => {
    if (!programSlug) {
      return null;
    }

    if (programState.status === 'success') {
      return (
        programState.data.find((item) => item.slug === programSlug) ?? null
      );
    }

    return cachedFreeWeeklyProgram?.slug === programSlug
      ? cachedFreeWeeklyProgram
      : null;
  }, [cachedFreeWeeklyProgram, programSlug, programState]);
  const readAccess = getTrainingProgramReadAccess({
    freeProgram: freeWeeklyProgram,
    premiumAccess,
    programSlug,
  });
  const canReadProgram = readAccess !== 'locked';
  const enrollment = program
    ? getTrainingEnrollmentForProgram(enrollments, program.id)
    : null;
  const effectiveEnrollment = premiumAccess ? enrollment : null;
  const progress = program
    ? getTrainingProgress(effectiveEnrollment, program.steps.length)
    : null;
  const currentStep = program
    ? getCurrentTrainingStep(program, effectiveEnrollment)
    : null;

  useEffect(() => {
    if (programState.status === 'success' && freeWeeklyProgram) {
      cacheFreeWeeklyTrainingProgram(freeWeeklyProgram);
    }
  }, [freeWeeklyProgram, programState.status]);

  const handleStartProgram = async () => {
    if (!premiumAccess) {
      queueBarklogEvent('training_premium_gate_opened', {
        program_slug: program?.slug ?? null,
        source: 'training_detail_start',
      });
      openPremiumGate(router, 'training-programs');
      return;
    }

    if (!program || !selectedDog?.id || !barklogUser?.id) {
      setNotice({
        description: 'Add a dog profile before saving training progress.',
        title: 'Training progress needs a dog',
        tone: 'warning',
      });
      return;
    }

    setIsSaving(true);
    setNotice(null);

    try {
      if (enrollment) {
        await updateLocalTrainingEnrollment({
          enrollmentId: enrollment.id,
          status: 'active',
        });
      } else {
        await createLocalTrainingEnrollment({
          currentStep: 1,
          dogId: selectedDog.id,
          programId: program.id,
          status: 'active',
          userId: barklogUser.id,
        });
      }

      await refreshEnrollments();
      await HapticManager.success();
      setNotice({
        description: `${program.name} is ready at step 1.`,
        title: 'Program started',
        tone: 'success',
      });
    } catch {
      await HapticManager.error();
      setNotice({
        description:
          'BarkLog could not save training progress on this device right now.',
        title: 'Unable to start program',
        tone: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdvanceStep = async () => {
    if (!program || !effectiveEnrollment || !progress) {
      return;
    }

    setIsSaving(true);
    setNotice(null);

    try {
      const updatePlan = getNextTrainingEnrollmentUpdate(
        effectiveEnrollment,
        program.steps.length,
        Date.now(),
      );

      await updateLocalTrainingEnrollment({
        completedAt: updatePlan.completedAt,
        currentStep: updatePlan.currentStep,
        enrollmentId: effectiveEnrollment.id,
        status: updatePlan.status,
      });
      await refreshEnrollments();
      await HapticManager.success();
      setNotice(
        updatePlan.status === 'completed'
          ? {
              description: `${program.name} is marked complete for this dog.`,
              title: 'Program complete',
              tone: 'success',
            }
          : {
              description: `Next up: step ${updatePlan.currentStep}.`,
              title: 'Progress saved',
              tone: 'success',
            },
      );
    } catch {
      await HapticManager.error();
      setNotice({
        description:
          'BarkLog could not update training progress on this device right now.',
        title: 'Unable to save progress',
        tone: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogSession = () => {
    if (!premiumAccess) {
      queueBarklogEvent('training_premium_gate_opened', {
        program_slug: program?.slug ?? null,
        source: 'training_detail_session',
      });
      openPremiumGate(router, 'training-programs');
      return;
    }

    if (!program || !effectiveEnrollment || !currentStep) {
      return;
    }

    router.push({
      pathname: '/training/session',
      params: {
        enrollmentId: effectiveEnrollment.id,
        programSlug: program.slug,
        stepId: currentStep.id,
      },
    } as Href);
  };

  const handleGenerateTrainingInsight = async () => {
    if (!premiumAccess) {
      queueBarklogEvent('training_premium_gate_opened', {
        program_slug: program?.slug ?? null,
        source: 'training_detail_insight',
      });
      openPremiumGate(router, 'training-programs');
      return;
    }

    if (!selectedDog || !program || !effectiveEnrollment) {
      setTrainingInsightError(
        'Start this program and log a training session before generating an insight.',
      );
      return;
    }

    setIsGeneratingTrainingInsight(true);
    setTrainingInsightError(null);

    try {
      await HapticManager.light();

      const context = await loadTrainingInsightContext({
        dog: selectedDog,
        enrollment: effectiveEnrollment,
        program,
      });

      if (!hasEnoughTrainingInsightActivity(context)) {
        setTrainingInsight(null);
        setTrainingInsightError(
          'Log at least one training session before generating a training insight.',
        );
        await HapticManager.warning();
        return;
      }

      const response = await generateTrainingInsight({
        context,
        user: barklogUser,
      });

      setTrainingInsight(response.observation);
      await HapticManager.success();
    } catch (insightError) {
      setTrainingInsightError(getSafeAiErrorMessage(insightError));
      await HapticManager.error();
    } finally {
      setIsGeneratingTrainingInsight(false);
    }
  };

  const renderBody = () => {
    if (programState.status === 'loading' && !program) {
      return <DetailSkeleton />;
    }

    if (programState.status === 'error' && !program) {
      return (
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
              Training program unavailable
            </Paragraph>
          </XStack>
          <Paragraph
            color="$textMuted"
            fontFamily="$body"
            fontSize={barklogTypography.body}
            lineHeight={20}
          >
            {programState.error.message}
          </Paragraph>
          <BarklogButton
            label="Retry"
            tone="secondary"
            leadingIcon={<RefreshCw size={18} />}
            onPress={() => {
              programsQuery.refetch().catch(() => undefined);
            }}
          />
        </BarklogCard>
      );
    }

    if (!program || !progress) {
      return (
        <DetailMessageCard
          title="Program not found"
          body="This training program is not available in the current catalog."
        />
      );
    }

    if (!canReadProgram) {
      return (
        <YStack gap="$lg">
          <BarklogCard tone="ai">
            <XStack ai="center" gap="$sm">
              <Lock size={22} />
              <YStack flex={1} gap="$xs">
                <Paragraph
                  color="$aiText"
                  fontFamily="$body"
                  fontSize={barklogTypography.title}
                  lineHeight={24}
                  fontWeight="500"
                >
                  Premium training program
                </Paragraph>
                <Paragraph
                  color="$textMuted"
                  fontFamily="$body"
                  fontSize={barklogTypography.body}
                  lineHeight={20}
                >
                  {freeWeeklyProgram
                    ? `This week's free program is ${freeWeeklyProgram.name}. Premium unlocks every program with progress tracking.`
                    : 'Premium unlocks every program with progress tracking.'}
                </Paragraph>
              </YStack>
            </XStack>
            <BarklogButton
              label="Unlock training"
              tone="ai"
              leadingIcon={<Lock size={18} />}
              onPress={() => {
                queueBarklogEvent('training_premium_gate_opened', {
                  program_slug: program.slug,
                  source: 'training_detail_locked',
                });
                openPremiumGate(router, 'training-programs');
              }}
            />
          </BarklogCard>
        </YStack>
      );
    }

    return (
      <YStack gap="$lg">
        <BarklogCard tone="ai">
          <XStack ai="flex-start" gap="$md">
            <YStack
              w={54}
              h={54}
              br="$lg"
              bg="$aiBackground"
              bc="$aiBorder"
              bw={1}
              ai="center"
              jc="center"
            >
              <Paragraph fontSize={28} lineHeight={34}>
                {getTrainingCategoryEmoji(program.category)}
              </Paragraph>
            </YStack>
            <YStack flex={1} gap="$sm">
              <Paragraph
                color="$aiText"
                fontFamily="$body"
                fontSize={barklogTypography.display}
                lineHeight={34}
                fontWeight="500"
              >
                {program.name}
              </Paragraph>
              <Paragraph
                color="$textMuted"
                fontFamily="$body"
                fontSize={barklogTypography.body}
                lineHeight={20}
              >
                {program.description}
              </Paragraph>
              <XStack flexWrap="wrap" gap="$sm">
                <MetadataPill
                  label={getTrainingCategoryLabel(program.category)}
                />
                <MetadataPill
                  label={getTrainingDifficultyLabel(program.difficulty)}
                />
                <MetadataPill label={`${program.estimated_days} days`} />
                <MetadataPill label={`${program.steps.length} steps`} />
              </XStack>
            </YStack>
          </XStack>

          {premiumAccess ? (
            <YStack gap="$xs">
              <XStack ai="center" jc="space-between" gap="$md">
                <Paragraph
                  color="$aiText"
                  fontFamily="$body"
                  fontSize={barklogTypography.caption}
                  lineHeight={16}
                  fontWeight="500"
                >
                  {progress.label}
                </Paragraph>
                <Paragraph
                  color="$textMuted"
                  fontFamily="$body"
                  fontSize={barklogTypography.caption}
                  lineHeight={16}
                >
                  {progress.percent}%
                </Paragraph>
              </XStack>
              <ProgressBar percent={progress.percent} />
            </YStack>
          ) : (
            <MetadataPill label="Free this week · read-only" />
          )}
        </BarklogCard>

        {notice ? (
          <BarklogToast
            title={notice.title}
            description={notice.description}
            tone={notice.tone}
          />
        ) : null}

        {enrollmentError ? (
          <DetailMessageCard
            title="Local progress unavailable"
            body={enrollmentError}
          />
        ) : null}

        {!selectedDog?.id ? (
          <DetailMessageCard
            title="Add a dog first"
            body="Training progress needs a dog profile before BarkLog can save it locally."
          />
        ) : null}

        {!effectiveEnrollment ? (
          <BarklogCard bg="$surfaceRaised">
            <XStack ai="center" gap="$sm">
              {!premiumAccess ? <Lock size={22} /> : <PlayCircle size={22} />}
              <YStack flex={1} gap="$xs">
                <Paragraph
                  color="$textPrimary"
                  fontFamily="$body"
                  fontSize={barklogTypography.title}
                  lineHeight={24}
                  fontWeight="500"
                >
                  {premiumAccess
                    ? 'Start guided progress'
                    : 'Read-only this week'}
                </Paragraph>
                <Paragraph
                  color="$textMuted"
                  fontFamily="$body"
                  fontSize={barklogTypography.body}
                  lineHeight={20}
                >
                  {premiumAccess
                    ? 'Save enrollment and step progress on this device.'
                    : "Read this week's program free. Premium tracks progress and sessions."}
                </Paragraph>
              </YStack>
            </XStack>
            <BarklogButton
              label={
                premiumAccess ? 'Start program' : 'Track progress with Premium'
              }
              tone={premiumAccess ? 'primary' : 'ai'}
              disabled={premiumAccess ? isSaving || !selectedDog?.id : false}
              onPress={() => {
                handleStartProgram().catch(() => undefined);
              }}
            />
          </BarklogCard>
        ) : null}

        {progress.isComplete ? <CompletionCard program={program} /> : null}

        {effectiveEnrollment && !progress.isComplete ? (
          <BarklogCard bg="$surfaceRaised">
            <XStack ai="center" gap="$sm">
              <Clock3 size={22} />
              <YStack flex={1} gap="$xs">
                <Paragraph
                  color="$textPrimary"
                  fontFamily="$body"
                  fontSize={barklogTypography.title}
                  lineHeight={24}
                  fontWeight="500"
                >
                  Current step
                </Paragraph>
                <Paragraph
                  color="$textMuted"
                  fontFamily="$body"
                  fontSize={barklogTypography.body}
                  lineHeight={20}
                >
                  {currentStep
                    ? `${currentStep.title} • ${
                        currentStep.estimated_duration_min ?? 10
                      } min`
                    : 'This program does not have a current step.'}
                </Paragraph>
              </YStack>
            </XStack>
            <XStack gap="$sm">
              <YStack flex={1}>
                <BarklogButton
                  label="Log session"
                  tone="secondary"
                  disabled={isSaving || !currentStep}
                  leadingIcon={<PlayCircle size={18} />}
                  onPress={handleLogSession}
                />
              </YStack>
              <YStack flex={1}>
                <BarklogButton
                  label={
                    progress.currentStep >= progress.totalSteps
                      ? 'Mark complete'
                      : 'Complete step'
                  }
                  disabled={isSaving}
                  onPress={() => {
                    handleAdvanceStep().catch(() => undefined);
                  }}
                />
              </YStack>
            </XStack>
            <Paragraph
              color="$textFaint"
              fontFamily="$body"
              fontSize={barklogTypography.caption}
              lineHeight={16}
            >
              Session logs create a Timeline event and are saved on this device.
            </Paragraph>
          </BarklogCard>
        ) : null}

        {AI_FEATURES_ENABLED && effectiveEnrollment ? (
          <TrainingInsightCard
            premiumAccess={premiumAccess}
            isGenerating={isGeneratingTrainingInsight}
            body={
              trainingInsight ??
              trainingInsightError ??
              'No personalized training insight generated yet.'
            }
            onGenerate={() => {
              handleGenerateTrainingInsight().catch(() => undefined);
            }}
            onUpgrade={() => openPremiumGate(router, 'training-programs')}
          />
        ) : null}

        <YStack gap="$md">
          <Paragraph
            color="$textPrimary"
            fontFamily="$body"
            fontSize={barklogTypography.title}
            lineHeight={24}
            fontWeight="500"
          >
            Steps
          </Paragraph>

          {program.steps.map((step) => (
            <StepCard
              key={step.id}
              currentStepNumber={progress.currentStep}
              forceExpanded={readAccess === 'free_this_week'}
              isComplete={progress.isComplete}
              step={step}
            />
          ))}
        </YStack>
      </YStack>
    );
  };

  return (
    <BarklogScreenShell>
      <YStack gap="$lg">
        <Button
          unstyled
          accessibilityLabel="Back to Training"
          accessibilityRole="button"
          alignSelf="flex-start"
          minHeight={44}
          px="$sm"
          bg="transparent"
          pressStyle={{ opacity: 0.72 }}
          onPress={() => router.back()}
        >
          <XStack ai="center" gap="$xs">
            <ChevronLeft size={20} />
            <Paragraph
              color="$textPrimary"
              fontFamily="$body"
              fontSize={barklogTypography.body}
              lineHeight={20}
              fontWeight="500"
            >
              Training
            </Paragraph>
          </XStack>
        </Button>

        {renderBody()}
      </YStack>
    </BarklogScreenShell>
  );
}
