import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type SafetyChipProps = {
  label: string;
  onPress?: () => void;
  tone?: 'neutral' | 'hazard';
  trailing?: ReactNode;
};

const styles = StyleSheet.create({
  chip: {
    minHeight: 46,
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  trailing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function SafetyChip({
  label,
  onPress,
  tone = 'neutral',
  trailing,
}: SafetyChipProps) {
  const neutral = tone === 'neutral';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.chip,
        neutral
          ? { borderColor: '#DDD8D2', backgroundColor: '#FFFCFA' }
          : { borderColor: '#F0C8C2', backgroundColor: '#FFF7F5' },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.label, { color: neutral ? '#1E2428' : '#B2261B' }]}>
        {label}
      </Text>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </Pressable>
  );
}
