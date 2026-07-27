import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BarklogStatusBanner, useBarklogFeedback } from '@/components/ui';
import { listLocalEventsForDog, syncBarklogData } from '@/db';
import { shareTextDocument } from '@/features/export/services/exportDocumentService';
import { buildEventsCsv } from '@/features/export/utils/exportBuilders';
import {
  CloudSyncIcon,
  OfflineIcon,
  WarningIcon,
} from '@/features/home/components/HomeIcons';
import { LogDetailLayout } from '@/features/logging/components/LogDetailLayout';
import { captureBarklogError } from '@/features/observability';
import { openPremiumGate } from '@/features/premium/utils/premiumNavigation';
import { SkeletonBlock } from '@/features/states/components/SkeletonBlock';
import HapticManager from '@/managers/HapticManager';
import { getSelectedDog, useAuthSessionStore } from '@/stores';
import { getBarklogErrorMessage } from '@/utils/barklogErrorMessages';

import { useSyncDisplayStatus } from '../hooks/useSyncDisplayStatus';
import type { SyncDisplayContent } from '../utils/syncDisplay';

const styles = StyleSheet.create({
  stack: {
    gap: 22,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '400',
    letterSpacing: -1.1,
  },
  body: {
    color: '#5F6670',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  statusCard: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 22,
    paddingVertical: 22,
    gap: 18,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    flex: 1,
    color: '#0A0A0A',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '500',
  },
  actionStack: {
    gap: 10,
  },
  actionButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryButton: {
    backgroundColor: '#0A0A0A',
  },
  secondaryButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D8D3CF',
    backgroundColor: '#FFFCFA',
  },
  primaryButtonText: {
    color: '#FAFAFA',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  secondaryButtonText: {
    color: '#1F2528',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  sectionCard: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E4E0DC',
    backgroundColor: '#FFFCFA',
    overflow: 'hidden',
  },
  row: {
    minHeight: 84,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E2DC',
  },
  rowCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  rowTitle: {
    color: '#1F2528',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
  },
  rowBody: {
    color: '#687079',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  message: {
    color: '#687079',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  messageWarning: {
    color: '#8F6110',
  },
});

function getStatusColors(display: SyncDisplayContent) {
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

function StatusIcon({
  color,
  display,
}: {
  color: string;
  display: SyncDisplayContent;
}) {
  if (display.tone === 'warning') {
    return <WarningIcon color={color} size={22} />;
  }

  if (display.tone === 'premium') {
    return <CloudSyncIcon color={color} size={24} />;
  }

  return <OfflineIcon color={color} size={24} />;
}

function getSyncMessageTitle(
  tone: 'danger' | 'default' | 'success' | 'warning',
) {
  if (tone === 'danger') {
    return 'Action unavailable';
  }

  if (tone === 'warning') {
    return 'Action needs attention';
  }

  if (tone === 'success') {
    return 'Backup updated';
  }

  return 'Backup note';
}

function ActionButton({
  disabled,
  label,
  onPress,
  variant = 'primary',
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={[
        styles.actionButton,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        disabled ? { opacity: 0.5 } : null,
      ]}
      onPress={onPress}
    >
      <Text
        style={
          variant === 'primary'
            ? styles.primaryButtonText
            : styles.secondaryButtonText
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SyncInfoRow({
  body,
  icon,
  onPress,
  showDivider = false,
  title,
}: {
  body: string;
  icon: ReactNode;
  onPress?: () => void;
  showDivider?: boolean;
  title: string;
}) {
  const content = (
    <View style={[styles.row, showDivider ? styles.divider : null]}>
      {icon}
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowBody}>{body}</Text>
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
}

export default function SyncBackupScreen() {
  const router = useRouter();
  const dogs = useAuthSessionStore((state) => state.dogs);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const { capability, display, isLoading, refresh, snapshot } =
    useSyncDisplayStatus();
  const [actionState, setActionState] = useState<
    'exporting' | 'idle' | 'restoring' | 'syncing'
  >('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<
    'danger' | 'default' | 'success' | 'warning'
  >('default');
  const feedback = useBarklogFeedback();
  const colors = getStatusColors(display);
  const canUseCloud = capability.canPullFromCloud && capability.canPushToCloud;
  const restoreBody = canUseCloud
    ? 'Pull the latest cloud copy onto this device.'
    : 'Premium keeps a cloud copy ready when you need a new device.';
  const restoreUnavailableBody =
    'Available after your first successful cloud sync.';

  const openCloudGate = async () => {
    await HapticManager.light();
    openPremiumGate(router, 'cloud-sync');
  };

  const handleSyncNow = async () => {
    if (!canUseCloud) {
      await openCloudGate();
      return;
    }

    setActionState('syncing');
    setMessage(null);
    setMessageTone('default');
    await HapticManager.light();

    try {
      const result = await syncBarklogData({
        capability,
        force: true,
        trigger: 'manual',
      });

      await refresh();

      if (result.ok) {
        const successMessage = result.skipped
          ? result.message
          : 'Backup and sync updated for this device.';

        await HapticManager.success();
        setMessage(null);
        feedback.showSuccess({
          title: 'Sync updated',
          description: successMessage,
        });
      } else {
        const retryMessage =
          'Sync needs a retry. Your logs are still saved on this device.';

        await HapticManager.warning();
        setMessage(retryMessage);
        setMessageTone('warning');
      }
    } catch (syncError) {
      const safeMessage = getBarklogErrorMessage(syncError, {
        domain: 'sync',
      });

      setMessage(safeMessage);
      setMessageTone('danger');
      captureBarklogError(syncError, {
        source: 'sync_backup.manual_sync',
      });
      await HapticManager.error();
    } finally {
      setActionState('idle');
    }
  };

  const handleRestore = async () => {
    if (!canUseCloud) {
      await openCloudGate();
      return;
    }

    setActionState('restoring');
    setMessage(null);
    setMessageTone('default');
    await HapticManager.light();

    try {
      const result = await syncBarklogData({
        capability,
        force: true,
        trigger: 'manual',
      });

      await refresh();

      if (result.ok) {
        const successMessage =
          'Restore check complete. This device is using the latest cloud sync available.';

        await HapticManager.success();
        setMessage(null);
        feedback.showSuccess({
          title: 'Restore checked',
          description: successMessage,
        });
      } else {
        const retryMessage =
          'Restore needs a retry. Local BarkLog data remains available.';

        await HapticManager.warning();
        setMessage(retryMessage);
        setMessageTone('warning');
      }
    } catch (restoreError) {
      const safeMessage = getBarklogErrorMessage(restoreError, {
        domain: 'sync',
        fallback: 'Unable to check cloud restore right now.',
      });

      setMessage(safeMessage);
      setMessageTone('danger');
      captureBarklogError(restoreError, {
        source: 'sync_backup.restore_check',
      });
      await HapticManager.error();
    } finally {
      setActionState('idle');
    }
  };

  const handleExport = async () => {
    if (!selectedDog) {
      const warningMessage = 'Add a dog before exporting data.';

      setMessage(warningMessage);
      setMessageTone('warning');
      await HapticManager.warning();
      return;
    }

    setActionState('exporting');
    setMessage(null);
    setMessageTone('default');
    await HapticManager.light();

    try {
      const events = await listLocalEventsForDog(selectedDog.id);
      const exportMessage = await shareTextDocument({
        content: buildEventsCsv({ dog: selectedDog, events }),
        fileName: `${selectedDog.name}-barklog-events.csv`,
        mimeType: 'text/csv',
        title: `${selectedDog.name} BarkLog CSV export`,
        uti: 'public.comma-separated-values-text',
      });

      await HapticManager.success();
      setMessage(null);
      feedback.showSuccess({
        title: 'Export ready',
        description: exportMessage,
      });
    } catch (exportError) {
      const safeMessage = getBarklogErrorMessage(exportError, {
        domain: 'export',
      });

      await HapticManager.error();
      setMessage(safeMessage);
      setMessageTone('danger');
      captureBarklogError(exportError, {
        source: 'sync_backup.csv_export',
      });
    }

    setActionState('idle');
  };

  return (
    <LogDetailLayout
      title="Backup"
      headerVariant="brand"
      onBackPress={() => router.back()}
    >
      <View style={styles.stack}>
        <View style={styles.stack}>
          <Text style={styles.title}>Sync and Backup</Text>
          <Text style={styles.body}>
            BarkLog always saves logs locally first. Premium adds cloud backup,
            restore, and cross-device sync.
          </Text>
        </View>

        <View
          accessibilityLabel={display.accessibilityLabel}
          style={[
            styles.statusCard,
            {
              backgroundColor: colors.backgroundColor,
              borderColor: colors.borderColor,
            },
          ]}
        >
          {isLoading ? (
            <>
              <View style={styles.statusHeader}>
                <SkeletonBlock width={48} height={48} borderRadius={24} />
                <SkeletonBlock width="56%" height={26} borderRadius={12} />
              </View>
              <SkeletonBlock width="92%" height={18} borderRadius={9} />
              <SkeletonBlock width="78%" height={18} borderRadius={9} />
            </>
          ) : (
            <>
              <View style={styles.statusHeader}>
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: colors.iconBackgroundColor },
                  ]}
                >
                  <StatusIcon display={display} color={colors.iconColor} />
                </View>
                <Text style={styles.statusTitle}>{display.title}</Text>
              </View>
              <Text style={styles.body}>{display.body}</Text>
            </>
          )}

          <View style={styles.actionStack}>
            <ActionButton
              disabled={isLoading || actionState !== 'idle'}
              label={
                canUseCloud
                  ? display.primaryActionLabel
                  : 'Upgrade for backup and sync'
              }
              onPress={() => {
                handleSyncNow().catch(() => {
                  setActionState('idle');
                  setMessageTone('danger');
                  setMessage('Unable to update sync right now.');
                });
              }}
            />
            <ActionButton
              disabled={actionState !== 'idle'}
              label="Export your data anytime"
              variant="secondary"
              onPress={() => {
                handleExport().catch(() => {
                  setActionState('idle');
                  setMessageTone('danger');
                  setMessage('Unable to export BarkLog data right now.');
                });
              }}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <SyncInfoRow
            body={
              canUseCloud && !snapshot?.lastSyncFinishedAt
                ? restoreUnavailableBody
                : restoreBody
            }
            icon={
              canUseCloud ? (
                <CloudSyncIcon color="#534AB7" size={24} />
              ) : (
                <OfflineIcon color="#596169" size={24} />
              )
            }
            showDivider
            title="Restore from cloud"
            onPress={() => {
              handleRestore().catch(() => {
                setActionState('idle');
                setMessageTone('danger');
                setMessage('Unable to check cloud restore right now.');
              });
            }}
          />
          <SyncInfoRow
            body={
              canUseCloud
                ? 'This signed-in device can back up and pull BarkLog updates.'
                : 'Upgrade to use BarkLog across signed-in devices.'
            }
            icon={
              canUseCloud ? (
                <CloudSyncIcon color="#534AB7" size={24} />
              ) : (
                <OfflineIcon color="#596169" size={24} />
              )
            }
            title="Connected devices"
            onPress={() => {
              if (!canUseCloud) {
                openCloudGate().catch(() => undefined);
                return;
              }

              setMessage(
                'Connected device management will use the same Premium backup and sync access.',
              );
              setMessageTone('default');
            }}
          />
        </View>

        {message ? (
          <View accessibilityLiveRegion="polite">
            <BarklogStatusBanner
              tone={messageTone}
              title={getSyncMessageTitle(messageTone)}
              description={message}
            />
          </View>
        ) : null}
      </View>
    </LogDetailLayout>
  );
}
