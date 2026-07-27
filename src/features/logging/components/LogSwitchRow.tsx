import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ToggleSwitch } from '../../../components/ui/ToggleSwitch';

type LogSwitchRowProps = {
  label: string;
  value: boolean;
  onToggle: () => void;
  checkedTrackColor?: string;
  uncheckedTrackColor?: string;
  labelColor?: string;
  leading?: ReactNode;
  divider?: boolean;
  dividerColor?: string;
};

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  row: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  label: {
    flex: 1,
    color: '#263136',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2DDD8',
  },
});

export function LogSwitchRow({
  label,
  value,
  onToggle,
  checkedTrackColor = '#0A0A0A',
  uncheckedTrackColor = '#DDE4E8',
  labelColor = '#263136',
  leading,
  divider = false,
  dividerColor = '#E2DDD8',
}: LogSwitchRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.copy}>
          {leading}
          <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        </View>

        <ToggleSwitch
          checked={value}
          checkedTrackColor={checkedTrackColor}
          uncheckedTrackColor={uncheckedTrackColor}
          onPress={onToggle}
        />
      </View>

      {divider ? (
        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
      ) : null}
    </View>
  );
}
