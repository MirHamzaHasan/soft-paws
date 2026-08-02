import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

type LogBoxFieldProps = TextInputProps & {
  label: string;
  unitLabel?: string;
  labelColor?: string;
  borderColor?: string;
  inputColor?: string;
};

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  label: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "500",
  },
  unitLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  inputWrap: {
    minHeight: 52,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 0,
    justifyContent: "center",
  },
  input: {
    minHeight: 50,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "500",
  },
});

export function LogBoxField({
  label,
  unitLabel,
  labelColor = "#8F6110",
  borderColor = "#8F6110",
  inputColor = "#8F6110",
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
