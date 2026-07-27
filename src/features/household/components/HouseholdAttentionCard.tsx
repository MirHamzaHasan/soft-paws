import { StyleSheet, Text, View } from 'react-native';

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
    backgroundColor: '#F3F6F7',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 22,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  titleEmoji: {
    fontSize: 24,
    lineHeight: 24,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  itemTitle: {
    color: '#0A0A0A',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  detail: {
    color: '#5E6670',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
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
