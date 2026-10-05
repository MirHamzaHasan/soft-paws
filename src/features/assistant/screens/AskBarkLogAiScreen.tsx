import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { type Href, useRouter } from 'expo-router';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { trainingProgramsQueryOptions } from '@/api/training';
import { useBarklogFeedback } from '@/components/ui';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { AI_FEATURES_ENABLED, LOCAL_AI_ENABLED } from '@/config/featureFlags';
import {
  getFirebaseAiAuthEmail,
  subscribeFirebaseAiAuth,
} from '@/features/auth/services/firebaseAiAuth';
import {
  deleteChatModel,
  downloadChatModel,
  isChatModelInstalled,
} from '@/features/local-ai/chatModel';
import { LOCAL_CHAT_MODEL } from '@/features/local-ai/chatModelManifest';
import {
  deleteStarterModel,
  downloadStarterModel,
  isStarterModelInstalled,
} from '@/features/local-ai/localModel';
import { STARTER_LOCAL_MODEL } from '@/features/local-ai/modelManifest';
import {
  deleteVisionModel,
  describeLocalPhoto,
  downloadVisionModel,
  isVisionModelInstalled,
} from '@/features/local-ai/visionModel';
import { LOCAL_VISION_MODEL } from '@/features/local-ai/visionModelManifest';
import {
  captureBarklogError,
  queueBarklogEvent,
} from '@/features/observability';
import { useLocalTrainingEnrollments } from '@/features/training/hooks/useLocalTrainingEnrollments';
import { getActiveTrainingProgramPairs } from '@/features/training/utils/trainingPresentation';
import HapticManager from '@/managers/HapticManager';

import { getSelectedDog, useLocalProfileStore } from '../../../stores';
import { askBarkLogAi } from '../../insights/api/insightsAiClient';
import {
  BARKLOG_AI_EMERGENCY_ESCALATION,
  containsEmergencyLanguage,
  getSafeAiErrorMessage,
} from '../../insights/utils/aiSafety';
import {
  loadWeeklyDashboardSnapshot,
  type WeeklyDashboardSnapshot,
} from '../../insights/utils/insightSummaries';
import {
  getPremiumFeatureLabel,
  hasPremiumAccess,
} from '../../premium/utils/premiumAccess';
import { openPremiumGate } from '../../premium/utils/premiumNavigation';
import { AssistantComposer } from '../components/AssistantComposer';
import { AssistantContextPill } from '../components/AssistantContextPill';
import {
  AssistantAlertIcon,
  AssistantDropletIcon,
  AssistantHistoryIcon,
  AssistantWeightIcon,
} from '../components/AssistantIcons';
import { AssistantLayout } from '../components/AssistantLayout';
import { AssistantMessageBubble } from '../components/AssistantMessageBubble';
import { AssistantSuggestionCard } from '../components/AssistantSuggestionCard';

const styles = StyleSheet.create({
  stack: {
    gap: 24,
  },
  introCard: {
    maxWidth: '85%',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E2DC',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  introText: {
    color: '#5B6269',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  suggestions: {
    maxWidth: '85%',
    gap: 8,
  },
  statusText: {
    color: '#687079',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
});

type AssistantThreadMessage = {
  id: string;
  message: string;
  tone: 'assistant' | 'user';
};

export default function AskBarkLogAiScreen() {
  const router = useRouter();
  const barklogUser = useLocalProfileStore((state) => state.barklogUser);
  const dogs = useLocalProfileStore((state) => state.dogs);
  const selectedDogId = useLocalProfileStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const premiumAccess = hasPremiumAccess(barklogUser);
  const programsQuery = useQuery(trainingProgramsQueryOptions());
  const { enrollments } = useLocalTrainingEnrollments(selectedDog?.id);
  const [snapshot, setSnapshot] = useState<WeeklyDashboardSnapshot | null>(
    null,
  );
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<AssistantThreadMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isDescribingPhoto, setIsDescribingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelState, setModelState] = useState<
    'checking' | 'missing' | 'downloading' | 'ready'
  >('checking');
  const [modelError, setModelError] = useState<string | null>(null);
  const [chatModelState, setChatModelState] = useState<
    'checking' | 'missing' | 'downloading' | 'ready'
  >('checking');
  const [chatModelError, setChatModelError] = useState<string | null>(null);
  const [visionModelState, setVisionModelState] = useState<
    'checking' | 'missing' | 'downloading' | 'ready'
  >('checking');
  const [visionModelError, setVisionModelError] = useState<string | null>(null);
  const aiEmail = useSyncExternalStore(
    subscribeFirebaseAiAuth,
    getFirebaseAiAuthEmail,
  );
  const feedback = useBarklogFeedback();

  useEffect(() => {
    if (!LOCAL_AI_ENABLED) {
      setModelState('missing');
      setChatModelState('missing');
      setVisionModelState('missing');
      return undefined;
    }
    let active = true;
    isStarterModelInstalled()
      .then((installed) => {
        if (active) setModelState(installed ? 'ready' : 'missing');
      })
      .catch(() => {
        if (active) setModelState('missing');
      });
    isChatModelInstalled()
      .then((installed) => {
        if (active) setChatModelState(installed ? 'ready' : 'missing');
      })
      .catch(() => {
        if (active) setChatModelState('missing');
      });
    isVisionModelInstalled()
      .then((installed) => {
        if (active) setVisionModelState(installed ? 'ready' : 'missing');
      })
      .catch(() => {
        if (active) setVisionModelState('missing');
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDownloadModel = async () => {
    setModelState('downloading');
    setModelError(null);
    queueBarklogEvent('local_ai_model_download_started', {
      model_id: STARTER_LOCAL_MODEL.id,
    });
    try {
      await downloadStarterModel();
      setModelState('ready');
      queueBarklogEvent('local_ai_model_download_succeeded', {
        model_id: STARTER_LOCAL_MODEL.id,
      });
      feedback.showSuccess({
        title: 'Local AI ready',
        description: 'The model is saved on this device.',
      });
    } catch {
      setModelState('missing');
      queueBarklogEvent('local_ai_model_download_failed', {
        model_id: STARTER_LOCAL_MODEL.id,
      });
      setModelError(
        'The model could not be downloaded and verified. Check your connection and try again.',
      );
    }
  };

  const handleDeleteModel = async () => {
    try {
      await deleteStarterModel();
      setModelState('missing');
      setModelError(null);
      queueBarklogEvent('local_ai_model_removed', {
        model_id: STARTER_LOCAL_MODEL.id,
      });
    } catch {
      setModelError('The local model could not be removed. Try again.');
    }
  };

  const handleDownloadChatModel = async () => {
    setChatModelState('downloading');
    setChatModelError(null);
    queueBarklogEvent('local_ai_model_download_started', {
      model_id: LOCAL_CHAT_MODEL.id,
    });
    try {
      await downloadChatModel();
      setChatModelState('ready');
      queueBarklogEvent('local_ai_model_download_succeeded', {
        model_id: LOCAL_CHAT_MODEL.id,
      });
      feedback.showSuccess({
        title: 'Local conversation ready',
        description: 'The model is saved on this device.',
      });
    } catch (downloadError) {
      setChatModelState('missing');
      queueBarklogEvent('local_ai_model_download_failed', {
        model_id: LOCAL_CHAT_MODEL.id,
      });
      setChatModelError(
        downloadError instanceof Error
          ? downloadError.message
          : 'The model could not be downloaded. Try again.',
      );
    }
  };

  const handleDeleteChatModel = async () => {
    try {
      await deleteChatModel();
      setChatModelState('missing');
      setChatModelError(null);
      queueBarklogEvent('local_ai_model_removed', {
        model_id: LOCAL_CHAT_MODEL.id,
      });
    } catch {
      setChatModelError(
        'The local conversation model could not be removed. Try again.',
      );
    }
  };

  const handleDownloadVisionModel = async () => {
    setVisionModelState('downloading');
    setVisionModelError(null);
    queueBarklogEvent('local_ai_model_download_started', {
      model_id: LOCAL_VISION_MODEL.id,
    });
    try {
      await downloadVisionModel();
      setVisionModelState('ready');
      queueBarklogEvent('local_ai_model_download_succeeded', {
        model_id: LOCAL_VISION_MODEL.id,
      });
      feedback.showSuccess({
        title: 'Local photo descriptions ready',
        description: 'The model is saved on this device.',
      });
    } catch (downloadError) {
      setVisionModelState('missing');
      queueBarklogEvent('local_ai_model_download_failed', {
        model_id: LOCAL_VISION_MODEL.id,
      });
      setVisionModelError(
        downloadError instanceof Error
          ? downloadError.message
          : 'The photo model could not be downloaded.',
      );
    }
  };

  const handleDeleteVisionModel = async () => {
    try {
      await deleteVisionModel();
      setVisionModelState('missing');
      setVisionModelError(null);
      queueBarklogEvent('local_ai_model_removed', {
        model_id: LOCAL_VISION_MODEL.id,
      });
    } catch {
      setVisionModelError(
        'The local photo model could not be removed. Try again.',
      );
    }
  };

  const handleDescribePhoto = async () => {
    if (!premiumAccess) {
      openPremiumGate(router, 'ask-barklog-ai');
      return;
    }
    if (isSending) return;
    let selection: ImagePicker.ImagePickerResult;
    try {
      selection = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
      });
    } catch (pickerError) {
      captureBarklogError(pickerError, { source: 'assistant.photo_picker' });
      setError('The photo library could not be opened. Try again.');
      return;
    }
    const uri = selection.assets?.[0]?.uri;
    if (selection.canceled || !uri) return;
    setIsSending(true);
    setIsDescribingPhoto(true);
    setError(null);
    setMessages((current) => [
      ...current,
      {
        id: `user-photo-${Date.now()}`,
        message: 'Describe my selected photo',
        tone: 'user',
      },
    ]);
    try {
      const description = await describeLocalPhoto(uri);
      queueBarklogEvent('ai_answered', { source: 'device' });
      setMessages((current) => [
        ...current,
        {
          id: `assistant-photo-${Date.now()}`,
          message: `${description}\n\nThis is a visual description, not a health assessment. Answered on this device.`,
          tone: 'assistant',
        },
      ]);
    } catch (photoError) {
      captureBarklogError(photoError, { source: 'assistant.local_photo' });
      setError(
        'The photo could not be described on this device. Try another photo. Online photo descriptions are not available yet.',
      );
      await HapticManager.error();
    } finally {
      setIsSending(false);
      setIsDescribingPhoto(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      if (!selectedDog?.id) {
        setSnapshot(null);
        return () => {
          isMounted = false;
        };
      }

      loadWeeklyDashboardSnapshot({ dog: selectedDog })
        .then((nextSnapshot) => {
          if (isMounted) {
            setSnapshot(nextSnapshot);
          }
        })
        .catch(() => {
          if (isMounted) {
            setError('Unable to load BarkLog context.');
          }
        });

      return () => {
        isMounted = false;
      };
    }, [selectedDog]),
  );

  const activeTrainingProgramNames = useMemo(() => {
    if (!programsQuery.data) {
      return [];
    }

    return getActiveTrainingProgramPairs(programsQuery.data, enrollments).map(
      (pair) => pair.program.name,
    );
  }, [enrollments, programsQuery.data]);

  const trainingContextSummary = useMemo(() => {
    const activePrograms =
      activeTrainingProgramNames.length > 0
        ? activeTrainingProgramNames.join(', ')
        : 'No active training programs saved.';

    return [
      `Active training programs: ${activePrograms}`,
      snapshot?.trainingContextSummary ??
        'Recent training: No training sessions recorded. Recent behavior patterns: No behavior logs recorded. Recent mood patterns: No mood check-ins recorded.',
    ].join(' ');
  }, [activeTrainingProgramNames, snapshot?.trainingContextSummary]);

  const sendQuestion = async (question: string) => {
    if (isSending) return;
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      return;
    }

    if (containsEmergencyLanguage(trimmedQuestion)) {
      const messageTimestamp = Date.now();
      queueBarklogEvent('ai_answered', { source: 'safety' });

      setPrompt('');
      setError(null);
      setMessages((current) => [
        ...current,
        {
          id: `user-${messageTimestamp}`,
          message: trimmedQuestion,
          tone: 'user',
        },
        {
          id: `assistant-${messageTimestamp}`,
          message: BARKLOG_AI_EMERGENCY_ESCALATION,
          tone: 'assistant',
        },
      ]);
      return;
    }

    if (!premiumAccess) {
      openPremiumGate(router, 'ask-barklog-ai');
      return;
    }

    if (!selectedDog?.id || !snapshot) {
      const message = 'BarkLog context is still loading.';

      setError(message);
      await HapticManager.warning();
      feedback.showWarning({
        title: 'Context loading',
        description: message,
      });
      return;
    }

    setPrompt('');
    setIsSending(true);
    setError(null);

    const userMessage = {
      id: `user-${Date.now()}`,
      message: trimmedQuestion,
      tone: 'user' as const,
    };
    setMessages((current) => [...current, userMessage]);

    try {
      const response = await askBarkLogAi({
        context: {
          currentMedicationsSummary: snapshot.currentMedicationsSummary,
          dog: snapshot.context.dog,
          last30DaysSummary: snapshot.last30DaysSummary,
          trainingContextSummary,
        },
        dogId: selectedDog.id,
        question: trimmedQuestion,
        snapshot,
        user: barklogUser,
      });
      queueBarklogEvent('ai_answered', { source: response.source });
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          message: `${response.content}\n\n${response.source === 'device' ? 'Answered on this device.' : 'Answered with Atlas.'}`,
          tone: 'assistant',
        },
      ]);
    } catch (askError) {
      const message = getSafeAiErrorMessage(askError);

      setError(message);
      captureBarklogError(askError, {
        source: 'assistant.ask_barklog_ai',
        extra: {
          dog_id: selectedDog.id,
        },
      });
      await HapticManager.error();
      feedback.showError({
        title: 'AI unavailable',
        description: message,
      });
    } finally {
      setIsSending(false);
    }
  };

  const dogName = snapshot?.context.dog.name ?? selectedDog?.name ?? 'your dog';
  const introText = premiumAccess
    ? `Ask about ${dogName}'s recent logs. Downloaded models answer supported questions on this device. Other questions use Atlas when connected. BarkLog cannot diagnose.`
    : `${getPremiumFeatureLabel(
        'ask-barklog-ai',
      )} is a premium assistant for non-diagnostic questions about your dog's logs.`;
  const firstStarterQuestion = 'Summarize the last 7 days';
  const secondStarterQuestion = 'What changed compared with last week?';
  const modelStatusText = {
    ready: 'Ready offline. Model files stay on this device.',
    downloading: 'Downloading and verifying the local model...',
    checking: 'Checking local model...',
    missing: 'Download once to answer supported log questions offline.',
  }[modelState];
  const chatModelStatusText = {
    ready: 'Ready for short offline conversations about recent logs.',
    downloading: 'Downloading and verifying local conversation...',
    checking: 'Checking local conversation model...',
    missing:
      'Optional 367 MB download for broader journal questions on this device.',
  }[chatModelState];
  const visionModelStatusText = {
    ready: 'Ready to describe a selected photo without an upload.',
    downloading: 'Downloading and verifying local photo descriptions...',
    checking: 'Checking local photo model...',
    missing:
      'Optional 186 MB download for descriptive photo captions on this device.',
  }[visionModelState];

  return (
    <AssistantLayout
      title="BarkLog"
      trailing={<AssistantAlertIcon />}
      scrollToLatest={messages.length > 0}
      footer={
        <AssistantComposer
          value={prompt}
          placeholder={`Ask about ${dogName}'s recent logs.`}
          metaText={
            premiumAccess
              ? 'Local first · Atlas fallback'
              : 'Premium care assistant'
          }
          onChangeText={setPrompt}
          onUpgradePress={
            premiumAccess
              ? undefined
              : () => openPremiumGate(router, 'ask-barklog-ai')
          }
          onSendPress={() => {
            sendQuestion(prompt).catch(() => undefined);
          }}
        />
      }
      onBackPress={() => router.back()}
    >
      <View style={styles.stack}>
        {AI_FEATURES_ENABLED ? (
          <Pressable
            accessibilityLabel="Manage Atlas AI sign-in"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => router.push('/ai-sign-in' as Href)}
          >
            <Text style={styles.statusText}>
              {aiEmail ? 'Atlas connected' : 'Connect Atlas fallback'}
            </Text>
          </Pressable>
        ) : null}
        <AssistantContextPill
          label={`Using ${selectedDog?.name ?? 'Dog'}'s Data`}
          icon={<AssistantHistoryIcon />}
        />

        <View style={styles.introCard}>
          <Text style={styles.introText}>{introText}</Text>
        </View>

        {LOCAL_AI_ENABLED ? (
          <View style={styles.introCard}>
            <Text style={styles.introText}>
              {STARTER_LOCAL_MODEL.label} · 23 MB optional download
            </Text>
            <Text style={styles.statusText}>{modelStatusText}</Text>
            {modelState === 'missing' && premiumAccess ? (
              <PrimaryButton
                label="Download local model"
                onPress={() => {
                  handleDownloadModel().catch(() => undefined);
                }}
              />
            ) : null}
            {modelState === 'ready' ? (
              <PrimaryButton
                label="Remove local model"
                disabled={isSending}
                onPress={() => {
                  handleDeleteModel().catch(() => undefined);
                }}
              />
            ) : null}
            {modelError ? (
              <Text style={styles.statusText}>{modelError}</Text>
            ) : null}
          </View>
        ) : null}

        {LOCAL_AI_ENABLED ? (
          <View style={styles.introCard}>
            <Text style={styles.introText}>
              {LOCAL_CHAT_MODEL.label} · 367 MB optional download
            </Text>
            <Text style={styles.statusText}>{chatModelStatusText}</Text>
            {chatModelState === 'missing' && premiumAccess ? (
              <PrimaryButton
                label="Download local conversation"
                onPress={() => {
                  handleDownloadChatModel().catch(() => undefined);
                }}
              />
            ) : null}
            {chatModelState === 'ready' ? (
              <PrimaryButton
                label="Remove local conversation"
                disabled={isSending}
                onPress={() => {
                  handleDeleteChatModel().catch(() => undefined);
                }}
              />
            ) : null}
            {chatModelError ? (
              <Text style={styles.statusText}>{chatModelError}</Text>
            ) : null}
          </View>
        ) : null}

        {LOCAL_AI_ENABLED ? (
          <View style={styles.introCard}>
            <Text style={styles.introText}>
              {LOCAL_VISION_MODEL.label} · 186 MB optional download
            </Text>
            <Text style={styles.statusText}>{visionModelStatusText}</Text>
            <Text style={styles.statusText}>
              For visible objects and scenes only. BarkLog does not assess
              symptoms or diagnose from photos.
            </Text>
            {visionModelState === 'missing' && premiumAccess ? (
              <PrimaryButton
                label="Download photo descriptions"
                onPress={() => {
                  handleDownloadVisionModel().catch(() => undefined);
                }}
              />
            ) : null}
            {visionModelState === 'ready' && premiumAccess ? (
              <PrimaryButton
                label="Choose photo to describe"
                disabled={isSending}
                onPress={() => {
                  handleDescribePhoto().catch(() => undefined);
                }}
              />
            ) : null}
            {visionModelState === 'ready' ? (
              <PrimaryButton
                label="Remove photo model"
                disabled={isSending}
                onPress={() => {
                  handleDeleteVisionModel().catch(() => undefined);
                }}
              />
            ) : null}
            {visionModelError ? (
              <Text style={styles.statusText}>{visionModelError}</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.suggestions}>
          <AssistantSuggestionCard
            icon={<AssistantDropletIcon />}
            label={firstStarterQuestion}
            onPress={() => setPrompt(firstStarterQuestion)}
          />
          <AssistantSuggestionCard
            icon={<AssistantWeightIcon />}
            label={secondStarterQuestion}
            onPress={() => setPrompt(secondStarterQuestion)}
          />
        </View>

        {messages.map((message) => (
          <AssistantMessageBubble
            key={message.id}
            tone={message.tone}
            message={message.message}
          />
        ))}

        {isSending ? (
          <Text style={styles.statusText}>
            {isDescribingPhoto
              ? 'Describing the photo on this device...'
              : 'BarkLog AI is reviewing logs...'}
          </Text>
        ) : null}
        {error ? <Text style={styles.statusText}>{error}</Text> : null}
      </View>
    </AssistantLayout>
  );
}
