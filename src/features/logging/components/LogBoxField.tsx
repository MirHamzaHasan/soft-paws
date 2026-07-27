import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

type LogBoxFieldProps = TextInputProps & {
  label: string;
  unitLabel?: string;
  labelColor?: string;
  borderColor?: string;
  inputColor?: string;
};

const styles = StyleSheet.create({
  field: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  label: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  unitLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  inputWrap: {
    minHeight: 92,
    borderWidth: 1,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  input: {
    minHeight: 84,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '400',
  },
});

export function LogBoxField({
  label,
  unitLabel,
  labelColor = '#8F6110',
  borderColor = '#8F6110',
  inputColor = '#8F6110',
  ...props
}: LogBoxFieldProps) {
  return (
    <View style={styles.field}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        {unitLabel ? (
          <Text style={[styles.unitLabel, { color: labelColor }]}>
            {unitLabel}
          </Text>
        ) : null}
      </View>

      <View style={[styles.inputWrap, { borderColor }]}>
        <TextInput
          {...props}
          placeholderTextColor="#BCA77A"
          style={[styles.input, { color: inputColor }]}
        />
      </View>
    </View>
  );
}
