import { type ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

type OnboardingLineFieldProps = TextInputProps & {
  label: string;
  trailing?: ReactNode;
  headerAccessory?: ReactNode;
  variant?: 'line' | 'box';
  labelColor?: string;
};

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 1.1,
  },
  inputRowLine: {
    minHeight: 44,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDD8D2',
  },
  inputRowBox: {
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD8D2',
    backgroundColor: '#FFFCFA',
  },
  inputBase: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  inputLine: {
    minHeight: 44,
    paddingRight: 42,
    color: '#A79F98',
  },
  inputBox: {
    minHeight: 48,
    paddingHorizontal: 16,
    color: '#5F6670',
  },
  inputBoxWithTrailing: {
    paddingRight: 56,
  },
  trailingLine: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -14,
  },
  trailingBox: {
    position: 'absolute',
    right: 18,
    top: '50%',
    marginTop: -14,
  },
});

export function OnboardingLineField({
  label,
  trailing,
  headerAccessory,
  variant = 'line',
  labelColor = '#0A0A0A',
  ...props
}: OnboardingLineFieldProps) {
  const isBox = variant === 'box';

  return (
    <View style={styles.fieldGroup}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        {headerAccessory}
      </View>

      <View style={isBox ? styles.inputRowBox : styles.inputRowLine}>
        <TextInput
          {...props}
          placeholderTextColor={
            props.placeholderTextColor ?? (isBox ? '#D0CCC7' : '#A79F98')
          }
          style={[
            styles.inputBase,
            isBox ? styles.inputBox : styles.inputLine,
            isBox && trailing ? styles.inputBoxWithTrailing : null,
            props.style,
          ]}
        />
        {trailing ? (
          <View style={isBox ? styles.trailingBox : styles.trailingLine}>
            {trailing}
          </View>
        ) : null}
      </View>
    </View>
  );
}
