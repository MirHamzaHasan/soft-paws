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
    minHeight: 178,
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 18,
  },
  value: {
    fontSize: 46,
    lineHeight: 50,
    fontWeight: '400',
    letterSpacing: -1.4,
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: 1.4,
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
