import { StyleSheet, Text, View } from 'react-native';

type DogSwitcherTagProps = {
  label: string;
  tone: 'walk' | 'meal';
};

const TONE_META = {
  meal: {
    backgroundColor: '#F3FAF1',
    borderColor: '#CFE7CB',
    color: '#1E6B2D',
    emoji: '🍴',
  },
  walk: {
    backgroundColor: '#FFF8E6',
    borderColor: '#F1D788',
    color: '#946500',
    emoji: '🚶',
  },
} as const;

const styles = StyleSheet.create({
  pill: {
    minHeight: 24,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '400',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  emoji: {
    fontSize: 10,
    lineHeight: 12,
  },
});

export function DogSwitcherTag({ label, tone }: DogSwitcherTagProps) {
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
      <Text style={styles.emoji}>{meta.emoji}</Text>
      <Text style={[styles.label, { color: meta.color }]}>{label}</Text>
    </View>
  );
}
