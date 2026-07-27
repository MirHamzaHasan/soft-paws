import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProfileChevronIcon } from './ProfileIcons';

type ProfileSectionCardProps = {
  title: string;
  leading: ReactNode;
  badge?: ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
  children?: ReactNode;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#CFD4D8',
    backgroundColor: '#FFFCFA',
    overflow: 'hidden',
  },
  header: {
    minHeight: 74,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    minHeight: 32,
    borderRadius: 16,
    backgroundColor: '#F0EFEE',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#5A6168',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
});

export function ProfileSectionCard({
  title,
  leading,
  badge,
  expanded = false,
  onToggle,
  children,
}: ProfileSectionCardProps) {
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        style={styles.header}
        onPress={onToggle}
      >
        <View style={styles.left}>
          {leading}
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.right}>
          {badge ? (
            <View style={styles.badge}>
              {typeof badge === 'string' ? (
                <Text style={styles.badgeText}>{badge}</Text>
              ) : (
                badge
              )}
            </View>
          ) : null}
          <ProfileChevronIcon direction={expanded ? 'up' : 'down'} />
        </View>
      </Pressable>

      {expanded ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}
