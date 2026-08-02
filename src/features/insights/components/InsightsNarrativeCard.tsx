import { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type InsightsNarrativeCardProps = {
  eyebrow: string;
  title?: string;
  body: string;
  eyebrowIcon?: ReactNode;
  borderColor?: string;
  backgroundColor?: string;
  eyebrowColor?: string;
  bodyColor?: string;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E1DB",
    backgroundColor: "#FFFCFA",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#0A0A0A",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "500",
    letterSpacing: -0.6,
  },
  body: {
    color: "#5F6670",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400",
  },
});

export function InsightsNarrativeCard({
  eyebrow,
  title,
  body,
  eyebrowIcon,
  borderColor = "#E5E1DB",
  backgroundColor = "#FFFCFA",
  eyebrowColor = "#7A847F",
  bodyColor = "#5F6670",
}: InsightsNarrativeCardProps) {
  return (
    <View style={[styles.card, { borderColor, backgroundColor }]}>
      <View style={styles.eyebrowRow}>
        {eyebrowIcon}
        <Text style={[styles.eyebrow, { color: eyebrowColor }]}>{eyebrow}</Text>
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={[styles.body, { color: bodyColor }]}>{body}</Text>
    </View>
  );
}
