import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type VetPrepMetricCardProps = {
  icon: ReactNode;
  value: string;
  label: string;
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 140,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2DDD7',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 16,
  },
  value: {
    color: '#0A0A0A',
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '400',
    letterSpacing: -1.2,
  },
  label: {
    color: '#5D656D',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
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
