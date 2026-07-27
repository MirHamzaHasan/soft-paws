import { StyleSheet, Text, View } from 'react-native';

import { CloudSyncIcon } from './HomeIcons';

type PendingSyncItemProps = {
  time: string;
  title: string;
  description: string;
  emoji: string;
  backgroundColor: string;
  borderColor: string;
  titleColor: string;
  bodyColor: string;
  showConnector?: boolean;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 18,
  },
  railColumn: {
    width: 88,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    width: 52,
    color: '#5C6670',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
  },
  rail: {
    width: 20,
    alignItems: 'center',
  },
  railSpacer: {
    height: 28,
  },
  railLine: {
    flex: 1,
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#D9D4CF',
    marginTop: 8,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 22,
    paddingVertical: 22,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emoji: {
    fontSize: 28,
    lineHeight: 32,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '400',
  },
  description: {
    fontSize: 18,
    lineHeight: 30,
    fontWeight: '400',
  },
});

export function PendingSyncItem({
  time,
  title,
  description,
  emoji,
  backgroundColor,
  borderColor,
  titleColor,
  bodyColor,
  showConnector = true,
}: PendingSyncItemProps) {
  return (
    <View style={styles.row}>
      <View style={styles.railColumn}>
        <Text style={styles.time}>{time}</Text>
        <View style={styles.rail}>
          <View style={styles.railSpacer} />
          <CloudSyncIcon />
          {showConnector ? <View style={styles.railLine} /> : null}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor, borderColor }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        </View>

        <Text style={[styles.description, { color: bodyColor }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}
