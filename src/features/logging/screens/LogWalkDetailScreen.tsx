import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { BarklogStatusBanner } from "@/components/ui";

import { PrimaryButton } from "../../../components/ui/PrimaryButton";
import { LogBoxField } from "../components/LogBoxField";
import { LogDetailLayout } from "../components/LogDetailLayout";
import { LogFormCard } from "../components/LogFormCard";
import { LogMediaUploadButton } from "../components/LogMediaUploadButton";
import { LogNotesCard } from "../components/LogNotesCard";
import { LogOptionCard } from "../components/LogOptionCard";
import { LogSwitchRow } from "../components/LogSwitchRow";
import {
  createLocalAttachmentUri,
  type DetailWhenValue,
  normalizeOptionalText,
  parseOptionalNumber,
  resolveDetailWhenTimestamp,
  useDetailedEventSave,
} from "../hooks/useDetailedEventSave";

type EnergyLevel = "low" | "normal" | "high";

const ENERGY_OPTIONS: {
  value: EnergyLevel;
  label: string;
  emoji: string;
}[] = [
  { value: "low", label: "Low", emoji: "🥱" },
  { value: "normal", label: "Normal", emoji: "🙂" },
  { value: "high", label: "High", emoji: "⚡️" },
];

const styles = StyleSheet.create({
  content: {
    gap: 48,
  },
  formStack: {
    gap: 32,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#F0D98D",
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
  energyGrid: {
    flexDirection: "row",
    gap: 16,
  },
  energyItem: {
    flex: 1,
  },
  energyEmoji: {
    fontSize: 24,
    lineHeight: 28,
  },
  action: {
    marginTop: 12,
  },
  errorText: {
    color: "#B02921",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
});

function renderEnergyIcon(emoji: string) {
  return <Text style={styles.energyEmoji}>{emoji}</Text>;
}

export default function LogWalkDetailScreen() {
  const router = useRouter();
  const { canSave, error, isSaving, saveEvent } = useDetailedEventSave();
  const [when] = useState<DetailWhenValue>("just-now");
  const [duration, setDuration] = useState("45");
  const [distance, setDistance] = useState("2.1");
  const [autoFromHealth, setAutoFromHealth] = useState(true);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>("normal");
  const [notes, setNotes] = useState("");
  const [photoAttached, setPhotoAttached] = useState(false);

  const handleSave = async () => {
    try {
      const event = await saveEvent({
        details: {
          distance_mi: parseOptionalNumber(distance),
          duration_min: parseOptionalNumber(duration),
          energy_level: energyLevel,
          source: autoFromHealth ? "healthkit" : "manual",
        },
        notes: normalizeOptionalText(notes),
        occurredAt: resolveDetailWhenTimestamp(when),
        photoUrl: photoAttached ? createLocalAttachmentUri("walk") : null,
        type: "walk",
      });

      router.replace(`/event/${event.id}`);
    } catch {
      // The shared save hook exposes the error inline.
    }
  };

  return (
    <LogDetailLayout title="Log Walk" onBackPress={() => router.back()}>
      <View style={styles.content}>
        <LogFormCard backgroundColor="#FFF8E6" borderColor="#F4DA85" gap={28}>
          <View style={styles.formStack}>
            <LogBoxField
              label="Duration"
              unitLabel="Minutes"
              value={duration}
              keyboardType="number-pad"
              onChangeText={setDuration}
            />

            <LogBoxField
              label="Distance"
              unitLabel="Miles"
              value={distance}
              keyboardType="decimal-pad"
              onChangeText={setDistance}
            />

            <View style={styles.divider} />

            <LogSwitchRow
              label="Auto from Health"
              value={autoFromHealth}
              labelColor="#8F6110"
              checkedTrackColor="#9A7000"
              uncheckedTrackColor="#E7E2D1"
              onToggle={() => setAutoFromHealth((current) => !current)}
            />
          </View>
        </LogFormCard>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Energy level</Text>
          <View style={styles.energyGrid}>
            {ENERGY_OPTIONS.map((option) => (
              <View key={option.value} style={styles.energyItem}>
                <LogOptionCard
                  label={option.label}
                  icon={renderEnergyIcon(option.emoji)}
                  selected={energyLevel === option.value}
                  onPress={() => setEnergyLevel(option.value)}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes</Text>
          <LogNotesCard
            value={notes}
            onChangeText={setNotes}
            placeholder="Any interesting sniffs?"
            label=""
            showPhotoRow={false}
            minHeight={122}
            borderRadius={8}
          />
          <LogMediaUploadButton
            label="Add Photo"
            selected={photoAttached}
            onPress={() => setPhotoAttached((current) => !current)}
          />
        </View>

        <View style={styles.action}>
          {error ? (
            <BarklogStatusBanner
              tone="danger"
              title="Event not saved"
              description={error}
            />
          ) : null}
          <PrimaryButton
            label={isSaving ? "Saving..." : "Save event"}
            size="large"
            disabled={!canSave || isSaving}
            onPress={() => {
              handleSave().catch(() => undefined);
            }}
          />
        </View>
      </View>
    </LogDetailLayout>
  );
}
