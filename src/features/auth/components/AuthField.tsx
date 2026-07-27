import { type ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { AUTH_COLORS } from './authTheme';

type AuthFieldProps = TextInputProps & {
  label: string;
  helperText?: string;
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
  variant?: 'outlined' | 'filled';
  labelColor?: string;
  fieldBackgroundColor?: string;
  fieldBorderColor?: string;
  inputColor?: string;
};

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 12,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1.8,
  },
  labelOutlined: {
    color: '#555555',
  },
  labelFilled: {
    color: AUTH_COLORS.textMuted,
  },
  fieldShell: {
    minHeight: 72,
    justifyContent: 'center',
    borderRadius: 8,
  },
  shellOutlined: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AUTH_COLORS.border,
    backgroundColor: AUTH_COLORS.surface,
  },
  shellFilled: {
    backgroundColor: AUTH_COLORS.filledField,
  },
  input: {
    minHeight: 72,
    paddingHorizontal: 28,
    paddingVertical: 18,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  inputOutlined: {
    color: AUTH_COLORS.inputDefault,
  },
  inputFilled: {
    color: AUTH_COLORS.inputMuted,
  },
  inputWithLeading: {
    paddingLeft: 56,
  },
  inputWithTrailing: {
    paddingRight: 68,
  },
  leadingSlot: {
    position: 'absolute',
    left: 22,
    top: '50%',
    marginTop: -12,
  },
  trailingSlot: {
    position: 'absolute',
    right: 22,
    top: '50%',
    marginTop: -12,
  },
  helperText: {
    color: AUTH_COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
});

export function AuthField({
  label,
  helperText,
  leadingIcon,
  trailing,
  secureTextEntry,
  variant = 'outlined',
  labelColor,
  fieldBackgroundColor,
  fieldBorderColor,
  inputColor,
  ...props
}: AuthFieldProps) {
  const isFilled = variant === 'filled';
  const resolvedPlaceholderColor =
    props.placeholderTextColor ??
    (isFilled ? AUTH_COLORS.inputMuted : AUTH_COLORS.inputDefault);

  return (
    <View style={styles.fieldGroup}>
      <Text
        style={[
          styles.label,
          isFilled ? styles.labelFilled : styles.labelOutlined,
          labelColor ? { color: labelColor } : null,
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.fieldShell,
          isFilled ? styles.shellFilled : styles.shellOutlined,
          fieldBackgroundColor
            ? { backgroundColor: fieldBackgroundColor }
            : null,
          !isFilled && fieldBorderColor
            ? { borderColor: fieldBorderColor }
            : null,
        ]}
      >
        {leadingIcon ? (
          <View style={styles.leadingSlot}>{leadingIcon}</View>
        ) : null}

        <TextInput
          {...props}
          secureTextEntry={secureTextEntry}
          placeholderTextColor={resolvedPlaceholderColor}
          style={[
            styles.input,
            isFilled ? styles.inputFilled : styles.inputOutlined,
            inputColor ? { color: inputColor } : null,
            leadingIcon ? styles.inputWithLeading : null,
            trailing ? styles.inputWithTrailing : null,
          ]}
        />

        {trailing ? <View style={styles.trailingSlot}>{trailing}</View> : null}
      </View>

      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
}
