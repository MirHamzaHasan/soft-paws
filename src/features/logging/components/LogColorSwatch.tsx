import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type LogColorSwatchProps = {
  color: string;
  selected?: boolean;
  icon?: ReactNode;
  onPress: () => void;
};

const styles = StyleSheet.create({
  pressable: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#0A0A0A',
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.92,
  },
});

export function LogColorSwatch({
  color,
  selected = false,
  icon,
  onPress,
}: LogColorSwatchProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.pressable,
        selected ? styles.selected : null,
        pressed ? styles.pressed : null,
      ]}
      onPress={onPress}
    >
      <View style={[styles.swatch, { backgroundColor: color }]}>{icon}</View>
    </Pressable>
  );
}
