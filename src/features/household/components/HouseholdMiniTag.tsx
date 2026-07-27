import { StyleSheet, Text, View } from 'react-native';

type HouseholdMiniTagProps = {
  label: string;
  tone: 'walk' | 'meal' | 'poop' | 'pee';
};

const TONE_META = {
  meal: {
    backgroundColor: '#F3FAF1',
    borderColor: '#CFE7CB',
    color: '#2A7A39',
    emoji: '🦴',
  },
  pee: {
    backgroundColor: '#EDF5FD',
    borderColor: '#CFDFF6',
    color: '#1C65B7',
    emoji: '💧',
  },
  poop: {
    backgroundColor: '#FFF3EF',
    borderColor: '#F2D3CC',
    color: '#AB4B38',
    emoji: '💩',
  },
  walk: {
    backgroundColor: '#FFF8E6',
    borderColor: '#F1D788',
    color: '#946500',
    emoji: '🐾',
  },
} as const;

const styles = StyleSheet.create({
  tag: {
    minHeight: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 12,
    lineHeight: 14,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
  },
});

export function HouseholdMiniTag({ label, tone }: HouseholdMiniTagProps) {
  const meta = TONE_META[tone];

  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: meta.backgroundColor,
          borderColor: meta.borderColor,
        },
      ]}
    >
      <Text style={styles.emoji}>{meta.emoji}</Text>
      <Text style={[styles.label, { color: meta.color }]}>{label}</Text>
    </View>
  );
}
