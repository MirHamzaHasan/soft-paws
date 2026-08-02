import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type MemoryBookMetricCardProps = {
  icon: ReactNode;
  value: string;
  label: string;
  backgroundColor: string;
  borderColor: string;
  valueColor?: string;
  labelColor?: string;
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 120,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 10,
  },
  value: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '500',
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});

export function MemoryBookMetricCard({
  icon,
  value,
  label,
  backgroundColor,
  borderColor,
  valueColor = '#0A0A0A',
  labelColor = '#5D646B',
}: MemoryBookMetricCardProps) {
  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      {icon}
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </View>
  );
}
