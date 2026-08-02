import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type OnboardingChoiceChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  size?: "compact" | "default" | "large";
  leading?: ReactNode;
  backgroundColor?: string;
  borderColor?: string;
  labelColor?: string;
  selectedBackgroundColor?: string;
  selectedBorderColor?: string;
  selectedLabelColor?: string;
};

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFCFA",
    paddingHorizontal: 16,
  },
  chipSelected: {
    borderColor: "#0A0A0A",
  },
  chipCompact: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
  },
  chipLarge: {
    minHeight: 48,
    borderRadius: 14,
  },
  chipPressed: {
    opacity: 0.92,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    color: "#A79F98",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
  labelSelected: {
    color: "#0A0A0A",
  },
  labelCompact: {
    fontSize: 11,
    lineHeight: 14,
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export function OnboardingChoiceChip({
  label,
  selected = false,
  onPress,
  size = "default",
  leading,
  backgroundColor = "#FFFCFA",
  borderColor = "#E7E5E4",
  labelColor = "#A79F98",
  selectedBackgroundColor = "#FFFCFA",
  selectedBorderColor = "#0A0A0A",
  selectedLabelColor = "#0A0A0A",
}: OnboardingChoiceChipProps) {
  const isLarge = size === "large";
  const isCompact = size === "compact";
  const resolvedBackgroundColor = selected
    ? selectedBackgroundColor
    : backgroundColor;
  const resolvedBorderColor = selected ? selectedBorderColor : borderColor;
  const resolvedLabelColor = selected ? selectedLabelColor : labelColor;

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.chip,
        isCompact ? styles.chipCompact : null,
        isLarge ? styles.chipLarge : null,
        {
          backgroundColor: resolvedBackgroundColor,
          borderColor: resolvedBorderColor,
        },
        pressed ? styles.chipPressed : null,
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        {leading}
        <Text
          style={[
            styles.label,
            isCompact ? styles.labelCompact : null,
            isLarge ? styles.labelLarge : null,
            { color: resolvedLabelColor },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
