import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type PhotoJournalTileProps = {
  dateLabel: string;
  backgroundColor: string;
  labelColor?: string;
  artwork?: ReactNode;
};

const styles = StyleSheet.create({
  tile: {
    aspectRatio: 1,
    borderRadius: 0,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: 8,
  },
  date: {
    color: '#FFFCFA',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '500',
  },
  artworkWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function PhotoJournalTile({
  dateLabel,
  backgroundColor,
  labelColor = '#FFFCFA',
  artwork,
}: PhotoJournalTileProps) {
  return (
    <View style={[styles.tile, { backgroundColor }]}>
      <View style={styles.artworkWrap}>{artwork}</View>
      <Text style={[styles.date, { color: labelColor }]}>{dateLabel}</Text>
    </View>
  );
}
