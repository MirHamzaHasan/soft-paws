import { StyleSheet, Text, View } from 'react-native';

type InsightsMetricCardProps = {
  label: string;
  value: string;
  detail: string;
  accent: string;
  surface: string;
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 132,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 18,
  },
  label: {
    color: '#65707A',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '500',
    letterSpacing: -0.8,
  },
  detail: {
    color: '#5F6670',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
});

export function InsightsMetricCard({
  label,
  value,
  detail,
  accent,
  surface,
}: InsightsMetricCardProps) {
  return (
    <View
      style={[styles.card, { borderColor: accent, backgroundColor: surface }]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}
