import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MedicationClockIcon } from './MedicationIcons';

type MedicationTimeRowProps = {
  label: string;
  time: string;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  card: {
    minHeight: 40,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D9D4CE',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  label: {
    color: '#0A0A0A',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  time: {
    color: '#0A0A0A',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
});

export function MedicationTimeRow({
  label,
  time,
  onPress,
}: MedicationTimeRowProps) {
  const content = (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.timeWrap}>
        <Text style={styles.time}>{time}</Text>
        <MedicationClockIcon />
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
}
