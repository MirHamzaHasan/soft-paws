import { StyleSheet, Text, View } from "react-native";

type HouseholdAttentionItem = {
  color: string;
  title: string;
  detail: string;
};

type HouseholdAttentionCardProps = {
  title: string;
  items: HouseholdAttentionItem[];
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F3F6F7",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleEmoji: {
    fontSize: 16,
    lineHeight: 18,
  },
  title: {
    color: "#0A0A0A",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    color: "#0A0A0A",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "400",
  },
  detail: {
    color: "#5E6670",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "400",
  },
});

export function HouseholdAttentionCard({
  title,
  items,
}: HouseholdAttentionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.titleEmoji}>🔔</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      {items.map((item) => (
        <View key={item.title} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <View style={styles.copy}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.detail}>{item.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
