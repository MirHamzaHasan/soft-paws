import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProfileChevronIcon } from './ProfileIcons';

type ProfileActionCardProps = {
  label: string;
  leading: ReactNode;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  onPress?: () => void;
  showChevron?: boolean;
};

const styles = StyleSheet.create({
  card: {
    minHeight: 76,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  label: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
});

export function ProfileActionCard({
  label,
  leading,
  color = '#0A0A0A',
  backgroundColor = '#FFFCFA',
  borderColor = '#CFD4D8',
  onPress,
  showChevron = false,
}: ProfileActionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.card, { backgroundColor, borderColor }]}
      onPress={onPress}
    >
      <View style={styles.left}>
        {leading}
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>

      {showChevron ? (
        <ProfileChevronIcon direction="right" color={color} />
      ) : null}
    </Pressable>
  );
}
