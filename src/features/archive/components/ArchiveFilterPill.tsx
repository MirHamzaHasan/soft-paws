import { Pressable, StyleSheet, Text } from 'react-native';

type ArchiveFilterPillProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  compact?: boolean;
};

const styles = StyleSheet.create({
  pill: {
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DCD7D1',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillCompact: {
    minHeight: 42,
    paddingHorizontal: 18,
  },
  pillSelected: {
    borderColor: '#0A0A0A',
    backgroundColor: '#0A0A0A',
  },
  pressed: {
    opacity: 0.92,
  },
  label: {
    color: '#0A0A0A',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  labelCompact: {
    fontSize: 16,
    lineHeight: 22,
  },
  labelSelected: {
    color: '#FFFCFA',
  },
});

export function ArchiveFilterPill({
  label,
  selected = false,
  onPress,
  compact = false,
}: ArchiveFilterPillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.pill,
        compact ? styles.pillCompact : null,
        selected ? styles.pillSelected : null,
        pressed ? styles.pressed : null,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.label,
          compact ? styles.labelCompact : null,
          selected ? styles.labelSelected : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
