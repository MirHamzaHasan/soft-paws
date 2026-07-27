import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type LogOptionCardProps = {
  label: string;
  icon: ReactNode;
  selected?: boolean;
  onPress: () => void;
  backgroundColor?: string;
  borderColor?: string;
  labelColor?: string;
  selectedBackgroundColor?: string;
  selectedBorderColor?: string;
  selectedLabelColor?: string;
};

const styles = StyleSheet.create({
  card: {
    minHeight: 160,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  pressed: {
    opacity: 0.92,
  },
  label: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
});

export function LogOptionCard({
  label,
  icon,
  selected = false,
  onPress,
  backgroundColor = '#FFFCFA',
  borderColor = '#DDD8D2',
  labelColor = '#0A0A0A',
  selectedBackgroundColor = '#FFFCFA',
  selectedBorderColor = '#0A0A0A',
  selectedLabelColor = '#0A0A0A',
}: LogOptionCardProps) {
  const resolvedBackgroundColor = selected
    ? selectedBackgroundColor
    : backgroundColor;
  const resolvedBorderColor = selected ? selectedBorderColor : borderColor;
  const resolvedLabelColor = selected ? selectedLabelColor : labelColor;

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: resolvedBackgroundColor,
          borderColor: resolvedBorderColor,
        },
        pressed ? styles.pressed : null,
      ]}
      onPress={onPress}
    >
      <View>{icon}</View>
      <Text style={[styles.label, { color: resolvedLabelColor }]}>{label}</Text>
    </Pressable>
  );
}
