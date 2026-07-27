import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type LogReadoutFieldProps = {
  label: string;
  value: string;
  trailing?: ReactNode;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  field: {
    gap: 14,
  },
  label: {
    color: '#A7A099',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  value: {
    color: '#0A0A0A',
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '500',
    letterSpacing: -0.8,
  },
});

export function LogReadoutField({
  label,
  value,
  trailing,
  onPress,
}: LogReadoutFieldProps) {
  const content = (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Text style={styles.value}>{value}</Text>
        {trailing}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}
