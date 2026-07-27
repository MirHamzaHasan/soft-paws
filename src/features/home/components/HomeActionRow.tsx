import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type HomeActionRowProps = {
  label: string;
  color?: string;
  trailing?: ReactNode;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E2DC',
  },
  label: {
    flex: 1,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400',
  },
  trailing: {
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function HomeActionRow({
  label,
  color = '#384149',
  trailing,
  onPress = () => {},
}: HomeActionRowProps) {
  return (
    <Pressable accessibilityRole="button" style={styles.row} onPress={onPress}>
      <Text style={[styles.label, { color }]}>{label}</Text>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </Pressable>
  );
}
