import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../../components/ui/PrimaryButton";
import { AssistantAlertIcon } from "../../assistant/components/AssistantIcons";
import { AssistantLayout } from "../../assistant/components/AssistantLayout";
import { InfoOutlineIcon } from "../components/SafetyEmergencyIcons";
import {
  EyeEarIcon,
  GastroIcon,
  MobilityIcon,
  NeuroIcon,
} from "../components/TriageIcons";
import { TriageOptionCard } from "../components/TriageOptionCard";

type CategoryId = "gastro" | "mobility" | "neuro" | "skin" | "toxin";
type UrgencyId = "mild" | "persistent" | "worsening";
type TriageOutcomeId = "monitor" | "see-vet" | "emergency";

type CategoryOption = {
  body: string;
  icon: ReactNode;
  id: CategoryId;
  title: string;
};

type RedFlagOption = {
  body: string;
  id: string;
  title: string;
};

type UrgencyOption = {
  body: string;
  id: UrgencyId;
  title: string;
};

type TriageOutcome = {
  actionLabel: string;
  body: string;
  id: TriageOutcomeId;
  title: string;
};

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    body: "Vomiting, diarrhea, loss of appetite, or abdominal discomfort.",
    icon: <GastroIcon />,
    id: "gastro",
    title: "Stomach or appetite",
  },
  {
    body: "Limping, cuts, falls, bite wounds, or sudden difficulty moving.",
    icon: <MobilityIcon />,
    id: "mobility",
    title: "Mobility or injury",
  },
  {
    body: "Seizure, collapse, disorientation, severe lethargy, or wobbliness.",
    icon: <NeuroIcon />,
    id: "neuro",
    title: "Neurologic or collapse",
  },
  {
    body: "Rash, itching, eye discharge, ear odor, swelling, or hives.",
    icon: <EyeEarIcon />,
    id: "skin",
    title: "Skin, eyes, or ears",
  },
  {
    body: "Possible toxin, medication, plant, chemical, or unsafe food exposure.",
    icon: <InfoOutlineIcon color="#0A0A0A" size={28} />,
    id: "toxin",
    title: "Possible toxin exposure",
  },
];

const RED_FLAG_OPTIONS: RedFlagOption[] = [
  {
    body: "Open-mouth breathing, blue or pale gums, choking, or collapse.",
    id: "breathing-collapse",
    title: "Breathing trouble or collapse",
  },
  {
    body: "Seizure over five minutes, repeated seizures, or seizure after possible toxin exposure.",
    id: "seizure",
    title: "Seizure concern",
  },
  {
    body: "Heavy bleeding, deep wound, bite wound, pale gums, or weakness.",
    id: "severe-bleeding",
    title: "Severe bleeding or deep wound",
  },
  {
    body: "Repeated retching, swollen belly, severe pain, or sudden restlessness.",
    id: "bloat",
    title: "Bloat-like signs",
  },
  {
    body: "Known or possible ingestion of grapes, xylitol, chocolate, medication, chemicals, or poison.",
    id: "known-toxin",
    title: "Known toxin exposure",
  },
];

const URGENCY_OPTIONS: UrgencyOption[] = [
  {
    body: "Mild signs, alert, breathing normally, and improving.",
    id: "mild",
    title: "Mild and improving",
  },
  {
    body: "Not improving, repeated symptoms, or you are unsure how serious it is.",
    id: "persistent",
    title: "Persistent or unclear",
  },
  {
    body: "Getting worse, new symptoms appearing, or your dog seems weak or distressed.",
    id: "worsening",
    title: "Worsening or distressing",
  },
];

const OUTCOMES: Record<TriageOutcomeId, TriageOutcome> = {
  emergency: {
    actionLabel: "Open Emergency SOS",
    body: "These signs can become urgent. Contact an emergency vet or poison control now. Use BarkLog to organize facts while help is being contacted.",
    id: "emergency",
    title: "Emergency care now",
  },
  monitor: {
    actionLabel: "Log symptom",
    body: "If your dog is alert, breathing normally, and improving, you can monitor closely and log what happened. Contact a vet if signs return, persist, or you feel unsure.",
    id: "monitor",
    title: "Monitor closely",
  },
  "see-vet": {
    actionLabel: "Log symptom",
    body: "This does not look like an immediate emergency from your answers, but it is worth contacting your regular vet today or the next available opening.",
    id: "see-vet",
    title: "Contact a vet",
  },
};

const styles = StyleSheet.create({
  stack: {
    gap: 20,
  },
  hero: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    color: "#0A0A0A",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "400",
    letterSpacing: -1.2,
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#D3D8DB",
    backgroundColor: "#FFFCFA",
  },
  dotActive: {
    borderColor: "#0A0A0A",
    backgroundColor: "#0A0A0A",
  },
  connector: {
    width: 30,
    height: 1,
    backgroundColor: "#DAD5D0",
  },
  stepLabel: {
    color: "#7C746C",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "500",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  intro: {
    color: "#31383E",
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "400",
    textAlign: "center",
  },
  optionList: {
    gap: 12,
  },
  disclaimer: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E1DDD8",
    backgroundColor: "#F6F8F7",
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    gap: 14,
  },
  disclaimerText: {
    flex: 1,
    color: "#4F575F",
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "400",
  },
  buttonRow: {
    gap: 12,
  },
  backButton: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D8D2CC",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "#1F252B",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
  },
  outcomeCard: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingVertical: 22,
    gap: 14,
  },
  outcomeEmergency: {
    borderColor: "#F0C8C2",
    backgroundColor: "#FFF7F5",
  },
  outcomeMonitor: {
    borderColor: "#D9E3D4",
    backgroundColor: "#F7FBF4",
  },
  outcomeVet: {
    borderColor: "#EED9A7",
    backgroundColor: "#FFF9EA",
  },
  outcomeTitle: {
    color: "#0A0A0A",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "400",
  },
  outcomeBody: {
    color: "#4F575F",
    fontSize: 17,
    lineHeight: 28,
    fontWeight: "400",
  },
});

function getOutcome(
  selectedCategory: CategoryId | null,
  selectedRedFlags: string[],
  urgency: UrgencyId | null,
): TriageOutcome {
  const hasEmergencyFlag = selectedRedFlags.length > 0;

  if (
    hasEmergencyFlag ||
    selectedCategory === "toxin" ||
    (selectedCategory === "neuro" && urgency !== "mild") ||
    urgency === "worsening"
  ) {
    return OUTCOMES.emergency;
  }

  if (
    selectedCategory === "neuro" ||
    selectedCategory === "mobility" ||
    urgency === "persistent"
  ) {
    return OUTCOMES["see-vet"];
  }

  return OUTCOMES.monitor;
}

function getStepCopy(step: number) {
  if (step === 0) {
    return {
      label: "Step 1: Main concern",
      title: "Should I see a vet?",
      intro:
        "Choose the closest concern. BarkLog will organize urgency signals, not diagnose.",
    };
  }

  if (step === 1) {
    return {
      label: "Step 2: Urgent signs",
      title: "Any red flags?",
      intro:
        "Select any sign that is happening now. Leave all unselected if none apply.",
    };
  }

  if (step === 2) {
    return {
      label: "Step 3: Direction",
      title: "What is changing?",
      intro:
        "Pick the option that best describes the current direction of symptoms.",
    };
  }

  return {
    label: "Result",
    title: "Next step",
    intro: "Use this as an escalation guide, not a diagnosis.",
  };
}

function getOutcomeStyle(outcomeId: TriageOutcomeId) {
  if (outcomeId === "emergency") {
    return styles.outcomeEmergency;
  }

  if (outcomeId === "see-vet") {
    return styles.outcomeVet;
  }

  return styles.outcomeMonitor;
}

export default function VetOrWaitTriageScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(
    null,
  );
  const [selectedRedFlags, setSelectedRedFlags] = useState<string[]>([]);
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyId | null>(
    null,
  );
  const [step, setStep] = useState(0);
  const stepCopy = getStepCopy(step);
  const outcome = useMemo(
    () => getOutcome(selectedCategory, selectedRedFlags, selectedUrgency),
    [selectedCategory, selectedRedFlags, selectedUrgency],
  );

  const canContinue =
    (step === 0 && Boolean(selectedCategory)) ||
    step === 1 ||
    (step === 2 && Boolean(selectedUrgency));

  const toggleRedFlag = (id: string) => {
    setSelectedRedFlags((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const resetFlow = () => {
    setSelectedCategory(null);
    setSelectedRedFlags([]);
    setSelectedUrgency(null);
    setStep(0);
  };

  return (
    <AssistantLayout
      title="BarkLog"
      trailing={<AssistantAlertIcon />}
      onBackPress={() => router.back()}
    >
      <View style={styles.stack}>
        <View style={styles.hero}>
          <Text style={styles.title}>{stepCopy.title}</Text>

          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((dotStep, index) => (
              <View
                key={dotStep}
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                {index > 0 ? <View style={styles.connector} /> : null}
                <View
                  style={[
                    styles.dot,
                    dotStep <= step ? styles.dotActive : null,
                  ]}
                />
              </View>
            ))}
          </View>

          <Text style={styles.stepLabel}>{stepCopy.label}</Text>
          <Text style={styles.intro}>{stepCopy.intro}</Text>
        </View>

        {step === 0 ? (
          <View style={styles.optionList}>
            {CATEGORY_OPTIONS.map((option) => (
              <TriageOptionCard
                key={option.id}
                title={option.title}
                body={option.body}
                icon={option.icon}
                selected={selectedCategory === option.id}
                onPress={() => setSelectedCategory(option.id)}
              />
            ))}
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.optionList}>
            {RED_FLAG_OPTIONS.map((option) => (
              <TriageOptionCard
                key={option.id}
                title={option.title}
                body={option.body}
                icon={<InfoOutlineIcon color="#0A0A0A" size={28} />}
                selected={selectedRedFlags.includes(option.id)}
                onPress={() => toggleRedFlag(option.id)}
              />
            ))}
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.optionList}>
            {URGENCY_OPTIONS.map((option) => (
              <TriageOptionCard
                key={option.id}
                title={option.title}
                body={option.body}
                icon={<InfoOutlineIcon color="#0A0A0A" size={28} />}
                selected={selectedUrgency === option.id}
                onPress={() => setSelectedUrgency(option.id)}
              />
            ))}
          </View>
        ) : null}

        {step === 3 ? (
          <View style={[styles.outcomeCard, getOutcomeStyle(outcome.id)]}>
            <Text style={styles.outcomeTitle}>{outcome.title}</Text>
            <Text style={styles.outcomeBody}>{outcome.body}</Text>
            <PrimaryButton
              label={outcome.actionLabel}
              size="large"
              backgroundColor={
                outcome.id === "emergency" ? "#B2433E" : "#0A0A0A"
              }
              borderColor={outcome.id === "emergency" ? "#B2433E" : "#0A0A0A"}
              onPress={() => {
                if (outcome.id === "emergency") {
                  router.push("/emergency");
                  return;
                }

                router.push("/log/symptom");
              }}
            />
          </View>
        ) : null}

        <View style={styles.buttonRow}>
          {step < 3 ? (
            <PrimaryButton
              label={step === 2 ? "See recommendation" : "Continue"}
              size="large"
              disabled={!canContinue}
              onPress={() => setStep((current) => Math.min(3, current + 1))}
            />
          ) : (
            <PrimaryButton
              label="Start over"
              size="large"
              onPress={resetFlow}
            />
          )}

          {step > 0 ? (
            <Pressable
              accessibilityRole="button"
              style={styles.backButton}
              onPress={() => setStep((current) => Math.max(0, current - 1))}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.disclaimer}>
          <InfoOutlineIcon />
          <Text style={styles.disclaimerText}>
            This tool organizes urgency signals only. It is not veterinary
            diagnosis or treatment advice. If you believe your dog is in danger,
            contact emergency care now.
          </Text>
        </View>
      </View>
    </AssistantLayout>
  );
}
