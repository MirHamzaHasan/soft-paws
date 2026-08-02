import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '../../home/components/HomeIcons';

type SettingsRowProps = {
  title: string;
  subtitle?: string;
  value?: string;
  leading: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  showDivider?: boolean;
};

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E3DFDB',
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  title: {
    color: '#1F2528',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  subtitle: {
    color: '#7A828A',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  },
  value: {
    color: '#7A828A',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  },
});

export function SettingsRow({
  title,
  subtitle,
  value,
  leading,
  trailing,
  onPress,
  showDivider = false,
}: SettingsRowProps) {
  const content = (
    <View style={[styles.row, showDivider ? styles.divider : null]}>
      {leading}
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {trailing ?? <ChevronRightIcon />}
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}
