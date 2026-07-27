import { StyleSheet, Text, View } from 'react-native';

type InsightsProgressRowProps = {
  label: string;
  value: string;
  percent: number;
  accent: string;
};

const styles = StyleSheet.create({
  row: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    color: '#2E363D',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
  },
  value: {
    color: '#5F6670',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  rail: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#EFEAE5',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});

export function InsightsProgressRow({
  label,
  value,
  percent,
  accent,
}: InsightsProgressRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>

      <View style={styles.rail}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.max(0, Math.min(100, percent))}%`,
              backgroundColor: accent,
            },
          ]}
        />
      </View>
    </View>
  );
}
