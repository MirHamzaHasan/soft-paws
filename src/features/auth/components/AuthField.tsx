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
    gap: 8,
  },
  label: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 1.1,
  },
  labelOutlined: {
    color: '#555555',
  },
  labelFilled: {
    color: AUTH_COLORS.textMuted,
  },
  fieldShell: {
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: 8,
  },
  shellOutlined: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: AUTH_COLORS.border,
    backgroundColor: '#F5F5F4',
    borderRadius: 4,
  },
  shellFilled: {
    backgroundColor: AUTH_COLORS.filledField,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  inputOutlined: {
    color: AUTH_COLORS.inputDefault,
  },
  inputFilled: {
    color: AUTH_COLORS.inputMuted,
  },
  inputWithLeading: {
    paddingLeft: 48,
  },
  inputWithTrailing: {
    paddingRight: 48,
  },
  leadingSlot: {
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -12,
  },
  trailingSlot: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -12,
  },
  helperText: {
    color: AUTH_COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
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
