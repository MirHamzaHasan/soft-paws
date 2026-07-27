import { StyleSheet, Text, View } from 'react-native';

type HouseholdSummaryItem = {
  label: string;
  value: string;
  detail: string;
  detailColor?: string;
};

type HouseholdSummaryGridProps = {
  date: string;
  title: string;
  items: HouseholdSummaryItem[];
};

const styles = StyleSheet.create({
  stack: {
    gap: 20,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '400',
    letterSpacing: -1.1,
  },
  date: {
    color: '#4E5660',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  grid: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D7D3CF',
    backgroundColor: '#FFFCFA',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    minHeight: 144,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 18,
    gap: 12,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#D7D3CF',
  },
  cellLastColumn: {
    borderRightWidth: 0,
  },
  cellLastRow: {
    borderBottomWidth: 0,
  },
  label: {
    color: '#4E5660',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  value: {
    color: '#0A0A0A',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '400',
  },
  detail: {
    color: '#5E6670',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
});

export function HouseholdSummaryGrid({
  date,
  title,
  items,
}: HouseholdSummaryGridProps) {
  const rows = [
    { key: 'top', items: items.slice(0, 2) },
    { key: 'bottom', items: items.slice(2, 4) },
  ];

  return (
    <View style={styles.stack}>
      <View style={styles.headingRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>

      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={row.key} style={styles.row}>
            {row.items.map((item, itemIndex) => (
              <View
                key={item.label}
                style={[
                  styles.cell,
                  itemIndex === row.items.length - 1
                    ? styles.cellLastColumn
                    : null,
                  rowIndex === rows.length - 1 ? styles.cellLastRow : null,
                ]}
              >
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.value}>{item.value}</Text>
                <Text
                  style={[
                    styles.detail,
                    item.detailColor ? { color: item.detailColor } : null,
                  ]}
                >
                  {item.detail}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
