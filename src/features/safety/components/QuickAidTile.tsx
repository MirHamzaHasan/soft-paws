import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type QuickAidTileProps = {
  label: string;
  icon: ReactNode;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 178,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#BEC7CD',
    backgroundColor: '#F9FAFA',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    paddingHorizontal: 12,
  },
  label: {
    color: '#0A0A0A',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
    textAlign: 'center',
  },
});

export function QuickAidTile({ label, icon, onPress }: QuickAidTileProps) {
  return (
    <Pressable accessibilityRole="button" style={styles.tile} onPress={onPress}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
