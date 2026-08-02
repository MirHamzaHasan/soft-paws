import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type LedgerTransactionRowProps = {
  icon: ReactNode;
  iconBackgroundColor: string;
  iconBorderColor: string;
  title: string;
  meta: string;
  amount: string;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E4E0DC',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  meta: {
    color: '#626A73',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  },
  amount: {
    color: '#0A0A0A',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
});

export function LedgerTransactionRow({
  icon,
  iconBackgroundColor,
  iconBorderColor,
  title,
  meta,
  amount,
}: LedgerTransactionRowProps) {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: iconBackgroundColor,
            borderColor: iconBorderColor,
          },
        ]}
      >
        {icon}
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>

      <Text style={styles.amount}>{amount}</Text>
    </View>
  );
}
