import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type SettingsSectionCardProps = {
  children: ReactNode;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0DBD5',
    backgroundColor: '#FFFCFA',
    overflow: 'hidden',
  },
});

export function SettingsSectionCard({ children }: SettingsSectionCardProps) {
  return <View style={styles.card}>{children}</View>;
}
