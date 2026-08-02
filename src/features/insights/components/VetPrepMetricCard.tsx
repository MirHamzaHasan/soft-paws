import { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type VetPrepMetricCardProps = {
  icon: ReactNode;
  value: string;
  label: string;
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 128,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2DDD7",
    backgroundColor: "#FFFCFA",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 10,
  },
  value: {
    color: "#0A0A0A",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "400",
    letterSpacing: -0.5,
  },
  label: {
    color: "#5D656D",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "400",
  },
});

export function VetPrepMetricCard({
  icon,
  value,
  label,
}: VetPrepMetricCardProps) {
  return (
    <View style={styles.card}>
      {icon}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
