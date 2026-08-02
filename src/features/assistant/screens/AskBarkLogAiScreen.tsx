import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { trainingProgramsQueryOptions } from "@/api/training";
import { useBarklogFeedback } from "@/components/ui";
import { captureBarklogError } from "@/features/observability";
import { useLocalTrainingEnrollments } from "@/features/training/hooks/useLocalTrainingEnrollments";
import { getActiveTrainingProgramPairs } from "@/features/training/utils/trainingPresentation";
import HapticManager from "@/managers/HapticManager";

import { getSelectedDog, useAuthSessionStore } from "../../../stores";
import { askBarkLogAi } from "../../insights/api/insightsAiClient";
import {
  BARKLOG_AI_EMERGENCY_ESCALATION,
  containsEmergencyLanguage,
  getSafeAiErrorMessage,
} from "../../insights/utils/aiSafety";
import {
  loadWeeklyDashboardSnapshot,
  type WeeklyDashboardSnapshot,
} from "../../insights/utils/insightSummaries";
import {
  getPremiumFeatureLabel,
  hasPremiumAccess,
} from "../../premium/utils/premiumAccess";
import { openPremiumGate } from "../../premium/utils/premiumNavigation";
import { AssistantComposer } from "../components/AssistantComposer";
import { AssistantContextPill } from "../components/AssistantContextPill";
import {
  AssistantAlertIcon,
  AssistantDropletIcon,
  AssistantHistoryIcon,
  AssistantWeightIcon,
} from "../components/AssistantIcons";
import { AssistantLayout } from "../components/AssistantLayout";
import { AssistantMessageBubble } from "../components/AssistantMessageBubble";
import { AssistantSuggestionCard } from "../components/AssistantSuggestionCard";

const styles = StyleSheet.create({
  stack: {
    gap: 24,
  },
  introCard: {
    maxWidth: "85%",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E8E2DC",
    backgroundColor: "#FFFCFA",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  introText: {
    color: "#5B6269",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400",
  },
  suggestions: {
    maxWidth: "85%",
    gap: 8,
  },
  statusText: {
    color: "#687079",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
});

type AssistantThreadMessage = {
  id: string;
  message: string;
  tone: "assistant" | "user";
};

export default function AskBarkLogAiScreen() {
  const router = useRouter();
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const dogs = useAuthSessionStore((state) => state.dogs);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const premiumAccess = hasPremiumAccess(barklogUser);
  const programsQuery = useQuery(trainingProgramsQueryOptions());
  const { enrollments } = useLocalTrainingEnrollments(selectedDog?.id);
  const [snapshot, setSnapshot] = useState<WeeklyDashboardSnapshot | null>(
    null,
  );
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<AssistantThreadMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const feedback = useBarklogFeedback();

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
            setError("Unable to load BarkLog context.");
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
        ? activeTrainingProgramNames.join(", ")
        : "No active training programs saved.";

    return [
      `Active training programs: ${activePrograms}`,
      snapshot?.trainingContextSummary ??
        "Recent training: No training sessions recorded. Recent behavior patterns: No behavior logs recorded. Recent mood patterns: No mood check-ins recorded.",
    ].join(" ");
  }, [activeTrainingProgramNames, snapshot?.trainingContextSummary]);

  const sendQuestion = async (question: string) => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      return;
    }

    if (containsEmergencyLanguage(trimmedQuestion)) {
      const messageTimestamp = Date.now();

      setPrompt("");
      setError(null);
      setMessages((current) => [
        ...current,
        {
          id: `user-${messageTimestamp}`,
          message: trimmedQuestion,
          tone: "user",
        },
        {
          id: `assistant-${messageTimestamp}`,
          message: BARKLOG_AI_EMERGENCY_ESCALATION,
          tone: "assistant",
        },
      ]);
      return;
    }

    if (!premiumAccess) {
      openPremiumGate(router, "ask-barklog-ai");
      return;
    }

    if (!selectedDog?.id || !snapshot) {
      const message = "BarkLog context is still loading.";

      setError(message);
      await HapticManager.warning();
      feedback.showWarning({
        title: "Context loading",
        description: message,
      });
      return;
    }

    setPrompt("");
    setIsSending(true);
    setError(null);

    const userMessage = {
      id: `user-${Date.now()}`,
      message: trimmedQuestion,
      tone: "user" as const,
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
        user: barklogUser,
      });
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          message: response.content,
          tone: "assistant",
        },
      ]);
    } catch (askError) {
      const message = getSafeAiErrorMessage(askError);

      setError(message);
      captureBarklogError(askError, {
        source: "assistant.ask_barklog_ai",
        extra: {
          dog_id: selectedDog.id,
        },
      });
      await HapticManager.error();
      feedback.showError({
        title: "AI unavailable",
        description: message,
      });
    } finally {
      setIsSending(false);
    }
  };

  const dogName = snapshot?.context.dog.name ?? selectedDog?.name ?? "your dog";
  const introText = premiumAccess
    ? `Hello. I'm reviewing ${dogName}'s recent logs. I can organize patterns, but I can't diagnose.`
    : `${getPremiumFeatureLabel(
        "ask-barklog-ai",
      )} is a premium assistant for non-diagnostic questions about your dog's logs.`;
  const firstStarterQuestion = "Summarize the last 7 days";
  const secondStarterQuestion = "What changed compared with last week?";

  return (
    <AssistantLayout
      title="BarkLog"
      trailing={<AssistantAlertIcon />}
      footer={
        <AssistantComposer
          value={prompt}
          questionsRemaining={premiumAccess ? 20 : 0}
          onChangeText={setPrompt}
          onUpgradePress={() => openPremiumGate(router, "ask-barklog-ai")}
          onSendPress={() => {
            sendQuestion(prompt).catch(() => undefined);
          }}
        />
      }
      onBackPress={() => router.back()}
    >
      <View style={styles.stack}>
        <AssistantContextPill
          label={`Using ${selectedDog?.name ?? "Dog"}'s Data`}
          icon={<AssistantHistoryIcon />}
        />

        <View style={styles.introCard}>
          <Text style={styles.introText}>{introText}</Text>
        </View>

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
          <Text style={styles.statusText}>BarkLog AI is reviewing logs...</Text>
        ) : null}
        {error ? <Text style={styles.statusText}>{error}</Text> : null}
      </View>
    </AssistantLayout>
  );
}
