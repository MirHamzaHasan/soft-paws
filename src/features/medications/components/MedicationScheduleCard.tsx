import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type MedicationScheduleCardProps = {
  title?: string;
  children: ReactNode;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD8D2',
    backgroundColor: '#F3F5F6',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 20,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
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
