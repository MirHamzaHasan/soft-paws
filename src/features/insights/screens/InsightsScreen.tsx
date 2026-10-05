import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { trainingProgramsQueryOptions } from '@/api/training';
import { useBarklogFeedback } from '@/components/ui';
import { AI_FEATURES_ENABLED, LOCAL_AI_ENABLED } from '@/config/featureFlags';
import {
  getFirebaseAiAuthEmail,
  subscribeFirebaseAiAuth,
} from '@/features/auth/services/firebaseAiAuth';
import {
  captureBarklogError,
  queueBarklogEvent,
} from '@/features/observability';
import HapticManager from '@/managers/HapticManager';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import {
  type ExpenseModel,
  getLocalInsightForWeek,
  type InsightModel,
  listLocalExpensesForDogYear,
  upsertLocalInsight,
} from '../../../db';
import { getSelectedDog, useLocalProfileStore } from '../../../stores';
import { HomeShell } from '../../home/components/HomeShell';
import {
  getPremiumFeatureLabel,
  hasPremiumAccess,
} from '../../premium/utils/premiumAccess';
import { openPremiumGate } from '../../premium/utils/premiumNavigation';
import { useLocalTrainingEnrollments } from '../../training/hooks/useLocalTrainingEnrollments';
import {
  hasEnoughTrainingInsightActivity,
  loadTrainingInsightContext,
} from '../../training/utils/trainingInsightContext';
import { getActiveTrainingProgramPairs } from '../../training/utils/trainingPresentation';
import {
  generateCareSummary,
  generateTrainingInsight,
  generateWeeklyInsight,
} from '../api/insightsAiClient';
import {
  ExportIcon,
  MealsIcon,
  MedsIcon,
  PoopsIcon,
  ShareIcon,
  SparklesIcon,
  WalksIcon,
} from '../components/InsightsIcons';
import { InsightsLineChartCard } from '../components/InsightsLineChartCard';
import { InsightsNarrativeCard } from '../components/InsightsNarrativeCard';
import { InsightsSnapshotCard } from '../components/InsightsSnapshotCard';
import { getSafeAiErrorMessage } from '../utils/aiSafety';
import {
  buildCareSummaryContext,
  type GeneratedSummary,
  hasEnoughDataForSummary,
  SUMMARY_DEFINITIONS,
  type SummaryKind,
} from '../utils/generatedSummaries';
import {
  loadWeeklyDashboardSnapshot,
  type WeeklyDashboardSnapshot,
} from '../utils/insightSummaries';

const styles = StyleSheet.create({
  stack: {
    gap: 32,
  },
  hero: {
    gap: 6,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 18,
  },
  weekControls: {
    flexDirection: 'row',
    gap: 10,
  },
  weekButton: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D8D2CC',
    backgroundColor: '#FFFCFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekButtonText: {
    color: '#0A0A0A',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '400',
  },
  title: {
    color: '#0A0A0A',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '500',
    letterSpacing: -1.1,
  },
  subtitle: {
    color: '#5F6670',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  tileCell: {
    flexBasis: '46%',
    flexGrow: 1,
    minWidth: 140,
  },
  actions: {
    gap: 14,
    marginTop: 8,
  },
  statusText: {
    color: '#687079',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  skeletonCard: {
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D8CCFF',
    backgroundColor: '#F7F4FF',
    paddingHorizontal: 22,
    paddingVertical: 22,
    gap: 14,
  },
  skeletonEyebrow: {
    color: '#5A34C3',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  skeletonLine: {
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E6DFFF',
  },
  trainingInsightStack: {
    gap: 12,
  },
  summarySuite: {
    gap: 14,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: '#0A0A0A',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '500',
    letterSpacing: -0.4,
  },
  sectionBody: {
    color: '#5F6670',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  summaryCard: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E1DB',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
  },
  summaryCardHeader: {
    gap: 4,
  },
  summaryEyebrow: {
    color: '#5A34C3',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summaryTitle: {
    color: '#0A0A0A',
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '500',
  },
  summaryBody: {
    color: '#5F6670',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '400',
  },
  summaryError: {
    color: '#9A6800',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
});

function TrainingInsightSkeletonCard() {
  return (
    <View
      accessibilityLabel="Generating training insight"
      style={styles.skeletonCard}
    >
      <Text style={styles.skeletonEyebrow}>TRAINING INSIGHT</Text>
      <View style={[styles.skeletonLine, { width: '96%' }]} />
      <View style={[styles.skeletonLine, { width: '88%' }]} />
      <View style={[styles.skeletonLine, { width: '64%' }]} />
    </View>
  );
}

export default function InsightsScreen() {
  const aiEmail = useSyncExternalStore(
    subscribeFirebaseAiAuth,
    getFirebaseAiAuthEmail,
  );
  const router = useRouter();
  const barklogUser = useLocalProfileStore((state) => state.barklogUser);
  const dogs = useLocalProfileStore((state) => state.dogs);
  const selectedDogId = useLocalProfileStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const premiumAccess = hasPremiumAccess(barklogUser);
  const programsQuery = useQuery(trainingProgramsQueryOptions());
  const { enrollments } = useLocalTrainingEnrollments(selectedDog?.id);
  const [weekOffset, setWeekOffset] = useState(0);
  const [snapshot, setSnapshot] = useState<WeeklyDashboardSnapshot | null>(
    null,
  );
  const [savedInsight, setSavedInsight] = useState<InsightModel | null>(null);
  const [expenses, setExpenses] = useState<ExpenseModel[]>([]);
  const [generatedSummaries, setGeneratedSummaries] = useState<
    Partial<Record<SummaryKind, GeneratedSummary>>
  >({});
  const [summaryErrors, setSummaryErrors] = useState<
    Partial<Record<SummaryKind, string>>
  >({});
  const [generatingSummaryKind, setGeneratingSummaryKind] =
    useState<SummaryKind | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trainingInsight, setTrainingInsight] = useState<string | null>(null);
  const [trainingInsightError, setTrainingInsightError] = useState<
    string | null
  >(null);
  const [isGeneratingTrainingInsight, setIsGeneratingTrainingInsight] =
    useState(false);
  const feedback = useBarklogFeedback();
  const showExtendedInsightTools = AI_FEATURES_ENABLED;

  const activeTrainingPair = useMemo(() => {
    if (!programsQuery.data) {
      return null;
    }

    return (
      getActiveTrainingProgramPairs(programsQuery.data, enrollments)[0] ?? null
    );
  }, [enrollments, programsQuery.data]);

  const loadDashboard = useCallback(() => {
    let isMounted = true;

    if (!selectedDog) {
      setSnapshot(null);
      setSavedInsight(null);
      setExpenses([]);
      setGeneratedSummaries({});
      setSummaryErrors({});
      setIsLoading(false);

      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    setError(null);

    loadWeeklyDashboardSnapshot({ dog: selectedDog, weekOffset })
      .then(async (nextSnapshot) => {
        const [insight, nextExpenses] = await Promise.all([
          getLocalInsightForWeek({
            dogId: selectedDog.id,
            weekStart: nextSnapshot.weekStartKey,
          }),
          listLocalExpensesForDogYear({
            dogId: selectedDog.id,
            year: nextSnapshot.weekEnd.getFullYear(),
          }),
        ]);

        if (isMounted) {
          setSnapshot(nextSnapshot);
          setSavedInsight(insight);
          setExpenses(nextExpenses);
          setGeneratedSummaries({});
          setSummaryErrors({});
          setIsLoading(false);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          captureBarklogError(loadError, {
            source: 'insights.dashboard_load',
            extra: {
              dog_id: selectedDog.id,
            },
          });
          setError('Unable to load insight data.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDog, weekOffset]);

  useFocusEffect(loadDashboard);

  const handleGenerateInsight = async () => {
    if (!premiumAccess) {
      openPremiumGate(router, 'weekly-insights');
      return;
    }
    if (!aiEmail) {
      router.push('/ai-sign-in?next=insights' as Href);
      return;
    }

    if (!selectedDog || !snapshot) {
      const message = 'Log events before generating a weekly insight.';

      setError(message);
      await HapticManager.warning();
      feedback.showWarning({
        title: 'More logs needed',
        description: message,
      });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await generateWeeklyInsight({
        context: snapshot.context,
        dogId: selectedDog.id,
        user: barklogUser,
        weekStart: snapshot.weekStartKey,
      });
      const insight = await upsertLocalInsight({
        content: response.content,
        dogId: selectedDog.id,
        generatedAt: Date.parse(response.generatedAt),
        promptVersion: response.promptVersion,
        weekStart: snapshot.weekStartKey,
      });

      setSavedInsight(insight);
      await HapticManager.success();
      feedback.showSuccess({
        title: 'Insight ready',
        description: 'Weekly insight was saved locally.',
      });
    } catch (generateError) {
      const message = getSafeAiErrorMessage(generateError);

      setError(message);
      captureBarklogError(generateError, {
        source: 'insights.weekly_generate',
        extra: {
          dog_id: selectedDog.id,
        },
      });
      await HapticManager.error();
      feedback.showError({
        title: 'Insight unavailable',
        description: message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTrainingInsight = async () => {
    if (!premiumAccess) {
      openPremiumGate(router, 'training-programs');
      return;
    }
    if (!aiEmail) {
      router.push('/ai-sign-in?next=insights' as Href);
      return;
    }

    if (!selectedDog || !activeTrainingPair) {
      const message =
        'Start a training program and log a session before generating a training insight.';

      setTrainingInsightError(message);
      await HapticManager.warning();
      feedback.showWarning({
        title: 'Training context needed',
        description: message,
      });
      return;
    }

    setIsGeneratingTrainingInsight(true);
    setTrainingInsightError(null);

    try {
      await HapticManager.light();

      const context = await loadTrainingInsightContext({
        dog: selectedDog,
        enrollment: activeTrainingPair.enrollment,
        program: activeTrainingPair.program,
      });

      if (!hasEnoughTrainingInsightActivity(context)) {
        const message =
          'Log at least one training session before generating a training insight.';

        setTrainingInsight(null);
        setTrainingInsightError(message);
        await HapticManager.warning();
        feedback.showWarning({
          title: 'Training log needed',
          description: message,
        });
        return;
      }

      const response = await generateTrainingInsight({
        context,
        user: barklogUser,
      });

      setTrainingInsight(response.observation);
      await HapticManager.success();
      feedback.showSuccess({
        title: 'Training insight ready',
        description: 'Personalized training observation is ready.',
      });
    } catch (trainingError) {
      const message = getSafeAiErrorMessage(trainingError);

      setTrainingInsightError(message);
      captureBarklogError(trainingError, {
        source: 'insights.training_generate',
        extra: {
          dog_id: selectedDog.id,
        },
      });
      await HapticManager.error();
      feedback.showError({
        title: 'Training insight unavailable',
        description: message,
      });
    } finally {
      setIsGeneratingTrainingInsight(false);
    }
  };

  const handleGenerateCareSummary = async (kind: SummaryKind) => {
    if (!premiumAccess) {
      openPremiumGate(router, 'care-summaries');
      return;
    }
    if (!aiEmail) {
      router.push('/ai-sign-in?next=insights' as Href);
      return;
    }

    if (!selectedDog || !snapshot) {
      const message = 'Log events before generating this summary.';

      setSummaryErrors((current) => ({
        ...current,
        [kind]: message,
      }));
      await HapticManager.warning();
      feedback.showWarning({
        title: 'More logs needed',
        description: message,
      });
      return;
    }

    if (!hasEnoughDataForSummary({ expenses, kind, snapshot })) {
      const definition = SUMMARY_DEFINITIONS.find(
        (summary) => summary.kind === kind,
      );
      const message =
        definition?.emptyMessage ??
        'Add more local logs before generating this summary.';

      setSummaryErrors((current) => ({
        ...current,
        [kind]: message,
      }));
      await HapticManager.warning();
      feedback.showWarning({
        title: 'More data needed',
        description: message,
      });
      return;
    }

    setGeneratingSummaryKind(kind);
    setSummaryErrors((current) => ({
      ...current,
      [kind]: undefined,
    }));
    queueBarklogEvent('summary_generation_started', {
      dog_id: selectedDog.id,
      summary_kind: kind,
    });

    try {
      await HapticManager.light();

      const response = await generateCareSummary({
        context: buildCareSummaryContext({
          dog: selectedDog,
          expenses,
          kind,
          snapshot,
        }),
        dogId: selectedDog.id,
        user: barklogUser,
      });

      setGeneratedSummaries((current) => ({
        ...current,
        [kind]: response.summary,
      }));
      queueBarklogEvent('summary_generation_succeeded', {
        dog_id: selectedDog.id,
        summary_kind: kind,
      });
      await HapticManager.success();
      feedback.showSuccess({
        title: 'Summary ready',
        description: `${
          SUMMARY_DEFINITIONS.find((summary) => summary.kind === kind)?.title ??
          'Care'
        } summary is ready.`,
      });
    } catch (summaryError) {
      const message = getSafeAiErrorMessage(summaryError);

      setSummaryErrors((current) => ({
        ...current,
        [kind]: message,
      }));
      queueBarklogEvent('summary_generation_failed', {
        dog_id: selectedDog.id,
        summary_kind: kind,
      });
      captureBarklogError(summaryError, {
        source: 'insights.care_summary_generate',
        extra: {
          dog_id: selectedDog.id,
          summary_kind: kind,
        },
      });
      await HapticManager.error();
      feedback.showError({
        title: 'Summary unavailable',
        description: message,
      });
    } finally {
      setGeneratingSummaryKind(null);
    }
  };

  const insightBody = (() => {
    if (!premiumAccess) {
      return `${getPremiumFeatureLabel(
        'weekly-insights',
      )} turns recent logs into short, non-diagnostic observations.`;
    }

    if (savedInsight?.content) {
      return savedInsight.content;
    }

    if (isLoading) {
      return 'Loading local BarkLog history...';
    }

    return 'Generate a short observation from this week and last week of logs.';
  })();
  const walkHours = snapshot ? (snapshot.walkMinutes / 60).toFixed(1) : '0.0';
  const poopAverage = snapshot?.poopAverage ?? 0;
  let generateInsightLabel = 'Unlock AI insights';

  if (premiumAccess) {
    generateInsightLabel = isGenerating
      ? 'Generating...'
      : 'Generate weekly insight';
  }

  const trainingInsightBody = (() => {
    if (!premiumAccess) {
      return `${getPremiumFeatureLabel(
        'training-programs',
      )} adds personalized observations from training, behavior, and mood logs.`;
    }

    if (trainingInsight) {
      return trainingInsight;
    }

    if (trainingInsightError) {
      return trainingInsightError;
    }

    return activeTrainingPair
      ? `Generate a short observation for ${activeTrainingPair.program.name}.`
      : 'Start a training program to unlock training insights.';
  })();
  let trainingInsightLabel = 'Unlock training insights';

  if (premiumAccess) {
    trainingInsightLabel = isGeneratingTrainingInsight
      ? 'Generating...'
      : 'Generate training insight';
  }

  return (
    <HomeShell
      activeTab="insights"
      headerVariant="compact"
      headerAvatarEmoji="🐕"
      headerAvatarBackgroundColor="#F2E7D9"
    >
      <View style={styles.stack}>
        {AI_FEATURES_ENABLED && premiumAccess && !aiEmail ? (
          <View style={styles.actions}>
            <Text style={styles.subtitle}>
              Sign in with Firebase before generating AI insights. The selected
              summary is sent to Atlas.
            </Text>
            <PrimaryButton
              label="Connect BarkLog AI"
              onPress={() => router.push('/ai-sign-in?next=insights' as Href)}
            />
          </View>
        ) : null}
        <View style={styles.heroRow}>
          <View style={styles.hero}>
            <Text style={styles.title}>Weekly view</Text>
            <Text style={styles.subtitle}>
              {snapshot?.weekLabel ?? 'This week'}
            </Text>
          </View>

          {showExtendedInsightTools ? (
            <View style={styles.weekControls}>
              <Pressable
                accessibilityRole="button"
                style={styles.weekButton}
                onPress={() => setWeekOffset((current) => current - 1)}
              >
                <Text style={styles.weekButtonText}>‹</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={styles.weekButton}
                onPress={() =>
                  setWeekOffset((current) => Math.min(0, current + 1))
                }
              >
                <Text style={styles.weekButtonText}>›</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <InsightsNarrativeCard
          eyebrow="Care snapshot"
          eyebrowIcon={<SparklesIcon />}
          backgroundColor="#F7F4FF"
          borderColor="#D8CCFF"
          eyebrowColor="#5A34C3"
          bodyColor="#3E2A9E"
          body={
            AI_FEATURES_ENABLED
              ? insightBody
              : `${snapshot?.mealCount ?? 0} meals, ${snapshot?.context.thisWeek.eventCounts.poop ?? 0} poop logs, and ${snapshot?.medicationCount ?? 0} medication logs recorded this week. These are caregiver observations, not a diagnosis.`
          }
        />

        {LOCAL_AI_ENABLED ? (
          <PrimaryButton
            label="Ask about recent logs on device"
            onPress={() => router.push('/ask-ai' as Href)}
          />
        ) : null}

        {showExtendedInsightTools ? (
          <>
            {error ? <Text style={styles.statusText}>{error}</Text> : null}
            <PrimaryButton
              label={generateInsightLabel}
              size="large"
              leadingIcon={<SparklesIcon color="#FAFAFA" />}
              disabled={isGenerating || isLoading}
              onPress={() => {
                handleGenerateInsight().catch(() => undefined);
              }}
            />

            {activeTrainingPair ? (
              <View style={styles.trainingInsightStack}>
                {isGeneratingTrainingInsight ? (
                  <TrainingInsightSkeletonCard />
                ) : (
                  <InsightsNarrativeCard
                    eyebrow="Training Insight"
                    eyebrowIcon={<SparklesIcon />}
                    backgroundColor="#F7F4FF"
                    borderColor="#D8CCFF"
                    eyebrowColor="#5A34C3"
                    bodyColor="#3E2A9E"
                    body={trainingInsightBody}
                  />
                )}

                <PrimaryButton
                  label={trainingInsightLabel}
                  size="large"
                  leadingIcon={<SparklesIcon color="#FAFAFA" />}
                  disabled={isGeneratingTrainingInsight}
                  onPress={() => {
                    handleGenerateTrainingInsight().catch(() => undefined);
                  }}
                />
              </View>
            ) : null}

            <View style={styles.summarySuite}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Care summaries</Text>
                <Text style={styles.sectionBody}>
                  Raw logs stay local and exportable. Summaries organize
                  observations without diagnosing.
                </Text>
              </View>

              {SUMMARY_DEFINITIONS.map((definition) => {
                const generatedSummary = generatedSummaries[definition.kind];
                const summaryError = summaryErrors[definition.kind];
                const isGeneratingSummary =
                  generatingSummaryKind === definition.kind;
                const hasEnoughData =
                  snapshot &&
                  hasEnoughDataForSummary({
                    expenses,
                    kind: definition.kind,
                    snapshot,
                  });
                const body = (() => {
                  if (!premiumAccess) {
                    return `${definition.title} summaries are Premium. Your raw Timeline and manual export stay available.`;
                  }

                  if (summaryError) {
                    return summaryError;
                  }

                  if (generatedSummary) {
                    return generatedSummary.content;
                  }

                  if (!hasEnoughData) {
                    return definition.emptyMessage;
                  }

                  return definition.description;
                })();
                const label = (() => {
                  if (!premiumAccess) {
                    return 'Unlock summaries';
                  }

                  if (isGeneratingSummary) {
                    return 'Generating...';
                  }

                  if (!hasEnoughData) {
                    return 'Needs logs';
                  }

                  return generatedSummary
                    ? 'Refresh summary'
                    : 'Generate summary';
                })();

                return (
                  <View key={definition.kind} style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                      <Text style={styles.summaryEyebrow}>Care summary</Text>
                      <Text style={styles.summaryTitle}>
                        {definition.title}
                      </Text>
                    </View>
                    {isGeneratingSummary ? (
                      <>
                        <View style={[styles.skeletonLine, { width: '96%' }]} />
                        <View style={[styles.skeletonLine, { width: '72%' }]} />
                      </>
                    ) : (
                      <Text
                        style={[
                          styles.summaryBody,
                          summaryError ? styles.summaryError : null,
                        ]}
                      >
                        {body}
                      </Text>
                    )}
                    <PrimaryButton
                      label={label}
                      size="large"
                      leadingIcon={<SparklesIcon color="#FAFAFA" />}
                      disabled={
                        isGeneratingSummary ||
                        Boolean(premiumAccess && !hasEnoughData)
                      }
                      onPress={() => {
                        handleGenerateCareSummary(definition.kind).catch(
                          () => undefined,
                        );
                      }}
                    />
                  </View>
                );
              })}
            </View>
          </>
        ) : null}

        <View style={styles.tileGrid}>
          <View style={styles.tileCell}>
            <InsightsSnapshotCard
              icon={<MealsIcon />}
              label="Meals"
              value={`${snapshot?.mealCount ?? 0}`}
              valueSuffix="/ 14"
              detail="100% Consistent"
            />
          </View>
          <View style={styles.tileCell}>
            <InsightsSnapshotCard
              icon={<WalksIcon />}
              label="Walks"
              value={walkHours}
              valueSuffix="hrs"
              detail="+15% vs last wk"
            />
          </View>
          <View style={styles.tileCell}>
            <InsightsSnapshotCard
              icon={<PoopsIcon />}
              label="Poops"
              value={`${snapshot?.context.thisWeek.eventCounts.poop ?? 0}`}
              valueSuffix="total"
              detail={
                poopAverage > 0
                  ? `AVG QUALITY SCORE: ${poopAverage}`
                  : 'NO QUALITY DATA'
              }
            />
          </View>
          <View style={styles.tileCell}>
            <InsightsSnapshotCard
              icon={<MedsIcon />}
              label="Meds"
              value={`${snapshot?.medicationCount ?? 0}`}
              valueSuffix="/ 7"
              detail="100% Adherence"
            />
          </View>
        </View>

        <InsightsLineChartCard
          title="Walk Duration"
          labels={snapshot?.chartLabels ?? ['M', 'T', 'W', 'T', 'F', 'S', 'S']}
          values={snapshot?.walkValues ?? [0, 0, 0, 0, 0, 0, 0]}
          strokeColor="#1B73D1"
        />

        <InsightsLineChartCard
          title="Poop Quality Trend"
          labels={snapshot?.chartLabels ?? ['M', 'T', 'W', 'T', 'F', 'S', 'S']}
          values={snapshot?.poopValues ?? [0, 0, 0, 0, 0, 0, 0]}
          strokeColor="#A94840"
          dotColor="#A94840"
        />

        {showExtendedInsightTools ? (
          <InsightsNarrativeCard
            eyebrow="Anomaly Alerts"
            borderColor="#F2D3A4"
            backgroundColor="#FFF8EA"
            eyebrowColor="#9A6800"
            bodyColor="#5C3F0F"
            body={
              snapshot?.anomalyAlerts.length
                ? snapshot.anomalyAlerts.join(' ')
                : 'No unusual local patterns were flagged for this week.'
            }
          />
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label="Export vet report"
            size="large"
            leadingIcon={<ExportIcon />}
            onPress={() => router.push('/vet-prep')}
          />
          <PrimaryButton
            label="Share with vet"
            size="large"
            leadingIcon={<ShareIcon />}
            backgroundColor="#FFFCFA"
            borderColor="#0A0A0A"
            labelColor="#0A0A0A"
            onPress={() => router.push('/vet-prep')}
          />
        </View>
      </View>
    </HomeShell>
  );
}
