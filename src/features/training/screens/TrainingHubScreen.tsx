import { useQuery } from '@tanstack/react-query';
import { type Href, useRouter } from 'expo-router';
import {
  AlertCircle,
  ChevronRight,
  Clock3,
  GraduationCap,
  Lock,
  RefreshCw,
} from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Button, Paragraph, XStack, YStack } from 'tamagui';

import {
  createTrainingQueryViewState,
  trainingProgramsQueryOptions,
  type TrainingProgramWithSteps,
} from '@/api/training';
import {
  BarklogButton,
  BarklogCard,
  BarklogScreenShell,
} from '@/components/ui';
import { FREE_V1_RELEASE } from '@/config/releaseMode';
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
  getActiveTrainingProgramPairs,
  getTrainingCategoryEmoji,
  getTrainingDifficultyLabel,
  getTrainingEnrollmentForProgram,
  getTrainingProgress,
  groupTrainingProgramsByCategory,
  type TrainingEnrollmentLike,
} from '../utils/trainingPresentation';

type ProgramCardProps = {
  badgeLabel?: string;
  enrollment?: TrainingEnrollmentLike | null;
  locked?: boolean;
  onPress: () => void;
  program: TrainingProgramWithSteps;
  readOnly?: boolean;
};

function TrainingSkeletonList() {
  return (
    <YStack gap="$md" accessibilityLabel="Loading training programs">
      <SkeletonBlock height={94} borderRadius={18} />
      <SkeletonBlock height={136} borderRadius={18} />
      <SkeletonBlock height={136} borderRadius={18} />
    </YStack>
  );
}

function TrainingEmptyCard({ body, title }: { body: string; title: string }) {
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

function ProgressBar({ percent }: { percent: number }) {
  return (
    <YStack
      accessibilityLabel={`${percent}% complete`}
      h={8}
      bg="$surface"
      br="$pill"
      overflow="hidden"
    >
      <YStack h="100%" width={`${percent}%`} bg="$aiAccent" br="$pill" />
    </YStack>
  );
}

function MetadataPill({ icon, label }: { icon?: string; label: string }) {
  return (
    <XStack
      ai="center"
      gap="$xs"
      minHeight={32}
      px="$sm"
      bg="$surface"
      bc="$borderColor"
      bw={1}
      br="$pill"
    >
      {icon ? (
        <Paragraph fontSize={13} lineHeight={16}>
          {icon}
        </Paragraph>
      ) : null}
      <Paragraph
        color="$textMuted"
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

function TrainingProgramCard({
  badgeLabel,
  enrollment = null,
  locked = false,
  onPress,
  program,
  readOnly = false,
}: ProgramCardProps) {
  const progress = getTrainingProgress(enrollment, program.steps.length);
  const categoryEmoji = getTrainingCategoryEmoji(program.category);
  let statusLabel = badgeLabel ?? `${program.steps.length} steps`;

  if (enrollment) {
    statusLabel = progress.isComplete ? 'Completed' : progress.label;
  } else if (readOnly) {
    statusLabel = 'Read-only';
  } else if (locked) {
    statusLabel = 'Premium';
  }

  return (
    <Button
      unstyled
      accessibilityLabel={`${program.name}. ${statusLabel}. Opens training program detail.`}
      accessibilityRole="button"
      bg="transparent"
      p={0}
      pressStyle={{ opacity: 0.92 }}
      onPress={onPress}
    >
      <BarklogCard
        bg={readOnly ? '$aiBackground' : '$surfaceRaised'}
        bc={readOnly ? '$aiBorder' : '$borderColor'}
        p="$lg"
        gap="$md"
      >
        <XStack ai="flex-start" gap="$md">
          <YStack
            w={48}
            h={48}
            br="$lg"
            bg="$aiBackground"
            bc="$aiBorder"
            bw={1}
            ai="center"
            jc="center"
          >
            <Paragraph fontSize={24} lineHeight={30}>
              {categoryEmoji}
            </Paragraph>
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
                {program.name}
              </Paragraph>
              {locked ? <Lock size={20} /> : <ChevronRight size={20} />}
            </XStack>
            <Paragraph
              color="$textMuted"
              fontFamily="$body"
              fontSize={barklogTypography.body}
              lineHeight={20}
            >
              {program.description}
            </Paragraph>
          </YStack>
        </XStack>

        <XStack flexWrap="wrap" gap="$sm">
          <MetadataPill
            label={getTrainingDifficultyLabel(program.difficulty)}
          />
          <MetadataPill icon="📅" label={`${program.estimated_days} days`} />
          <MetadataPill icon="✓" label={statusLabel} />
        </XStack>

        {enrollment ? (
          <YStack gap="$xs">
            <ProgressBar percent={progress.percent} />
            <Paragraph
              color="$textMuted"
              fontFamily="$body"
              fontSize={barklogTypography.caption}
              lineHeight={16}
            >
              {progress.completedSteps} of {progress.totalSteps} steps complete
            </Paragraph>
          </YStack>
        ) : null}
      </BarklogCard>
    </Button>
  );
}

export default function TrainingHubScreen() {
  const router = useRouter();
  const barklogUser = useLocalProfileStore((state) => state.barklogUser);
  const dogs = useLocalProfileStore((state) => state.dogs);
  const selectedDogId = useLocalProfileStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const premiumAccess = hasPremiumAccess(barklogUser);
  let trainingHeroTitle = 'Free training every week';
  if (FREE_V1_RELEASE) trainingHeroTitle = 'Guided training included';
  else if (premiumAccess) trainingHeroTitle = 'Guided training is Premium';
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
    isLoading: enrollmentsAreLoading,
  } = useLocalTrainingEnrollments(selectedDog?.id);
  const activeProgramPairs = useMemo(
    () =>
      premiumAccess && programState.status === 'success'
        ? getActiveTrainingProgramPairs(programState.data, enrollments)
        : [],
    [enrollments, premiumAccess, programState],
  );
  const groupedPrograms = useMemo(
    () =>
      programState.status === 'success'
        ? groupTrainingProgramsByCategory(programState.data)
        : [],
    [programState],
  );
  const freeWeeklyProgram = useMemo(
    () =>
      programState.status === 'success'
        ? getFreeWeeklyTrainingProgram(programState.data)
        : cachedFreeWeeklyProgram,
    [cachedFreeWeeklyProgram, programState],
  );
  const availableProgramGroups = useMemo(
    () =>
      groupedPrograms
        .map((group) => ({
          ...group,
          programs: premiumAccess
            ? group.programs
            : group.programs.filter(
                (program) => program.slug !== freeWeeklyProgram?.slug,
              ),
        }))
        .filter((group) => group.programs.length > 0),
    [freeWeeklyProgram?.slug, groupedPrograms, premiumAccess],
  );

  useEffect(() => {
    if (programState.status === 'success' && freeWeeklyProgram) {
      cacheFreeWeeklyTrainingProgram(freeWeeklyProgram);
    }
  }, [freeWeeklyProgram, programState.status]);

  const openProgram = (program: TrainingProgramWithSteps) => {
    const access = getTrainingProgramReadAccess({
      freeProgram: freeWeeklyProgram,
      premiumAccess,
      programSlug: program.slug,
    });

    HapticManager.light().catch(() => undefined);

    if (access === 'locked') {
      queueBarklogEvent('training_premium_gate_opened', {
        program_slug: program.slug,
        source: 'training_hub',
      });
      openPremiumGate(router, 'training-programs');
      return;
    }

    if (access === 'free_this_week') {
      queueBarklogEvent('free_training_program_opened', {
        program_slug: program.slug,
        source: 'training_hub',
      });
    }

    router.push(`/training/${program.slug}` as Href);
  };

  return (
    <BarklogScreenShell
      title="Training"
      subtitle="Browse positive-reinforcement programs and keep progress on this device."
    >
      <YStack gap="$lg">
        <BarklogCard tone="ai">
          <XStack ai="center" gap="$sm">
            <GraduationCap size={24} />
            <YStack flex={1} gap="$xs">
              <Paragraph
                color="$aiText"
                fontFamily="$body"
                fontSize={barklogTypography.title}
                lineHeight={24}
                fontWeight="500"
              >
                {trainingHeroTitle}
              </Paragraph>
              <Paragraph
                color="$textMuted"
                fontFamily="$body"
                fontSize={barklogTypography.body}
                lineHeight={20}
              >
                {premiumAccess
                  ? 'Start programs, log sessions, and keep progress on this device.'
                  : "Read this week's program free. Premium tracks progress and sessions."}
              </Paragraph>
            </YStack>
            {!premiumAccess ? <Lock size={20} /> : null}
          </XStack>
        </BarklogCard>

        {!selectedDog?.id ? (
          <TrainingEmptyCard
            title="Add a dog first"
            body="Training programs need a dog profile before BarkLog can save progress on this device."
          />
        ) : null}

        {enrollmentError ? (
          <TrainingEmptyCard
            title="Local progress unavailable"
            body={enrollmentError}
          />
        ) : null}

        {programState.status === 'loading' ? <TrainingSkeletonList /> : null}

        {programState.status === 'error' ? (
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
                Training catalog unavailable
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
        ) : null}

        {programState.status !== 'success' && freeWeeklyProgram ? (
          <YStack gap="$md">
            <YStack gap="$xs">
              <Paragraph
                color="$textPrimary"
                fontFamily="$body"
                fontSize={barklogTypography.title}
                lineHeight={24}
                fontWeight="500"
              >
                {FREE_V1_RELEASE ? 'Featured this week' : 'Free this week'}
              </Paragraph>
              <Paragraph
                color="$textMuted"
                fontFamily="$body"
                fontSize={barklogTypography.body}
                lineHeight={20}
              >
                {FREE_V1_RELEASE
                  ? 'Available offline on this device. Reconnect to load the full training catalog.'
                  : 'Available offline on this device. Premium tracks progress and training sessions.'}
              </Paragraph>
            </YStack>
            <TrainingProgramCard
              badgeLabel="Free this week"
              program={freeWeeklyProgram}
              readOnly
              onPress={() => openProgram(freeWeeklyProgram)}
            />
          </YStack>
        ) : null}

        {programState.status === 'success' ? (
          <YStack gap="$xl">
            <YStack gap="$md">
              <XStack ai="center" jc="space-between" gap="$md">
                <Paragraph
                  color="$textPrimary"
                  fontFamily="$body"
                  fontSize={barklogTypography.title}
                  lineHeight={24}
                  fontWeight="500"
                >
                  Active programs
                </Paragraph>
                {enrollmentsAreLoading ? <Clock3 size={18} /> : null}
              </XStack>

              {activeProgramPairs.length > 0 ? (
                activeProgramPairs.map(({ enrollment, program }) => (
                  <TrainingProgramCard
                    key={enrollment.id}
                    enrollment={enrollment}
                    program={program}
                    onPress={() => openProgram(program)}
                  />
                ))
              ) : (
                <TrainingEmptyCard
                  title="No active programs yet"
                  body={
                    premiumAccess
                      ? 'Choose a program below to start step-by-step progress for the selected dog.'
                      : "Tracking is Premium. You can still read this week's free program without saving progress."
                  }
                />
              )}
            </YStack>

            {freeWeeklyProgram ? (
              <YStack gap="$md">
                <YStack gap="$xs">
                  <Paragraph
                    color="$textPrimary"
                    fontFamily="$body"
                    fontSize={barklogTypography.title}
                    lineHeight={24}
                    fontWeight="500"
                  >
                    {FREE_V1_RELEASE ? 'Featured this week' : 'Free this week'}
                  </Paragraph>
                  <Paragraph
                    color="$textMuted"
                    fontFamily="$body"
                    fontSize={barklogTypography.body}
                    lineHeight={20}
                  >
                    {FREE_V1_RELEASE
                      ? 'Read programs and save progress on this device.'
                      : "Read this week's program free. Premium tracks progress and training sessions."}
                  </Paragraph>
                </YStack>
                <TrainingProgramCard
                  badgeLabel={
                    premiumAccess ? 'Featured this week' : 'Free this week'
                  }
                  enrollment={getTrainingEnrollmentForProgram(
                    premiumAccess ? enrollments : [],
                    freeWeeklyProgram.id,
                  )}
                  program={freeWeeklyProgram}
                  readOnly={!premiumAccess}
                  onPress={() => openProgram(freeWeeklyProgram)}
                />
              </YStack>
            ) : null}

            <YStack gap="$md">
              <Paragraph
                color="$textPrimary"
                fontFamily="$body"
                fontSize={barklogTypography.title}
                lineHeight={24}
                fontWeight="500"
              >
                Available programs
              </Paragraph>

              {programState.isEmpty ? (
                <TrainingEmptyCard
                  title="No programs found"
                  body="The training catalog is empty in this environment."
                />
              ) : null}

              {availableProgramGroups.map((group) => (
                <YStack key={group.category} gap="$sm">
                  <XStack ai="center" gap="$sm">
                    <Paragraph fontSize={18} lineHeight={22}>
                      {getTrainingCategoryEmoji(group.category)}
                    </Paragraph>
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

                  {group.programs.map((program) => {
                    const access = getTrainingProgramReadAccess({
                      freeProgram: freeWeeklyProgram,
                      premiumAccess,
                      programSlug: program.slug,
                    });

                    return (
                      <TrainingProgramCard
                        key={program.id}
                        enrollment={getTrainingEnrollmentForProgram(
                          premiumAccess ? enrollments : [],
                          program.id,
                        )}
                        locked={access === 'locked'}
                        program={program}
                        readOnly={access === 'free_this_week'}
                        onPress={() => openProgram(program)}
                      />
                    );
                  })}
                </YStack>
              ))}
            </YStack>
          </YStack>
        ) : null}

        {!premiumAccess ? (
          <BarklogButton
            label="See Premium options"
            tone="ai"
            leadingIcon={<Lock size={18} />}
            onPress={() => openPremiumGate(router, 'training-programs')}
          />
        ) : null}
      </YStack>
    </BarklogScreenShell>
  );
}
