import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type MedicationScheduleCardProps = {
  title?: string;
  children: ReactNode;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD8D2',
    backgroundColor: '#F3F5F6',
    paddingHorizontal: 28,
    paddingVertical: 26,
    gap: 26,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
});

export function MedicationScheduleCard({
  title = 'Schedule',
  children,
}: MedicationScheduleCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}
