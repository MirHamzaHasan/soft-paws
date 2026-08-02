import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '../../home/components/HomeIcons';

type ReturningActionCardProps = {
  title: string;
  body: string;
  leading: ReactNode;
  onPress: () => void;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD8D2',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  copy: {
    gap: 8,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
  },
  body: {
    color: '#5D656D',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
});

export function ReturningActionCard({
  title,
  body,
  leading,
  onPress,
}: ReturningActionCardProps) {
  return (
    <Pressable accessibilityRole="button" style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        {leading}
        <ChevronRightIcon color="#0A0A0A" size={26} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </Pressable>
  );
}
