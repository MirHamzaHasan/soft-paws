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
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E4E0DC',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  amount: {
    color: '#0A0A0A',
    fontSize: 18,
    lineHeight: 24,
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
