import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type OnboardingFeatureItemProps = {
  label: string;
  icon: ReactNode;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  label: {
    color: '#0A0A0A',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    flex: 1,
  },
});

export function OnboardingFeatureItem({
  label,
  icon,
}: OnboardingFeatureItemProps) {
  return (
    <View style={styles.row}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
