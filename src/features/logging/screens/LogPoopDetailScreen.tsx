import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { BarklogStatusBanner } from "@/components/ui";

import { PrimaryButton } from "../../../components/ui/PrimaryButton";
import { WarningIcon } from "../../home/components/HomeIcons";
import { LogColorSwatch } from "../components/LogColorSwatch";
import { LogDetailLayout } from "../components/LogDetailLayout";
import {
  CheckIcon,
  LooseLinesIcon,
  SolidDotIcon,
} from "../components/LoggingIcons";
import { LogNotesCard } from "../components/LogNotesCard";
import { LogOptionCard } from "../components/LogOptionCard";
import { LogSegmentedControl } from "../components/LogSegmentedControl";
import {
  createLocalAttachmentUri,
  DETAIL_WHEN_OPTIONS,
  type DetailWhenValue,
  normalizeOptionalText,
  resolveDetailWhenTimestamp,
  useDetailedEventSave,
} from "../hooks/useDetailedEventSave";

type QualityValue = "normal" | "loose" | "hard";
type ColorValue = "black" | "brown" | "dark" | "red" | "yellow";

const QUALITY_OPTIONS: { value: QualityValue; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "loose", label: "Loose" },
  { value: "hard", label: "Hard" },
];

const COLOR_OPTIONS: {
  value: ColorValue;
  color: string;
  warning?: boolean;
}[] = [
  { value: "brown", color: "#A26A2B" },
  { value: "dark", color: "#5C3A1A" },
  { value: "yellow", color: "#E0B72F" },
  { value: "red", color: "#A91E17", warning: true },
  { value: "black", color: "#1F1F21", warning: true },
];

const styles = StyleSheet.create({
  content: {
    gap: 32,
  },
  title: {
    color: "#0A0A0A",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "500",
    letterSpacing: -0.5,
  },
  section: {
    gap: 16,
  },
  sectionLabel: {
    color: "#0A0A0A",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
  },
  qualityGrid: {
    flexDirection: "row",
    gap: 12,
  },
  qualityItem: {
    flex: 1,
  },
  normalBadge: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#1E7A2D",
    alignItems: "center",
    justifyContent: "center",
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  action: {
    marginTop: 14,
  },
  errorText: {
    color: "#B02921",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
});

function renderQualityIcon(value: QualityValue) {
  if (value === "normal") {
    return (
      <View style={styles.normalBadge}>
        <CheckIcon size={18} />
      </View>
    );
  }

  if (value === "loose") {
    return <LooseLinesIcon />;
  }

  return <SolidDotIcon />;
}

function renderColorIcon(warning?: boolean) {
  if (!warning) {
    return null;
  }

  return <WarningIcon color="#FAFAFA" size={18} />;
}

export default function LogPoopDetailScreen() {
  const router = useRouter();
  const { canSave, error, isSaving, saveEvent } = useDetailedEventSave();
  const [when, setWhen] = useState<DetailWhenValue>("just-now");
  const [quality, setQuality] = useState<QualityValue>("normal");
  const [color, setColor] = useState<ColorValue>("brown");
  const [notes, setNotes] = useState("");
  const [photoAttached, setPhotoAttached] = useState(false);

  const handleSave = async () => {
    try {
      const event = await saveEvent({
        details: {
          color,
          quality,
        },
        notes: normalizeOptionalText(notes),
        occurredAt: resolveDetailWhenTimestamp(when),
        photoUrl: photoAttached ? createLocalAttachmentUri("poop") : null,
        type: "poop",
      });

      router.replace(`/event/${event.id}`);
    } catch {
      // The shared save hook exposes the error inline.
    }
  };

  return (
    <LogDetailLayout title="BARKLOG" onBackPress={() => router.back()}>
      <View style={styles.content}>
        <Text style={styles.title}>Log poop</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>When</Text>
          <LogSegmentedControl
            value={when}
            variant="split"
            size="large"
            options={DETAIL_WHEN_OPTIONS}
            onChange={(value) => setWhen(value as DetailWhenValue)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quality</Text>
          <View style={styles.qualityGrid}>
            {QUALITY_OPTIONS.map((option) => (
              <View key={option.value} style={styles.qualityItem}>
                <LogOptionCard
                  label={option.label}
                  icon={renderQualityIcon(option.value)}
                  selected={quality === option.value}
                  backgroundColor="#FFFCFA"
                  borderColor="#DDD8D2"
                  labelColor="#0A0A0A"
                  selectedBackgroundColor="#F3FAF1"
                  selectedBorderColor="#D2E8CD"
                  selectedLabelColor="#145E22"
                  onPress={() => setQuality(option.value)}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Color</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((option) => (
              <LogColorSwatch
                key={option.value}
                color={option.color}
                icon={renderColorIcon(option.warning)}
                selected={color === option.value}
                onPress={() => setColor(option.value)}
              />
            ))}
          </View>
        </View>

        <LogNotesCard
          label="Notes"
          labelVariant="body"
          value={notes}
          placeholder="Any details..."
          photoPlacement="below"
          minHeight={120}
          backgroundColor="#F5F5F4"
          borderRadius={8}
          borderColor="#0A0A0A"
          photoSelected={photoAttached}
          onPhotoPress={() => setPhotoAttached((current) => !current)}
          onChangeText={setNotes}
        />

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
