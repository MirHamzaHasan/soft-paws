import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { useBarklogFeedback } from '@/components/ui';
import {
  type EventModel,
  listActiveMedicationsForDog,
  listLocalEventsForDogRange,
  type MedicationModel,
} from '@/db';
import {
  formatDogMeta,
  formatDogWeight,
  getDogAvatar,
} from '@/features/dogs/utils/dogDisplay';
import {
  buildVetReportHtml,
  summarizeEventCounts,
} from '@/features/export/utils/exportBuilders';
import { generateVetReport } from '@/features/insights/api/insightsAiClient';
import { captureBarklogError } from '@/features/observability';
import { hasPremiumAccess } from '@/features/premium/utils/premiumAccess';
import { openPremiumGate } from '@/features/premium/utils/premiumNavigation';
import {
  type CreatedVetShareLink,
  createVetShareLink,
  revokeVetShareLink,
} from '@/features/vet/api/vetShareLinkClient';
import {
  buildLocalVetQuestions,
  buildVetReportAiContext,
  buildVetShareReportSnapshot,
  type GeneratedVetReport,
} from '@/features/vet/utils/vetReportBuilder';
import HapticManager from '@/managers/HapticManager';
import { getSelectedDog, useAuthSessionStore } from '@/stores';
import { getBarklogErrorMessage } from '@/utils/barklogErrorMessages';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { ArchiveFilterPill } from '../../archive/components/ArchiveFilterPill';
import { AssistantAlertIcon } from '../../assistant/components/AssistantIcons';
import { AssistantLayout } from '../../assistant/components/AssistantLayout';
import {
  printHtmlDocument,
  sharePdfDocument,
} from '../../export/services/exportDocumentService';
import { HomeAvatar } from '../../home/components/HomeAvatar';
import { ClockIcon } from '../../home/components/HomeIcons';
import { MedicationCalendarIcon } from '../../medications/components/MedicationIcons';
import {
  ExportIcon,
  MealsIcon,
  PoopsIcon,
  WalksIcon,
} from '../components/InsightsIcons';
import { InsightsProgressRow } from '../components/InsightsProgressRow';
import { VetPrepChecklistItem } from '../components/VetPrepChecklistItem';
import { VetPrepMetricCard } from '../components/VetPrepMetricCard';

const styles = StyleSheet.create({
  stack: {
    gap: 28,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 62,
    lineHeight: 68,
    fontWeight: '300',
    letterSpacing: -2.1,
  },
  generatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  generatedText: {
    color: '#5D656D',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  patientCard: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2DDD8',
    paddingVertical: 22,
    gap: 18,
  },
  patientTop: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  patientMeta: {
    color: '#1F2528',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '400',
  },
  patientSub: {
    color: '#5D656D',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  patientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  patientColumn: {
    flexBasis: '46%',
    flexGrow: 1,
    gap: 4,
  },
  label: {
    color: '#7D756D',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  value: {
    color: '#1F2528',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
  },
  valueNegative: {
    color: '#B03A32',
  },
  sectionTitle: {
    color: '#0A0A0A',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  metricCell: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  adherenceCard: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0DBD5',
    backgroundColor: '#F7F9F8',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 14,
  },
  adherenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  adherenceValue: {
    color: '#1F2528',
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '400',
  },
  timeline: {
    gap: 18,
  },
  symptomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  symptomDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0A0A0A',
    marginTop: 10,
  },
  symptomCopy: {
    flex: 1,
    gap: 4,
  },
  symptomDate: {
    color: '#7D756D',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  symptomTitle: {
    color: '#1F2528',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
  },
  symptomBody: {
    color: '#5D656D',
    fontSize: 16,
    lineHeight: 28,
    fontWeight: '400',
  },
  questionsCard: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0DBD5',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 18,
  },
  premiumCard: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2DCEF',
    backgroundColor: '#F3F0FB',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
  },
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'flex-start',
  },
  premiumBadge: {
    borderRadius: 999,
    backgroundColor: '#534AB7',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  premiumBadgeText: {
    color: '#FAFAFA',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  premiumTitle: {
    color: '#362B68',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500',
  },
  premiumBody: {
    color: '#4A3580',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '400',
  },
  premiumActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D6CBEF',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#362B68',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  questionText: {
    color: '#1F2528',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  footerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E0DBD5',
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  footerActionText: {
    color: '#1F2528',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  statusText: {
    color: '#687079',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
});

const REPORT_RANGES = [
  { days: 7, label: '7 Days' },
  { days: 30, label: '30 Days' },
  { days: 90, label: '90 Days' },
] as const;

function getRangeStart(days: number) {
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  return start;
}

function formatGeneratedRange(days: number) {
  const start = getRangeStart(days);
  const end = new Date();

  return `${new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
  }).format(start)} - ${new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
  }).format(end)}`;
}

function getEventDetails(event: EventModel) {
  if (!event.details || typeof event.details !== 'object') {
    return {};
  }

  return event.details as Record<string, unknown>;
}

function getSymptomTitle(event: EventModel) {
  const details = getEventDetails(event);

  if (Array.isArray(details.symptoms) && details.symptoms.length > 0) {
    return details.symptoms
      .filter((item) => typeof item === 'string')
      .join(', ');
  }

  return 'Symptom logged';
}

function getAverage(count: number, days: number) {
  return (count / days).toFixed(1);
}

export default function VetVisitPrepScreen() {
  const router = useRouter();
  const dogs = useAuthSessionStore((state) => state.dogs);
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(30);
  const [events, setEvents] = useState<EventModel[]>([]);
  const [medications, setMedications] = useState<MedicationModel[]>([]);
  const [generatedVetReport, setGeneratedVetReport] =
    useState<GeneratedVetReport | null>(null);
  const [shareLink, setShareLink] = useState<CreatedVetShareLink | null>(null);
  const [isGeneratingPremiumReport, setIsGeneratingPremiumReport] =
    useState(false);
  const [isCreatingShareLink, setIsCreatingShareLink] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const feedback = useBarklogFeedback();

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      if (!selectedDog?.id) {
        setEvents([]);
        setMedications([]);
        return () => {
          isMounted = false;
        };
      }

      const start = getRangeStart(rangeDays);
      const end = new Date();

      Promise.all([
        listLocalEventsForDogRange({
          dogId: selectedDog.id,
          endAt: end.getTime() + 1,
          startAt: start.getTime(),
        }),
        listActiveMedicationsForDog(selectedDog.id),
      ])
        .then(([nextEvents, nextMedications]) => {
          if (isMounted) {
            setEvents(nextEvents);
            setMedications(nextMedications);
            setGeneratedVetReport(null);
            setShareLink(null);
            setError(null);
          }
        })
        .catch((loadError) => {
          if (isMounted) {
            captureBarklogError(loadError, {
              source: 'vet_report.local_context_load',
              extra: {
                dog_id: selectedDog.id,
              },
            });
            setError('Unable to build the vet report from local records.');
          }
        });

      return () => {
        isMounted = false;
      };
    }, [rangeDays, selectedDog?.id]),
  );

  const dogName = selectedDog?.name ?? 'Your dog';
  const avatar = selectedDog
    ? getDogAvatar(selectedDog)
    : { backgroundColor: '#D7DDE1', emoji: '🐶' };
  const counts = summarizeEventCounts(events);
  const rangeStart = getRangeStart(rangeDays);
  const rangeEnd = new Date();
  const rangeLabel = `Period covering ${formatGeneratedRange(rangeDays)}`;
  const generatedAt = new Date();
  const reportContext = selectedDog
    ? buildVetReportAiContext({
        dog: selectedDog,
        events,
        medications,
        range: {
          endIso: rangeEnd.toISOString(),
          label: rangeLabel,
          startIso: rangeStart.toISOString(),
        },
      })
    : null;
  let suggestedQuestions: string[] = [];

  if (generatedVetReport?.questions.length) {
    suggestedQuestions = generatedVetReport.questions;
  } else if (reportContext) {
    suggestedQuestions = buildLocalVetQuestions(reportContext);
  }
  const reportHtml = selectedDog
    ? buildVetReportHtml({
        dog: selectedDog,
        events,
        generatedSummary: generatedVetReport?.summary ?? null,
        generatedAt,
        medications,
        suggestedQuestions,
        rangeLabel,
        shareUrl: shareLink?.url ?? null,
      })
    : '';
  const symptomEvents = events.filter((event) => event.type === 'symptom');
  const userHasPremium = hasPremiumAccess(barklogUser);
  let premiumSummaryButtonLabel = 'Unlock premium report';

  if (isGeneratingPremiumReport) {
    premiumSummaryButtonLabel = 'Generating...';
  } else if (userHasPremium) {
    premiumSummaryButtonLabel = 'Generate premium summary';
  }

  const handleSharePdf = async () => {
    if (!selectedDog) {
      const message = 'Add a dog before generating a report.';

      setError(message);
      await HapticManager.warning();
      feedback.showWarning({
        title: 'Dog needed',
        description: message,
      });
      return;
    }

    setError(null);
    setStatusMessage(null);

    try {
      const message = await sharePdfDocument({
        fileName: `${selectedDog.name}-vet-report.pdf`,
        html: reportHtml,
        title: `${selectedDog.name} BarkLog vet report`,
      });

      setStatusMessage(message);
      await HapticManager.success();
      feedback.showSuccess({
        title: 'Report ready',
        description: message,
      });
    } catch (shareError) {
      const message = getBarklogErrorMessage(shareError, {
        domain: 'export',
      });

      setError(message);
      await HapticManager.error();
      feedback.showError({
        title: 'Report not exported',
        description: message,
      });
    }
  };

  const handlePrint = async () => {
    if (!selectedDog) {
      const message = 'Add a dog before printing a report.';

      setError(message);
      await HapticManager.warning();
      feedback.showWarning({
        title: 'Dog needed',
        description: message,
      });
      return;
    }

    setError(null);
    setStatusMessage(null);

    try {
      const message = await printHtmlDocument({
        fileName: `${selectedDog.name}-vet-report.pdf`,
        html: reportHtml,
        title: `${selectedDog.name} BarkLog vet report`,
      });

      setStatusMessage(message);
      await HapticManager.success();
      feedback.showSuccess({
        title: 'Print ready',
        description: message,
      });
    } catch (printError) {
      const message = getBarklogErrorMessage(printError, {
        domain: 'export',
        fallback: 'Unable to open the print dialog right now.',
      });

      setError(message);
      await HapticManager.error();
      feedback.showError({
        title: 'Print not opened',
        description: message,
      });
    }
  };

  const handleGeneratePremiumReport = async () => {
    if (!userHasPremium) {
      openPremiumGate(router, 'vet-pdf-reports');
      return;
    }

    if (!selectedDog || !reportContext) {
      const message = 'Add a dog before generating a premium vet report.';

      setError(message);
      await HapticManager.warning();
      feedback.showWarning({
        title: 'Dog needed',
        description: message,
      });
      return;
    }

    setError(null);
    setStatusMessage(null);
    setIsGeneratingPremiumReport(true);

    try {
      await HapticManager.selectionChange();
      const response = await generateVetReport({
        context: reportContext,
        dogId: selectedDog.id,
        user: barklogUser,
      });

      setGeneratedVetReport(response.report);
      setStatusMessage('Premium vet report summary is ready.');
      await HapticManager.success();
      feedback.showSuccess({
        title: 'Premium report ready',
        description: 'Premium vet report summary is ready.',
      });
    } catch (reportError) {
      const message = getBarklogErrorMessage(reportError, {
        domain: 'ai',
      });

      setError(message);
      captureBarklogError(reportError, {
        source: 'vet_report.generate_premium',
        extra: {
          dog_id: selectedDog.id,
        },
      });
      await HapticManager.error();
      feedback.showError({
        title: 'Premium report unavailable',
        description: message,
      });
    } finally {
      setIsGeneratingPremiumReport(false);
    }
  };

  const handleCreateShareLink = async () => {
    if (!userHasPremium) {
      openPremiumGate(router, 'vet-pdf-reports');
      return;
    }

    if (!selectedDog || !barklogUser || !reportContext) {
      const message = 'Sign in and select a dog before creating a share link.';

      setError(message);
      await HapticManager.warning();
      feedback.showWarning({
        title: 'Account needed',
        description: message,
      });
      return;
    }

    if (!generatedVetReport) {
      const message =
        'Generate the premium vet report before creating a share link.';

      setError(message);
      await HapticManager.warning();
      feedback.showWarning({
        title: 'Report needed',
        description: message,
      });
      return;
    }

    setError(null);
    setStatusMessage(null);
    setIsCreatingShareLink(true);

    try {
      await HapticManager.selectionChange();
      const createdLink = await createVetShareLink({
        dogId: selectedDog.id,
        rangeEnd: reportContext.range.endIso,
        rangeStart: reportContext.range.startIso,
        reportSnapshot: buildVetShareReportSnapshot({
          context: reportContext,
          generatedReport: generatedVetReport,
        }),
        user: barklogUser,
      });

      setShareLink(createdLink);
      setStatusMessage(
        `Secure vet link created. It expires ${new Date(
          createdLink.expiresAt,
        ).toLocaleDateString()}.`,
      );
      await Share.share({
        message: createdLink.url,
        title: `${selectedDog.name} BarkLog vet report`,
      });
      await HapticManager.success();
      feedback.showSuccess({
        title: 'Share link ready',
        description: 'Secure vet share link created.',
      });
    } catch (shareError) {
      const message = getBarklogErrorMessage(shareError, {
        domain: 'share',
      });

      setError(message);
      captureBarklogError(shareError, {
        source: 'vet_report.create_share_link',
        extra: {
          dog_id: selectedDog.id,
        },
      });
      await HapticManager.error();
      feedback.showError({
        title: 'Share link not created',
        description: message,
      });
    } finally {
      setIsCreatingShareLink(false);
    }
  };

  const handleRevokeShareLink = async () => {
    if (!shareLink) {
      return;
    }

    setError(null);
    setStatusMessage(null);

    try {
      await revokeVetShareLink(shareLink.id);
      setShareLink(null);
      setStatusMessage('Secure vet share link revoked.');
      await HapticManager.success();
      feedback.showSuccess({
        title: 'Share link revoked',
        description: 'Secure vet share link revoked.',
      });
    } catch (shareError) {
      const message = getBarklogErrorMessage(shareError, {
        domain: 'share',
      });

      setError(message);
      captureBarklogError(shareError, {
        source: 'vet_report.revoke_share_link',
        extra: {
          link_id: shareLink.id,
        },
      });
      await HapticManager.error();
      feedback.showError({
        title: 'Share link not revoked',
        description: message,
      });
    }
  };

  return (
    <AssistantLayout
      title="BarkLog"
      trailing={<AssistantAlertIcon />}
      onBackPress={() => router.back()}
    >
      <View style={styles.stack}>
        <View style={styles.rangeRow}>
          {REPORT_RANGES.map((range) => (
            <ArchiveFilterPill
              key={range.days}
              compact
              label={range.label}
              selected={range.days === rangeDays}
              onPress={() => setRangeDays(range.days)}
            />
          ))}
        </View>

        <Text style={styles.title}>Patient Summary</Text>

        <View style={styles.generatedRow}>
          <MedicationCalendarIcon size={18} color="#5D656D" />
          <Text style={styles.generatedText}>
            Generated {generatedAt.toLocaleDateString()} • {rangeLabel}
          </Text>
        </View>

        <View style={styles.patientCard}>
          <View style={styles.patientTop}>
            <HomeAvatar
              emoji={avatar.emoji}
              backgroundColor={avatar.backgroundColor}
              size={60}
            />
            <View style={styles.symptomCopy}>
              <Text style={styles.label}>Patient</Text>
              <Text style={styles.patientMeta}>{dogName}</Text>
            </View>
          </View>

          <View style={styles.patientGrid}>
            <View style={styles.patientColumn}>
              <Text style={styles.label}>Breed & Age</Text>
              <Text style={styles.value}>{formatDogMeta(selectedDog)}</Text>
            </View>
            <View style={styles.patientColumn}>
              <Text style={styles.label}>Current Weight</Text>
              <Text style={styles.value}>{formatDogWeight(selectedDog)}</Text>
            </View>
            <View style={styles.patientColumn}>
              <Text style={styles.label}>Report Range</Text>
              <Text style={styles.value}>
                {REPORT_RANGES.find((range) => range.days === rangeDays)?.label}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>30-Day Averages</Text>
        <View style={styles.metricGrid}>
          <View style={styles.metricCell}>
            <VetPrepMetricCard
              icon={<WalksIcon size={24} />}
              value={getAverage(counts.walk, rangeDays)}
              label="Walks / day"
            />
          </View>
          <View style={styles.metricCell}>
            <VetPrepMetricCard
              icon={<MealsIcon size={24} />}
              value={getAverage(counts.meal, rangeDays)}
              label="Meals / day"
            />
          </View>
          <View style={styles.metricCell}>
            <VetPrepMetricCard
              icon={<ClockIcon size={24} />}
              value={getAverage(counts.pee, rangeDays)}
              label="Pees / day"
            />
          </View>
          <View style={styles.metricCell}>
            <VetPrepMetricCard
              icon={<PoopsIcon size={24} />}
              value={getAverage(counts.poop, rangeDays)}
              label="Poops / day"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Medication Adherence</Text>
        <View style={styles.adherenceCard}>
          {medications.length > 0 ? (
            medications.slice(0, 2).map((medication) => (
              <View key={medication.id}>
                <View style={styles.adherenceHeader}>
                  <View>
                    <Text style={styles.value}>{medication.name}</Text>
                    <Text style={styles.generatedText}>
                      {(medication.frequency ?? 'as_needed').replace(/_/g, ' ')}
                    </Text>
                  </View>
                  <Text style={styles.adherenceValue}>{counts.medication}</Text>
                </View>
                <InsightsProgressRow
                  label=""
                  value={`${counts.medication} medication logs in range`}
                  percent={Math.min(100, counts.medication * 10)}
                  accent="#1F2528"
                />
              </View>
            ))
          ) : (
            <Text style={styles.generatedText}>
              No active medications recorded for this dog.
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Noted Symptoms & Observations</Text>
        <View style={styles.timeline}>
          {symptomEvents.length > 0 ? (
            symptomEvents.slice(0, 4).map((event) => (
              <View key={event.id} style={styles.symptomRow}>
                <View style={styles.symptomDot} />
                <View style={styles.symptomCopy}>
                  <Text style={styles.symptomDate}>
                    {new Intl.DateTimeFormat(undefined, {
                      day: '2-digit',
                      month: 'short',
                    }).format(event.occurredAt)}
                  </Text>
                  <Text style={styles.symptomTitle}>
                    {getSymptomTitle(event)}
                  </Text>
                  <Text style={styles.symptomBody}>
                    {event.notes || 'No caregiver note recorded.'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.generatedText}>
              No symptom events recorded in this range.
            </Text>
          )}
        </View>

        <View style={styles.premiumCard}>
          <View style={styles.premiumHeader}>
            <View style={styles.symptomCopy}>
              <Text style={styles.label}>Premium</Text>
              <Text style={styles.premiumTitle}>Vet-ready report upgrade</Text>
            </View>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>
                {userHasPremium ? 'Unlocked' : 'Premium'}
              </Text>
            </View>
          </View>
          <Text style={styles.premiumBody}>
            Generate a short, non-diagnostic visit summary and secure,
            time-limited share link for your vet. Free manual PDF and print
            export stays available below.
          </Text>
          {generatedVetReport ? (
            <View style={styles.questionsCard}>
              <Text style={styles.premiumTitle}>Generated summary</Text>
              <Text style={styles.premiumBody}>
                {generatedVetReport.summary}
              </Text>
            </View>
          ) : null}
          {shareLink ? (
            <Text style={styles.premiumBody}>
              Share link expires{' '}
              {new Date(shareLink.expiresAt).toLocaleDateString()}.
            </Text>
          ) : null}
          <View style={styles.premiumActions}>
            <Pressable
              accessibilityRole="button"
              disabled={isGeneratingPremiumReport}
              style={styles.secondaryButton}
              onPress={() => {
                handleGeneratePremiumReport().catch(() => undefined);
              }}
            >
              <Text style={styles.secondaryButtonText}>
                {premiumSummaryButtonLabel}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isCreatingShareLink}
              style={styles.secondaryButton}
              onPress={() => {
                handleCreateShareLink().catch(() => undefined);
              }}
            >
              <Text style={styles.secondaryButtonText}>
                {isCreatingShareLink ? 'Creating...' : 'Create share link'}
              </Text>
            </Pressable>
            {shareLink ? (
              <Pressable
                accessibilityRole="button"
                style={styles.secondaryButton}
                onPress={() => {
                  handleRevokeShareLink().catch(() => undefined);
                }}
              >
                <Text style={styles.secondaryButtonText}>Revoke link</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Suggested Questions for the Visit
        </Text>
        <View style={styles.questionsCard}>
          {suggestedQuestions.map((question) => (
            <VetPrepChecklistItem key={question} label={question} />
          ))}
        </View>

        <View style={styles.footerDivider} />
        <View style={styles.footerActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              handleSharePdf().catch(() => undefined);
            }}
          >
            <Text style={styles.footerActionText}>Share Report</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              handlePrint().catch(() => undefined);
            }}
          >
            <Text style={styles.footerActionText}>Print Report</Text>
          </Pressable>
        </View>

        <PrimaryButton
          label="Generate PDF"
          size="large"
          leadingIcon={<ExportIcon color="#FAFAFA" />}
          onPress={() => {
            handleSharePdf().catch(() => undefined);
          }}
        />

        {statusMessage ? (
          <Text style={styles.statusText}>{statusMessage}</Text>
        ) : null}
        {error ? (
          <Text style={[styles.statusText, { color: '#B02921' }]}>{error}</Text>
        ) : null}
      </View>
    </AssistantLayout>
  );
}
