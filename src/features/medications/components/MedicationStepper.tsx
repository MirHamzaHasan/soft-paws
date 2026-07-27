import { Pressable, StyleSheet, Text, View } from 'react-native';

type MedicationStepperProps = {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

const styles = StyleSheet.create({
  wrap: {
    minWidth: 122,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D9D4CE',
    backgroundColor: '#FFFCFA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  button: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    color: '#7B838B',
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '300',
  },
  value: {
    color: '#0A0A0A',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
});

export function MedicationStepper({
  value,
  onDecrease,
  onIncrease,
}: MedicationStepperProps) {
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        style={styles.button}
        onPress={onDecrease}
      >
        <Text style={styles.symbol}>-</Text>
      </Pressable>

      <Text style={styles.value}>{value}</Text>

      <Pressable
        accessibilityRole="button"
        style={styles.button}
        onPress={onIncrease}
      >
        <Text style={styles.symbol}>+</Text>
      </Pressable>
    </View>
  );
}
