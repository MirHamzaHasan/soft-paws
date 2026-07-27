import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type OnboardingPillBadgeProps = {
  label: string;
  icon?: ReactNode;
  backgroundColor?: string;
  borderColor?: string;
  labelColor?: string;
  align?: 'center' | 'start';
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#E0E5E7',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  badgeStart: {
    alignSelf: 'flex-start',
  },
  label: {
    color: '#0A0A0A',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 1.2,
  },
});

export function OnboardingPillBadge({
  label,
  icon,
  backgroundColor = '#E0E5E7',
  borderColor = 'transparent',
  labelColor = '#0A0A0A',
  align = 'center',
}: OnboardingPillBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        align === 'start' ? styles.badgeStart : null,
        { backgroundColor, borderColor },
      ]}
    >
      {icon}
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </View>
  );
}
