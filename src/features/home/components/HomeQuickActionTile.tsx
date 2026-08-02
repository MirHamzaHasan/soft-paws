import { Pressable, StyleSheet, Text } from 'react-native';

type HomeQuickActionTileProps = {
  emoji: string;
  label: string;
  labelColor: string;
  backgroundColor: string;
  borderColor: string;
  onLongPress?: () => void;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  tile: {
    flexBasis: '48.3%',
    flexGrow: 1,
    minWidth: 150,
    minHeight: 106,
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tilePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  emoji: {
    fontSize: 25,
    lineHeight: 30,
  },
  label: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export function HomeQuickActionTile({
  emoji,
  label,
  labelColor,
  backgroundColor,
  borderColor,
  onLongPress,
  onPress,
}: HomeQuickActionTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      delayLongPress={220}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor, borderColor },
        pressed ? styles.tilePressed : null,
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </Pressable>
  );
}
