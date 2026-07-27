import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type TriageOptionCardProps = {
  title: string;
  body: string;
  icon: ReactNode;
  selected?: boolean;
  onPress: () => void;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DED9D4',
    backgroundColor: '#F7F9F8',
    paddingHorizontal: 22,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  selected: {
    borderColor: '#0A0A0A',
    backgroundColor: '#FFFCFA',
  },
  iconWrap: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DED9D4',
    backgroundColor: '#FFFCFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
  },
  body: {
    color: '#5D656D',
    fontSize: 17,
    lineHeight: 28,
    fontWeight: '400',
  },
});

export function TriageOptionCard({
  title,
  body,
  icon,
  selected = false,
  onPress,
}: TriageOptionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.card, selected ? styles.selected : null]}
      onPress={onPress}
    >
      <View style={styles.iconWrap}>{icon}</View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </Pressable>
  );
}
