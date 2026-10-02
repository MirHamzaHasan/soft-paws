import { useQuery } from '@tanstack/react-query';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  GraduationCap,
  Lock,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Paragraph, TextArea, XStack, YStack } from 'tamagui';

import {
  createTrainingQueryViewState,
  trainingProgramsQueryOptions,
} from '@/api/training';
import {
  BarklogButton,
  BarklogCard,
  BarklogScreenShell,
  BarklogToast,
} from '@/components/ui';
import { createLocalTrainingSessionWithEvent } from '@/db/training';
import { hasPremiumAccess } from '@/features/premium/utils/premiumAccess';
import { openPremiumGate } from '@/features/premium/utils/premiumNavigation';
import { SkeletonBlock } from '@/features/states/components/SkeletonBlock';
import HapticManager from '@/managers/HapticManager';
import { getSelectedDog, useLocalProfileStore } from '@/stores';
import { barklogTypography } from '@/theme/tokens';
import { MOOD_OPTIONS, type MoodValue } from '@/types/events';

import { useLocalTrainingEnrollments } from '../hooks/useLocalTrainingEnrollments';
import { getCurrentTrainingStep } from '../utils/trainingPresentation';

type NoticeState = {
  description?: string;
  title: string;
  tone: 'danger' | 'success' | 'warning';
};

type DurationParseResult =
  | { ok: true; value: number | null }
  | { error: string; ok: false };

const SUCCESS_RATING_OPTIONS = [
  { accessibilityLabel: 'Success rating 1, struggled', label: '1', value: 1 },
  {
    accessibilityLabel: 'Success rating 2, still building',
    label: '2',
    value: 2,
  },
  { accessibilityLabel: 'Success rating 3, steady', label: '3', value: 3 },
  { accessibilityLabel: 'Success rating 4, strong', label: '4', value: 4 },
  { accessibilityLabel: 'Success rating 5, nailed it', label: '5', value: 5 },
] as const;

function readSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseDurationMinutes(value: string): DurationParseResult {
  const trimmed = value.trim();

  if (!trimmed) {
    return { ok: true, value: null };
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return {
      error: 'Duration must be a positive number of minutes.',
      ok: false,
    };
  }

  return { ok: true, value: Math.round(parsed) };
}

function LoggerSkeleton() {
  return (
    <YStack gap="$md" accessibilityLabel="Loading training session logger">
      <SkeletonBlock height={122} borderRadius={18} />
      <SkeletonBlock height={168} borderRadius={18} />
      <SkeletonBlock height={220} borderRadius={18} />
    </YStack>
  );
}

function MessageCard({ body, title }: { body: string; title: string }) {
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

function FieldLabel({ children }: { children: string }) {
  return (
    <Paragraph
      color="$textMuted"
      fontFamily="$body"
      fontSize={barklogTypography.overline}
      lineHeight={16}
      fontWeight="500"
      letterSpacing={1.2}
      textTransform="uppercase"
    >
      {children}
    </Paragraph>
  );
}

function SelectionChip({
  accessibilityLabel,
  label,
  onPress,
  selected,
}: {
  accessibilityLabel?: string;
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Button
      unstyled
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      minHeight={44}
      px="$md"
      bg={selected ? '$trainingBackground' : '$surfaceRaised'}
      bc={selected ? '$trainingText' : '$borderColor'}
      bw={1}
      br="$pill"
      ai="center"
      jc="center"
      pressStyle={{ opacity: 0.86 }}
      onPress={onPress}
    >
      <Paragraph
        color={selected ? '$trainingText' : '$textPrimary'}
        fontFamily="$body"
        fontSize={barklogTypography.body}
        lineHeight={20}
        fontWeight="500"
      >
        {label}
      </Paragraph>
    </Button>
  );
}

export default function TrainingSessionLoggerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    enrollmentId?: string | string[];
    programSlug?: string | string[];
    stepId?: string | string[];
  }>();
  const programSlug = readSingleParam(params.programSlug);
  const enrollmentId = readSingleParam(params.enrollmentId);
  const stepId = readSingleParam(params.stepId);
  const barklogUser = useLocalProfileStore((state) => state.barklogUser);
  const dogs = useLocalProfileStore((state) => state.dogs);
  const selectedDogId = useLocalProfileStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const premiumAccess = hasPremiumAccess(barklogUser);
  const programsQuery = useQuery(trainingProgramsQueryOptions());
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
  const [duration, setDuration] = useState('');
  const [durationWasTouched, setDurationWasTouched] = useState(false);
  const [successRating, setSuccessRating] = useState(3);
  const [dogMood, setDogMood] = useState<MoodValue>('calm');
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedEventId, setSavedEventId] = useState<string | null>(null);
  const program = useMemo(() => {
    if (programState.status !== 'success') {
      return null;
    }

    return (
      programState.data.find((item) => item.slug === programSlug) ??
      programState.data.find((item) =>
        item.steps.some((step) => step.id === stepId),
      ) ??
      null
    );
  }, [programSlug, programState, stepId]);
  const enrollment = useMemo(
    () =>
      enrollments.find((item) => item.id === enrollmentId) ??
      (program
        ? enrollments.find(
            (item) =>
              item.programId === program.id && item.status !== 'abandoned',
          )
        : null) ??
      null,
    [enrollmentId, enrollments, program],
  );
  const step = useMemo(() => {
    if (!program) {
      return null;
    }

    return (
      program.steps.find((item) => item.id === stepId) ??
      getCurrentTrainingStep(program, enrollment)
    );
  }, [enrollment, program, stepId]);

  useEffect(() => {
    if (!step || durationWasTouched) {
      return;
    }

    setDuration(String(step.estimated_duration_min ?? 10));
  }, [durationWasTouched, step]);

  const handleSave = async () => {
    if (!premiumAccess) {
      openPremiumGate(router, 'training-programs');
      return;
    }

    if (
      !selectedDog?.id ||
      !barklogUser?.id ||
      !program ||
      !step ||
      !enrollment
    ) {
      setFormError('BarkLog needs an active program and dog profile to save.');
      return;
    }

    const parsedDuration = parseDurationMinutes(duration);

    if (!parsedDuration.ok) {
      setFormError(parsedDuration.error);
      await HapticManager.error();
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setNotice(null);

    try {
      const result = await createLocalTrainingSessionWithEvent({
        dogId: selectedDog.id,
        dogMood,
        durationMin: parsedDuration.value,
        enrollmentId: enrollment.id,
        notes,
        programName: program.name,
        stepId: step.id,
        stepNumber: step.step_number,
        stepTitle: step.title,
        successRating,
        userId: barklogUser.id,
      });

      await HapticManager.success();
      setSavedEventId(result.event.id);
      setNotice({
        description:
          'The session and its Timeline event are saved on this device.',
        title: 'Training session saved',
        tone: 'success',
      });
    } catch {
      await HapticManager.error();
      setNotice({
        description:
          'BarkLog could not save the session on this device right now.',
        title: 'Unable to save session',
        tone: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderBody = () => {
    if (programState.status === 'loading' || enrollmentsAreLoading) {
      return <LoggerSkeleton />;
    }

    if (programState.status === 'error') {
      return (
        <MessageCard
          title="Training catalog unavailable"
          body={programState.error.message}
        />
      );
    }

    if (!premiumAccess) {
      return (
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
                Training tracking is Premium
              </Paragraph>
              <Paragraph
                color="$textMuted"
                fontFamily="$body"
                fontSize={barklogTypography.body}
                lineHeight={20}
              >
                You can browse programs for free. Premium saves sessions,
                progress, and Timeline history on this device.
              </Paragraph>
            </YStack>
          </XStack>
          <BarklogButton
            label="Unlock with Premium"
            tone="ai"
            onPress={() => openPremiumGate(router, 'training-programs')}
          />
        </BarklogCard>
      );
    }

    if (!selectedDog?.id) {
      return (
        <MessageCard
          title="Add a dog first"
          body="Training sessions need a dog profile before BarkLog can save them locally."
        />
      );
    }

    if (enrollmentError) {
      return (
        <MessageCard
          title="Local progress unavailable"
          body={enrollmentError}
        />
      );
    }

    if (!program || !step || !enrollment) {
      return (
        <MessageCard
          title="Start a program first"
          body="Open a training program and start it before logging a structured session."
        />
      );
    }

    return (
      <YStack gap="$lg">
        <BarklogCard tone="ai">
          <XStack ai="center" gap="$md">
            <YStack
              w={54}
              h={54}
              br="$lg"
              bg="$trainingBackground"
              bc="$trainingBorder"
              bw={1}
              ai="center"
              jc="center"
            >
              <GraduationCap size={26} />
            </YStack>
            <YStack flex={1} gap="$xs">
              <Paragraph
                color="$aiText"
                fontFamily="$body"
                fontSize={barklogTypography.title}
                lineHeight={24}
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
                Step {step.step_number}: {step.title}
              </Paragraph>
            </YStack>
          </XStack>
        </BarklogCard>

        {notice ? (
          <BarklogToast
            title={notice.title}
            description={notice.description}
            tone={notice.tone}
            icon={notice.tone === 'success' ? <CheckCircle2 size={20} /> : null}
          />
        ) : null}

        <BarklogCard bg="$surfaceRaised">
          <YStack gap="$xs">
            <FieldLabel>Duration</FieldLabel>
            <XStack
              ai="center"
              gap="$sm"
              minHeight="$input"
              px="$md"
              bg="$inputBackground"
              bc="$inputBorder"
              bw={1}
              br="$lg"
            >
              <Clock3 size={18} />
              <Input
                unstyled
                flex={1}
                color="$inputText"
                fontFamily="$body"
                fontSize={barklogTypography.body}
                keyboardType="number-pad"
                placeholder="10"
                placeholderTextColor="$textFaint"
                value={duration}
                onChangeText={(nextValue) => {
                  setDurationWasTouched(true);
                  setDuration(nextValue);
                }}
              />
              <Paragraph
                color="$textMuted"
                fontFamily="$body"
                fontSize={barklogTypography.caption}
                lineHeight={16}
              >
                min
              </Paragraph>
            </XStack>
          </YStack>

          <YStack gap="$sm">
            <FieldLabel>Success rating</FieldLabel>
            <XStack gap="$sm" flexWrap="wrap">
              {SUCCESS_RATING_OPTIONS.map((option) => (
                <YStack key={option.value} flex={1} minWidth={54}>
                  <SelectionChip
                    accessibilityLabel={option.accessibilityLabel}
                    label={option.label}
                    selected={successRating === option.value}
                    onPress={() => setSuccessRating(option.value)}
                  />
                </YStack>
              ))}
            </XStack>
            <Paragraph
              color="$textMuted"
              fontFamily="$body"
              fontSize={barklogTypography.caption}
              lineHeight={16}
            >
              1 struggled, 3 steady, 5 nailed it.
            </Paragraph>
          </YStack>

          <YStack gap="$sm">
            <FieldLabel>Dog mood during session</FieldLabel>
            <XStack flexWrap="wrap" gap="$sm">
              {MOOD_OPTIONS.map((option) => (
                <YStack key={option.value} minWidth={124} flexGrow={1}>
                  <SelectionChip
                    label={`${option.emoji} ${option.label}`}
                    selected={dogMood === option.value}
                    onPress={() => setDogMood(option.value)}
                  />
                </YStack>
              ))}
            </XStack>
          </YStack>

          <YStack gap="$xs">
            <FieldLabel>Notes</FieldLabel>
            <TextArea
              minHeight={118}
              color="$inputText"
              bg="$inputBackground"
              bc="$inputBorder"
              bw={1}
              br="$lg"
              fontFamily="$body"
              fontSize={barklogTypography.body}
              placeholder="What clicked today? What should you repeat next time?"
              placeholderTextColor="$textFaint"
              value={notes}
              onChangeText={setNotes}
            />
          </YStack>
        </BarklogCard>

        {formError ? (
          <BarklogToast
            title="Check session details"
            description={formError}
            tone="danger"
          />
        ) : null}

        <BarklogButton
          label={isSaving ? 'Saving...' : 'Save session'}
          disabled={isSaving}
          onPress={() => {
            handleSave().catch(() => undefined);
          }}
        />

        {savedEventId ? (
          <BarklogButton
            label="View Timeline event"
            tone="secondary"
            onPress={() => router.replace(`/event/${savedEventId}` as Href)}
          />
        ) : null}
      </YStack>
    );
  };

  return (
    <BarklogScreenShell>
      <YStack gap="$lg">
        <Button
          unstyled
          accessibilityLabel="Back to training program"
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
