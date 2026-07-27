import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type OnboardingChoiceChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  size?: 'default' | 'large';
  leading?: ReactNode;
  backgroundColor?: string;
  borderColor?: string;
  labelColor?: string;
  selectedBackgroundColor?: string;
  selectedBorderColor?: string;
  selectedLabelColor?: string;
};

const styles = StyleSheet.create({
  chip: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    backgroundColor: '#FFFCFA',
  },
  chipSelected: {
    borderColor: '#0A0A0A',
  },
  chipLarge: {
    minHeight: 78,
    borderRadius: 24,
  },
  chipPressed: {
    opacity: 0.92,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  label: {
    color: '#A79F98',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  labelSelected: {
    color: '#0A0A0A',
  },
  labelLarge: {
    fontSize: 20,
    lineHeight: 28,
  },
});

export function OnboardingChoiceChip({
  label,
  selected = false,
  onPress,
  size = 'default',
  leading,
  backgroundColor = '#FFFCFA',
  borderColor = '#E7E5E4',
  labelColor = '#A79F98',
  selectedBackgroundColor = '#FFFCFA',
  selectedBorderColor = '#0A0A0A',
  selectedLabelColor = '#0A0A0A',
}: OnboardingChoiceChipProps) {
  const isLarge = size === 'large';
  const resolvedBackgroundColor = selected
    ? selectedBackgroundColor
    : backgroundColor;
  const resolvedBorderColor = selected ? selectedBorderColor : borderColor;
  const resolvedLabelColor = selected ? selectedLabelColor : labelColor;

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.chip,
        isLarge ? styles.chipLarge : null,
        {
          backgroundColor: resolvedBackgroundColor,
          borderColor: resolvedBorderColor,
        },
        pressed ? styles.chipPressed : null,
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        {leading}
        <Text
          style={[
            styles.label,
            isLarge ? styles.labelLarge : null,
            { color: resolvedLabelColor },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
