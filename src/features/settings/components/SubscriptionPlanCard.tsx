import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '../../home/components/HomeIcons';

type SubscriptionPlanCardProps = {
  title: string;
  status: string;
  subtitle: string;
  renewalLabel: string;
  renewalDate: string;
  price: string;
  onManagePress: () => void;
  leadingBadge?: ReactNode;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0DBD5',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
    gap: 24,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '400',
    letterSpacing: -0.9,
  },
  subtitle: {
    color: '#5D656D',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  statusPill: {
    alignSelf: 'flex-start',
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: '#EEF1F2',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: '#4D565E',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  meta: {
    gap: 8,
  },
  renewalLabel: {
    color: '#5D656D',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  renewalDate: {
    color: '#0A0A0A',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '400',
  },
  price: {
    color: '#5D656D',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E3DFDB',
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  manageText: {
    color: '#0A0A0A',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
});

export function SubscriptionPlanCard({
  title,
  status,
  subtitle,
  renewalLabel,
  renewalDate,
  price,
  onManagePress,
  leadingBadge,
}: SubscriptionPlanCardProps) {
  return (
    <View style={styles.card}>
      <View style={{ gap: 12 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {leadingBadge ?? (
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      )}

      <View style={styles.meta}>
        <Text style={styles.renewalLabel}>{renewalLabel}</Text>
        <Text style={styles.renewalDate}>{renewalDate}</Text>
        <Text style={styles.price}>{price}</Text>
      </View>

      <View style={styles.divider} />

      <Pressable
        accessibilityRole="button"
        style={styles.manageRow}
        onPress={onManagePress}
      >
        <Text style={styles.manageText}>Manage subscription</Text>
        <ChevronRightIcon color="#0A0A0A" size={22} />
      </Pressable>
    </View>
  );
}
