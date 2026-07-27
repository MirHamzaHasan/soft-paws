import { StyleSheet, Text, View } from 'react-native';

type ProfileStatCardProps = {
  label: string;
  value: string;
  suffix?: string;
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 134,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#CCD2D7',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: 'space-between',
    gap: 14,
  },
  label: {
    color: '#60676F',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  value: {
    color: '#0A0A0A',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '400',
  },
  suffix: {
    color: '#0A0A0A',
    fontSize: 18,
    lineHeight: 24,
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
