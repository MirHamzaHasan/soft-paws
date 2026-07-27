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
    minHeight: 42,
    borderRadius: 21,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  emoji: {
    fontSize: 16,
    lineHeight: 18,
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
