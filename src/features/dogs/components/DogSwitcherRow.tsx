import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeAvatar } from '../../home/components/HomeAvatar';

type DogSwitcherRowProps = {
  name: string;
  meta: string;
  avatarEmoji: string;
  avatarBackgroundColor: string;
  tag: ReactNode;
  trailingMeta: string;
  selected?: boolean;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D9D5D1',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selected: {
    borderColor: '#0A0A0A',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  name: {
    color: '#0A0A0A',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  meta: {
    color: '#5F6670',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  trailingMeta: {
    color: '#A7A099',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
    letterSpacing: 0.4,
  },
  checkWrap: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0A0A0A',
    borderWidth: 2,
    borderColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#FAFAFA',
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '500',
  },
});

export function DogSwitcherRow({
  name,
  meta,
  avatarEmoji,
  avatarBackgroundColor,
  tag,
  trailingMeta,
  selected = false,
  onPress,
}: DogSwitcherRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.card, selected ? styles.selected : null]}
      onPress={onPress}
    >
      <HomeAvatar
        emoji={avatarEmoji}
        backgroundColor={avatarBackgroundColor}
        size={44}
      />

      <View style={styles.copy}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>

      <View style={styles.right}>
        {tag}
        <Text style={styles.trailingMeta}>{trailingMeta}</Text>
      </View>

      {selected ? (
        <View style={styles.checkWrap}>
          <Text style={styles.check}>✓</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
