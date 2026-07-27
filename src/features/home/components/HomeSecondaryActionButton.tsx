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
    flex: 1,
    flexBasis: '47%',
    minWidth: 132,
    minHeight: 92,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  emoji: {
    fontSize: 24,
    lineHeight: 28,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
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
