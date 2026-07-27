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
    minHeight: 140,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E7E5E4',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: 10,
    minWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
    flex: 1,
    minWidth: 0,
  },
  description: {
    color: '#5F6670',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
  },
  compactDescription: {
    fontSize: 15,
    lineHeight: 24,
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
