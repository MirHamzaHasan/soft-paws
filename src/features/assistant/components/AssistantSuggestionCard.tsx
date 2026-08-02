import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type AssistantSuggestionCardProps = {
  label: string;
  icon?: ReactNode;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#B4BDC3",
    backgroundColor: "#F7F9F9",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  label: {
    flex: 1,
    color: "#5B6269",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
});

export function AssistantSuggestionCard({
  label,
  icon,
  onPress,
}: AssistantSuggestionCardProps) {
  return (
    <Pressable accessibilityRole="button" style={styles.card} onPress={onPress}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
