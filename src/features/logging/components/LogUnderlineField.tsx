import { type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

type LogUnderlineFieldProps = TextInputProps & {
  label: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  inputTextStyle?: TextInputProps["style"];
  labelVariant?: "caps" | "body";
  rowBorderColor?: string;
  inputColor?: string;
};

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    color: "#A7A099",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  labelBody: {
    color: "#263136",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "500",
    letterSpacing: 0,
    textTransform: "none",
  },
  row: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#181818",
  },
  input: {
    flex: 1,
    minHeight: 44,
    color: "#0A0A0A",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "400",
  },
});

export function LogUnderlineField({
  label,
  leading,
  trailing,
  inputTextStyle,
  labelVariant = "caps",
  rowBorderColor = "#181818",
  inputColor = "#0A0A0A",
  ...props
}: LogUnderlineFieldProps) {
  return (
    <View style={styles.field}>
      <Text
        style={[
          styles.label,
          labelVariant === "body" ? styles.labelBody : null,
        ]}
      >
        {label}
      </Text>
      <View style={[styles.row, { borderBottomColor: rowBorderColor }]}>
        {leading}
        <TextInput
          {...props}
          placeholderTextColor="#B4ADA7"
          style={[styles.input, { color: inputColor }, inputTextStyle]}
        />
        {trailing}
      </View>
    </View>
  );
}
