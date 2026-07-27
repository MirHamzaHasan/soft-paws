import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ProfileMedicationItemProps = {
  title: string;
  meta: string;
  trailing: ReactNode;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D9D5D1',
    backgroundColor: '#F9FAFA',
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  meta: {
    color: '#626A73',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
});

export function ProfileMedicationItem({
  title,
  meta,
  trailing,
  onPress,
}: ProfileMedicationItemProps) {
  const content = (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      {trailing}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
}
