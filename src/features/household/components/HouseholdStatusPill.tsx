import { StyleSheet, Text, View } from 'react-native';

type HouseholdStatusPillProps = {
  label: string;
  tone: 'good' | 'due';
};

const TONE_META = {
  due: {
    backgroundColor: '#F3EEFF',
    borderColor: '#D7C8FF',
    color: '#6A44D2',
  },
  good: {
    backgroundColor: '#F3FAF1',
    borderColor: '#CFE7CB',
    color: '#2A7A39',
  },
} as const;

const styles = StyleSheet.create({
  pill: {
    minHeight: 34,
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
});

export function HouseholdStatusPill({ label, tone }: HouseholdStatusPillProps) {
  const meta = TONE_META[tone];

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: meta.backgroundColor,
          borderColor: meta.borderColor,
        },
      ]}
    >
      <Text style={[styles.label, { color: meta.color }]}>{label}</Text>
    </View>
  );
}
