import { StyleSheet, Text, View } from "react-native";

type HouseholdMiniTagProps = {
  label: string;
  tone: "walk" | "meal" | "poop" | "pee";
};

const TONE_META = {
  meal: {
    backgroundColor: "#F3FAF1",
    borderColor: "#CFE7CB",
    color: "#2A7A39",
    emoji: "🦴",
  },
  pee: {
    backgroundColor: "#EDF5FD",
    borderColor: "#CFDFF6",
    color: "#1C65B7",
    emoji: "💧",
  },
  poop: {
    backgroundColor: "#FFF3EF",
    borderColor: "#F2D3CC",
    color: "#AB4B38",
    emoji: "💩",
  },
  walk: {
    backgroundColor: "#FFF8E6",
    borderColor: "#F1D788",
    color: "#946500",
    emoji: "🐾",
  },
} as const;

const styles = StyleSheet.create({
  tag: {
    minHeight: 24,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  emoji: {
    fontSize: 9,
    lineHeight: 11,
  },
  label: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "400",
  },
});

export function HouseholdMiniTag({ label, tone }: HouseholdMiniTagProps) {
  const meta = TONE_META[tone];

  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: meta.backgroundColor,
          borderColor: meta.borderColor,
        },
      ]}
    >
      <Text style={styles.emoji}>{meta.emoji}</Text>
      <Text style={[styles.label, { color: meta.color }]}>{label}</Text>
    </View>
  );
}
