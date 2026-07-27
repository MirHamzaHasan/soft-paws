import { isValidElement, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeAvatar } from '../../home/components/HomeAvatar';

type HouseholdCompanionCardProps = {
  name: string;
  meta: string;
  avatarEmoji: string;
  avatarBackgroundColor: string;
  status: ReactNode;
  lastLabel: string;
  lastValue: string;
  nextLabel: string;
  nextValue: string;
  tags: ReactNode[];
  actions: { label: string; icon: string; onPress?: () => void }[];
  selected?: boolean;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D7D3CF',
    backgroundColor: '#FFFCFA',
  },
  cardSelected: {
    borderColor: '#0A0A0A',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  name: {
    color: '#0A0A0A',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '400',
  },
  meta: {
    color: '#4E5660',
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
  },
  middle: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D7D3CF',
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 18,
  },
  metricCell: {
    flex: 1,
    gap: 8,
  },
  metricLabel: {
    color: '#4E5660',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#0A0A0A',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  metricAlert: {
    color: '#B03A32',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionStrip: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D7D3CF',
    flexDirection: 'row',
  },
  actionCell: {
    flex: 1,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#D7D3CF',
  },
  actionCellLast: {
    borderRightWidth: 0,
  },
  actionEmoji: {
    fontSize: 18,
    lineHeight: 18,
  },
  actionLabel: {
    color: '#4E5660',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

export function HouseholdCompanionCard({
  name,
  meta,
  avatarEmoji,
  avatarBackgroundColor,
  status,
  lastLabel,
  lastValue,
  nextLabel,
  nextValue,
  tags,
  actions,
  selected = false,
  onPress,
}: HouseholdCompanionCardProps) {
  return (
    <View style={[styles.card, selected ? styles.cardSelected : null]}>
      <Pressable
        accessibilityRole="button"
        disabled={!onPress}
        style={styles.header}
        onPress={onPress}
      >
        <HomeAvatar
          emoji={avatarEmoji}
          backgroundColor={avatarBackgroundColor}
          size={74}
        />

        <View style={styles.copy}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>{meta}</Text>
        </View>

        {status}
      </Pressable>

      <View style={styles.middle}>
        <View style={styles.row}>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>{lastLabel}</Text>
            <Text style={styles.metricValue}>{lastValue}</Text>
          </View>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>{nextLabel}</Text>
            <Text
              style={[
                styles.metricValue,
                nextValue.includes('Overdue') ? styles.metricAlert : null,
              ]}
            >
              {nextValue}
            </Text>
          </View>
        </View>

        <View style={styles.tagsRow}>
          {tags.map((tag) => {
            const key =
              isValidElement(tag) && tag.key != null
                ? String(tag.key)
                : String(tag);

            return <View key={key}>{tag}</View>;
          })}
        </View>
      </View>

      <View style={styles.actionStrip}>
        {actions.map((action, index) => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            style={[
              styles.actionCell,
              index === actions.length - 1 ? styles.actionCellLast : null,
            ]}
            onPress={action.onPress}
          >
            <Text style={styles.actionEmoji}>{action.icon}</Text>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
