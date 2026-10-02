import { Pressable, StyleSheet, Text } from 'react-native';

type HomeSecondaryActionButtonProps = {
  emoji: string;
  label: string;
  backgroundColor: string;
  borderColor: string;
  labelColor: string;
  onLongPress?: () => void;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  button: {
    minWidth: 132,
    minHeight: 64,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  emoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
});

export function HomeSecondaryActionButton({
  emoji,
  label,
  backgroundColor,
  borderColor,
  labelColor,
  onLongPress,
  onPress,
}: HomeSecondaryActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      delayLongPress={220}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor },
        pressed ? styles.buttonPressed : null,
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </Pressable>
  );
}
