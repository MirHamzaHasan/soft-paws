import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BarklogStatusBanner } from "@/components/ui";

import { PrimaryButton } from "../../../components/ui/PrimaryButton";
import { OnboardingChoiceChip } from "../../onboarding/components/OnboardingChoiceChip";
import { LogDetailLayout } from "../components/LogDetailLayout";
import { LogMediaUploadButton } from "../components/LogMediaUploadButton";
import { LogNotesCard } from "../components/LogNotesCard";
import { LogSeverityCard } from "../components/LogSeverityCard";
import { SymptomBodyMapCard } from "../components/SymptomBodyMapCard";
import {
  createLocalAttachmentUri,
  type DetailWhenValue,
  normalizeOptionalText,
  resolveDetailWhenTimestamp,
  useDetailedEventSave,
} from "../hooks/useDetailedEventSave";

type SymptomCategory =
  | "digestive"
  | "mobility"
  | "skin"
  | "behavior"
  | "respiratory"
  | "eyes-ears"
  | "other";

type Severity = "mild" | "moderate" | "severe";

const CATEGORIES: { value: SymptomCategory; label: string }[] = [
  { value: "digestive", label: "Digestive" },
  { value: "mobility", label: "Mobility" },
  { value: "skin", label: "Skin" },
  { value: "behavior", label: "Behavior" },
  { value: "respiratory", label: "Respiratory" },
  { value: "eyes-ears", label: "Eyes/Ears" },
  { value: "other", label: "Other" },
];

const SYMPTOMS_BY_CATEGORY: Record<
  SymptomCategory,
  { value: string; label: string }[]
> = {
  behavior: [
    { value: "lethargy", label: "Lethargy" },
    { value: "restless", label: "Restless" },
    { value: "not-eating", label: "Not eating" },
  ],
  digestive: [
    { value: "vomiting", label: "Vomiting" },
    { value: "diarrhea", label: "Diarrhea" },
    { value: "constipation", label: "Constipation" },
  ],
  "eyes-ears": [
    { value: "red-eye", label: "Red eye" },
    { value: "ear-scratching", label: "Ear scratching" },
    { value: "discharge", label: "Discharge" },
  ],
  mobility: [
    { value: "limping", label: "Limping" },
    { value: "stiffness", label: "Stiffness" },
    { value: "trouble-standing", label: "Trouble standing" },
  ],
  other: [
    { value: "unusual", label: "Unusual" },
    { value: "pain-signal", label: "Pain signal" },
    { value: "owner-note", label: "Owner note" },
  ],
  respiratory: [
    { value: "coughing", label: "Coughing" },
    { value: "sneezing", label: "Sneezing" },
    { value: "breathing-change", label: "Breathing change" },
  ],
  skin: [
    { value: "itching", label: "Itching" },
    { value: "rash", label: "Rash" },
    { value: "lump", label: "Lump" },
  ],
};

const HOTSPOTS = [
  { id: "head", x: 30, y: 45 },
  { id: "front-leg", x: 40, y: 72 },
  { id: "belly", x: 50, y: 62 },
  { id: "rear-leg", x: 62, y: 72 },
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
  subtitle: {
    color: "#5F6670",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
  section: {
    gap: 16,
  },
  sectionLabel: {
    color: "#263136",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chipItem: {
    flexShrink: 0,
  },
  detailsStack: {
    gap: 12,
  },
  action: {
    marginTop: 10,
    gap: 18,
  },
  errorText: {
    color: "#B02921",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
  emergencyButton: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  emergencyText: {
    color: "#B02921",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
});

export default function LogSymptomScreen() {
  const router = useRouter();
  const { canSave, error, isSaving, saveEvent } = useDetailedEventSave();
  const [when] = useState<DetailWhenValue>("just-now");
  const [selectedCategories, setSelectedCategories] = useState<
    SymptomCategory[]
  >(["digestive"]);
  const selectedSymptoms = ["vomiting"];
  const [severity, setSeverity] = useState<Severity>("moderate");
  const [location, setLocation] = useState("rear-leg");
  const [details, setDetails] = useState("");
  const [photoAttached, setPhotoAttached] = useState(false);

  const symptomOptions = selectedCategories.flatMap(
    (selectedCategory) => SYMPTOMS_BY_CATEGORY[selectedCategory],
  );

  const toggleCategory = (value: SymptomCategory) => {
    setSelectedCategories((current) => {
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      return next.length > 0 ? next : current;
    });
  };

  const handleSave = async () => {
    try {
      const activeSymptoms = new Set(
        symptomOptions.map((option) => option.value),
      );
      const event = await saveEvent({
        details: {
          body_zones: location ? [location] : [],
          categories: selectedCategories,
          severity,
          symptoms: selectedSymptoms.filter((symptom) =>
            activeSymptoms.has(symptom),
          ),
        },
        notes: normalizeOptionalText(details),
        occurredAt: resolveDetailWhenTimestamp(when),
        photoUrl: photoAttached ? createLocalAttachmentUri("symptom") : null,
        type: "symptom",
      });

      router.replace(`/event/${event.id}`);
    } catch {
      // The shared save hook exposes the error inline.
    }
  };

  return (
    <LogDetailLayout title="BARKLOG" onBackPress={() => router.back()}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.title}>Log Symptom</Text>
          <Text style={styles.subtitle}>
            Record unusual behaviors or physical issues.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.chipWrap}>
            {CATEGORIES.map((item) => (
              <View key={item.value} style={styles.chipItem}>
                <OnboardingChoiceChip
                  label={item.label}
                  selected={selectedCategories.includes(item.value)}
                  backgroundColor="#FFFCFA"
                  borderColor="#DDD8D2"
                  labelColor="#263136"
                  selectedBackgroundColor="#2F3535"
                  selectedBorderColor="#2F3535"
                  selectedLabelColor="#FAFAFA"
                  onPress={() => toggleCategory(item.value)}
                />
              </View>
            ))}
          </View>
        </View>

        <LogSeverityCard
          label="Severity"
          value={severity}
          accentColor="#E0A925"
          options={[
            { label: "Mild", value: "mild" },
            { label: "Moderate", value: "moderate" },
            { label: "Severe", value: "severe" },
          ]}
          onChange={(value) => setSeverity(value as Severity)}
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Location</Text>
          <SymptomBodyMapCard
            value={location}
            hotspots={HOTSPOTS}
            onChange={setLocation}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Details</Text>
          <View style={styles.detailsStack}>
            <LogMediaUploadButton
              label="Add Photo or Video"
              variant="dashed"
              selected={photoAttached}
              onPress={() => setPhotoAttached((current) => !current)}
            />
            <LogNotesCard
              value={details}
              onChangeText={setDetails}
              placeholder="Describe what you observed..."
              label=""
              showPhotoRow={false}
              minHeight={128}
              borderRadius={12}
            />
          </View>
        </View>

        <View style={styles.action}>
          {error ? (
            <BarklogStatusBanner
              tone="danger"
              title="Symptom not saved"
              description={error}
            />
          ) : null}
          <PrimaryButton
            label={isSaving ? "Saving..." : "Save symptom"}
            size="large"
            backgroundColor="#2F3535"
            disabled={!canSave || isSaving}
            onPress={() => {
              handleSave().catch(() => undefined);
            }}
          />

          <Pressable
            accessibilityRole="button"
            style={styles.emergencyButton}
            onPress={() => router.push("/emergency")}
          >
            <Text style={styles.emergencyText}>* Contact Emergency Vet</Text>
          </Pressable>
        </View>
      </View>
    </LogDetailLayout>
  );
}
