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
    minWidth: 145,
    minHeight: 170,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  tilePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  emoji: {
    fontSize: 42,
    lineHeight: 48,
  },
  label: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.8,
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
