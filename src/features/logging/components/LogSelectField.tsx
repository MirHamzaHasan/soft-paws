import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type LogSelectFieldProps = {
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
    color: '#263136',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  control: {
    minHeight: 72,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD8D2',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  value: {
    flex: 1,
    color: '#263136',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
});

export function LogSelectField({
  label,
  value,
  trailing,
  onPress,
}: LogSelectFieldProps) {
  const content = (
    <View style={styles.control}>
      <Text style={styles.value}>{value}</Text>
      {trailing}
    </View>
  );

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {onPress ? (
        <Pressable accessibilityRole="button" onPress={onPress}>
          {content}
        </Pressable>
      ) : (
        content
      )}
    </View>
  );
}
