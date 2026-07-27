import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type LogFormCardProps = {
  children: ReactNode;
  backgroundColor?: string;
  borderColor?: string;
  gap?: number;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD8D2',
    backgroundColor: '#F3F4F4',
    paddingHorizontal: 22,
    paddingVertical: 24,
    gap: 30,
  },
});

export function LogFormCard({
  children,
  backgroundColor = '#F3F4F4',
  borderColor = '#DDD8D2',
  gap = 30,
}: LogFormCardProps) {
  return (
    <View style={[styles.card, { backgroundColor, borderColor, gap }]}>
      {children}
    </View>
  );
}
