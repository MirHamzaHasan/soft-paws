import { type ReactNode } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ToggleSwitch } from '../../../components/ui/ToggleSwitch';

type PermissionToggleCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  enabled: boolean;
  onToggle: () => void;
};

const styles = StyleSheet.create({
  card: {
    minHeight: 104,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E7E5E4',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
    flex: 1,
    minWidth: 0,
  },
  description: {
    color: '#5F6670',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  compactDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
});

export function PermissionToggleCard({
  title,
  description,
  icon,
  enabled,
  onToggle,
}: PermissionToggleCardProps) {
  const { width } = useWindowDimensions();
  const compact = width < 390;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>{icon}</View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>

            <ToggleSwitch checked={enabled} onPress={onToggle} />
          </View>

          <Text
            style={[
              styles.description,
              compact ? styles.compactDescription : null,
            ]}
          >
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
}
