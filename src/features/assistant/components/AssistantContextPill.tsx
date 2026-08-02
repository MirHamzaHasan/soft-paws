import { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type AssistantContextPillProps = {
  label: string;
  icon?: ReactNode;
};

const styles = StyleSheet.create({
  pill: {
    alignSelf: "center",
    minHeight: 28,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#AEB6BD",
    backgroundColor: "#E8EFEF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  label: {
    color: "#2B3136",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});

export function AssistantContextPill({
  label,
  icon,
}: AssistantContextPillProps) {
  return (
    <View style={styles.pill}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
