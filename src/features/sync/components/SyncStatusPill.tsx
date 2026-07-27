import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  CloudSyncIcon,
  OfflineIcon,
  WarningIcon,
} from '@/features/home/components/HomeIcons';
import { SkeletonBlock } from '@/features/states/components/SkeletonBlock';

import type { SyncDisplayContent } from '../utils/syncDisplay';

type SyncStatusPillProps = {
  display: SyncDisplayContent;
  loading?: boolean;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  pill: {
    minHeight: 64,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  title: {
    color: '#1F2528',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  body: {
    color: '#687079',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
});

function getPillColors(display: SyncDisplayContent) {
  if (display.tone === 'premium') {
    return {
      backgroundColor: '#F3F0FB',
      borderColor: '#E2DCEF',
      iconBackgroundColor: '#E7E1FA',
      iconColor: '#534AB7',
    };
  }

  if (display.tone === 'warning') {
    return {
      backgroundColor: '#FFF7E7',
      borderColor: '#EEDCB4',
      iconBackgroundColor: '#F8E6BF',
      iconColor: '#8F6110',
    };
  }

  return {
    backgroundColor: '#F5F5F4',
    borderColor: '#E7E5E4',
    iconBackgroundColor: '#ECE9E5',
    iconColor: '#596169',
  };
}

function SyncStatusIcon({
  display,
  color,
}: {
  color: string;
  display: SyncDisplayContent;
}) {
  if (display.tone === 'warning') {
    return <WarningIcon color={color} size={18} />;
  }

  if (display.tone === 'premium') {
    return <CloudSyncIcon color={color} size={20} />;
  }

  return <OfflineIcon color={color} size={20} />;
}

export function SyncStatusPill({
  display,
  loading = false,
  onPress,
}: SyncStatusPillProps) {
  const colors = getPillColors(display);
  const content = loading ? (
    <>
      <SkeletonBlock width={36} height={36} borderRadius={18} />
      <View style={styles.copy}>
        <SkeletonBlock width="48%" height={16} borderRadius={8} />
        <SkeletonBlock width="76%" height={14} borderRadius={7} />
      </View>
    </>
  ) : (
    <>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: colors.iconBackgroundColor },
        ]}
      >
        <SyncStatusIcon display={display} color={colors.iconColor} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{display.compactTitle}</Text>
        <Text style={styles.body}>{display.compactBody}</Text>
      </View>
    </>
  );

  return (
    <Pressable
      accessibilityLabel={display.accessibilityLabel}
      accessibilityRole="button"
      disabled={!onPress}
      style={[
        styles.pill,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        },
      ]}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}
