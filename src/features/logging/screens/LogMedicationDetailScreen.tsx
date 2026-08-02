import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BarklogStatusBanner } from "@/components/ui";
import { listActiveMedicationsForDog, type MedicationModel } from "@/db";

import { PrimaryButton } from "../../../components/ui/PrimaryButton";
import { OnboardingChoiceChip } from "../../onboarding/components/OnboardingChoiceChip";
import { OnboardingPillBadge } from "../../onboarding/components/OnboardingPillBadge";
import { LogDetailLayout } from "../components/LogDetailLayout";
import { LogFormCard } from "../components/LogFormCard";
import {
  CheckIcon,
  ChevronDoubleDownIcon,
  PlusSquareIcon,
} from "../components/LoggingIcons";
import { LogNotesCard } from "../components/LogNotesCard";
import { LogSelectField } from "../components/LogSelectField";
import { LogSwitchRow } from "../components/LogSwitchRow";
import { LogUnderlineField } from "../components/LogUnderlineField";
import {
  type DetailWhenValue,
  normalizeOptionalText,
  parseOptionalNumber,
  resolveDetailWhenTimestamp,
  useDetailedEventSave,
} from "../hooks/useDetailedEventSave";

type SideEffect =
  | "none"
  | "vomiting"
  | "drowsiness"
  | "loss-of-appetite"
  | "diarrhea";

const SIDE_EFFECTS: { value: SideEffect; label: string }[] = [
  { value: "none", label: "None" },
  { value: "vomiting", label: "Vomiting" },
  { value: "drowsiness", label: "Drowsiness" },
  { value: "loss-of-appetite", label: "Loss of appetite" },
  { value: "diarrhea", label: "Diarrhea" },
];

const styles = StyleSheet.create({
  content: {
    gap: 32,
  },
  hero: {
    gap: 8,
  },
  title: {
    color: "#0A0A0A",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "500",
    letterSpacing: -0.5,
  },
  cardContent: {
    gap: 24,
  },
  section: {
    gap: 16,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chipItem: {
    flexShrink: 0,
  },
  sectionLabel: {
    color: "#263136",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
    marginBottom: 12,
  },
  action: {
    marginTop: 16,
    gap: 16,
  },
  errorText: {
    color: "#B02921",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
  helperText: {
    color: "#687079",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
  addMedicationButton: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addMedicationText: {
    color: "#5F6670",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
});

function parseDoseMg(value: string) {
  const match = value.match(/(\d+(?:\.\d+)?)\s*mg/i);

  if (match?.[1]) {
    return Number(match[1]);
  }

  return parseOptionalNumber(value);
}

export default function LogMedicationDetailScreen() {
  const router = useRouter();
  const { canSave, error, isSaving, primaryDog, saveEvent } =
    useDetailedEventSave();
  const [when] = useState<DetailWhenValue>("just-now");
  const [medications, setMedications] = useState<MedicationModel[]>([]);
  const [selectedMedicationId, setSelectedMedicationId] = useState<
    string | null
  >(null);
  const [isLoadingMedications, setIsLoadingMedications] = useState(false);
  const [medicationError, setMedicationError] = useState<string | null>(null);
  const [dose, setDose] = useState("");
  const [withFood, setWithFood] = useState(true);
  const [notes, setNotes] = useState("");
  const [selectedEffects, setSelectedEffects] = useState<SideEffect[]>([
    "none",
  ]);
  const selectedMedication =
    medications.find((medication) => medication.id === selectedMedicationId) ??
    medications[0] ??
    null;

  const selectMedication = useCallback((medication: MedicationModel) => {
    setSelectedMedicationId(medication.id);
    setDose(
      typeof medication.doseMg === "number" ? `${medication.doseMg} mg` : "",
    );
    setWithFood(medication.giveWithFood);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      if (!primaryDog?.id) {
        setMedications([]);
        setSelectedMedicationId(null);
        setIsLoadingMedications(false);
        return () => {
          isMounted = false;
        };
      }

      setIsLoadingMedications(true);
      setMedicationError(null);

      listActiveMedicationsForDog(primaryDog.id)
        .then((nextMedications) => {
          if (!isMounted) {
            return;
          }

          setMedications(nextMedications);
          setIsLoadingMedications(false);

          if (nextMedications.length === 0) {
            setSelectedMedicationId(null);
            return;
          }

          const stillSelected = nextMedications.some(
            (medication) => medication.id === selectedMedicationId,
          );

          if (!stillSelected) {
            const firstMedication = nextMedications[0];

            if (firstMedication) {
              selectMedication(firstMedication);
            }
          }
        })
        .catch(() => {
          if (isMounted) {
            setMedicationError("Unable to load medications.");
            setIsLoadingMedications(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }, [primaryDog?.id, selectMedication, selectedMedicationId]),
  );

  const toggleEffect = (value: SideEffect) => {
    if (value === "none") {
      setSelectedEffects(["none"]);
      return;
    }

    setSelectedEffects((current) => {
      const withoutNone = current.filter((item) => item !== "none");

      if (withoutNone.includes(value)) {
        const next = withoutNone.filter((item) => item !== value);
        return next.length > 0 ? next : ["none"];
      }

      return [...withoutNone, value];
    });
  };

  const handleSave = async () => {
    if (!selectedMedication) {
      setMedicationError("Add a medication before saving this event.");
      return;
    }

    try {
      const sideEffects = selectedEffects.includes("none")
        ? []
        : selectedEffects;
      const event = await saveEvent({
        details: {
          dose_mg: parseDoseMg(dose),
          given_with_food: withFood,
          med_id: selectedMedication.id,
          side_effects: sideEffects,
        },
        notes: normalizeOptionalText(notes),
        occurredAt: resolveDetailWhenTimestamp(when),
        type: "medication",
      });

      router.replace(`/event/${event.id}`);
    } catch {
      // The shared save hook exposes the error inline.
    }
  };

  const cycleMedication = () => {
    if (medications.length < 2 || !selectedMedication) {
      return;
    }

    const currentIndex = medications.findIndex(
      (medication) => medication.id === selectedMedication.id,
    );
    const nextIndex =
      currentIndex >= 0 ? (currentIndex + 1) % medications.length : 0;
    const nextMedication = medications[nextIndex];

    if (nextMedication) {
      selectMedication(nextMedication);
    }
  };

  const submitDisabled =
    !canSave || isSaving || isLoadingMedications || !selectedMedication;
  const visibleError = medicationError ?? error;

  return (
    <LogDetailLayout
      title="BarkLog"
      headerVariant="brand"
      onBackPress={() => router.back()}
    >
      <View style={styles.content}>
        <View style={styles.hero}>
          <OnboardingPillBadge
            label="LOG EVENT"
            icon={<PlusSquareIcon />}
            align="start"
            backgroundColor="#F6F0FF"
            borderColor="#DCCFFF"
            labelColor="#5E34C6"
          />

          <Text style={styles.title}>Log Medication</Text>
        </View>

        <LogFormCard>
          <View style={styles.cardContent}>
            <LogSelectField
              label="Medication"
              value={
                selectedMedication?.name ??
                (isLoadingMedications ? "Loading medications..." : "None saved")
              }
              trailing={<ChevronDoubleDownIcon />}
              onPress={medications.length > 1 ? cycleMedication : undefined}
            />

            {medications.length > 1 ? (
              <View style={styles.chips}>
                {medications.map((medication) => (
                  <View key={medication.id} style={styles.chipItem}>
                    <OnboardingChoiceChip
                      label={medication.name}
                      selected={selectedMedication?.id === medication.id}
                      backgroundColor="#FFFCFA"
                      borderColor="#DDD8D2"
                      labelColor="#263136"
                      selectedBackgroundColor="#0A0A0A"
                      selectedBorderColor="#0A0A0A"
                      selectedLabelColor="#FAFAFA"
                      onPress={() => selectMedication(medication)}
                    />
                  </View>
                ))}
              </View>
            ) : null}

            {!isLoadingMedications && medications.length === 0 ? (
              <Text style={styles.helperText}>
                Add your first medication to use this logging flow.
              </Text>
            ) : null}

            <LogUnderlineField
              label="Dose"
              labelVariant="body"
              value={dose}
              onChangeText={setDose}
            />

            <LogSwitchRow
              label="Given with food"
              value={withFood}
              onToggle={() => setWithFood((current) => !current)}
            />

            <View>
              <Text style={styles.sectionLabel}>Side Effects Observed</Text>
              <View style={styles.chips}>
                {SIDE_EFFECTS.map((effect) => {
                  const selected = selectedEffects.includes(effect.value);

                  return (
                    <View key={effect.value} style={styles.chipItem}>
                      <OnboardingChoiceChip
                        label={effect.label}
                        selected={selected}
                        backgroundColor="#FFFCFA"
                        borderColor="#DDD8D2"
                        labelColor="#263136"
                        selectedBackgroundColor="#0A0A0A"
                        selectedBorderColor="#0A0A0A"
                        selectedLabelColor="#FAFAFA"
                        onPress={() => toggleEffect(effect.value)}
                      />
                    </View>
                  );
                })}
              </View>
            </View>

            <LogNotesCard
              label="Notes"
              labelVariant="body"
              value={notes}
              placeholder="Any additional observations..."
              showPhotoRow={false}
              minHeight={92}
              onChangeText={setNotes}
            />
          </View>
        </LogFormCard>

        <View style={styles.action}>
          {visibleError ? (
            <BarklogStatusBanner
              tone="danger"
              title="Medication not saved"
              description={visibleError}
            />
          ) : null}
          <PrimaryButton
            label={isSaving ? "Saving..." : "Save event"}
            size="large"
            leadingIcon={<CheckIcon />}
            disabled={submitDisabled}
            onPress={() => {
              handleSave().catch(() => undefined);
            }}
          />

          <Pressable
            accessibilityRole="button"
            style={styles.addMedicationButton}
            onPress={() => router.push("/add-medication")}
          >
            <Text style={styles.addMedicationText}>+ Add new medication</Text>
          </Pressable>
        </View>
      </View>
    </LogDetailLayout>
  );
}
