import { StyleSheet, Text, View } from 'react-native';

type ProfileStatCardProps = {
  label: string;
  value: string;
  suffix?: string;
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 84,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#CCD2D7',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    color: '#60676F',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  value: {
    color: '#0A0A0A',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400',
  },
  suffix: {
    color: '#0A0A0A',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
});

export function ProfileStatCard({
  label,
  value,
  suffix,
}: ProfileStatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value}
        {suffix ? <Text style={styles.suffix}> {suffix}</Text> : null}
      </Text>
    </View>
  );
}
