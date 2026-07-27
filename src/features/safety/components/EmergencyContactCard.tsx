import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type EmergencyContactCardProps = {
  label: string;
  number: string;
  backgroundColor: string;
  borderColor: string;
  labelColor: string;
  numberColor: string;
  onPress?: () => void;
  leading?: ReactNode;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  number: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '400',
    letterSpacing: -0.8,
  },
});

export function EmergencyContactCard({
  label,
  number,
  backgroundColor,
  borderColor,
  labelColor,
  numberColor,
  onPress,
  leading,
}: EmergencyContactCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.card, { backgroundColor, borderColor }]}
      onPress={onPress}
    >
      <View style={styles.labelRow}>
        {leading}
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      </View>
      <Text style={[styles.number, { color: numberColor }]}>{number}</Text>
    </Pressable>
  );
}
