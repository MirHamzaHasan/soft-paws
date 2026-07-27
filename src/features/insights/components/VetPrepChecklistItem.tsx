import { StyleSheet, Text, View } from 'react-native';

type VetPrepChecklistItemProps = {
  label: string;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  box: {
    width: 18,
    height: 18,
    marginTop: 3,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C8C4C0',
    backgroundColor: '#FFFCFA',
  },
  label: {
    flex: 1,
    color: '#1F2528',
    fontSize: 17,
    lineHeight: 30,
    fontWeight: '400',
  },
});

export function VetPrepChecklistItem({ label }: VetPrepChecklistItemProps) {
  return (
    <View style={styles.row}>
      <View style={styles.box} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
