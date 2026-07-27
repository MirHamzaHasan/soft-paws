import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type InsightsSnapshotCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  valueSuffix?: string;
  detail: string;
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 156,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E1DB',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 22,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    color: '#1B2024',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    color: '#0A0A0A',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '500',
    letterSpacing: -0.8,
  },
  valueSuffix: {
    color: '#5F6670',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  detail: {
    color: '#5F6670',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});

export function InsightsSnapshotCard({
  icon,
  label,
  value,
  valueSuffix,
  detail,
}: InsightsSnapshotCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {valueSuffix ? (
          <Text style={styles.valueSuffix}>{valueSuffix}</Text>
        ) : null}
      </View>

      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}
