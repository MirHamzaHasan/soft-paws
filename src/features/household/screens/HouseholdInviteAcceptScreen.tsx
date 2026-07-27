import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { HomeShell } from '@/features/home/components/HomeShell';
import { hasPremiumAccess } from '@/features/premium/utils/premiumAccess';
import { openPremiumGate } from '@/features/premium/utils/premiumNavigation';
import { useAuthSessionStore } from '@/stores';

import { acceptHouseholdInvite } from '../api/householdClient';

type HouseholdInviteAcceptScreenProps = {
  token: string;
};

const styles = StyleSheet.create({
  stack: {
    gap: 18,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D7D3CF',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 22,
    paddingVertical: 22,
    gap: 12,
  },
  title: {
    color: '#263136',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '500',
  },
  body: {
    color: '#5F6670',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  error: {
    color: '#B02921',
  },
});

export default function HouseholdInviteAcceptScreen({
  token,
}: HouseholdInviteAcceptScreenProps) {
  const router = useRouter();
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const premiumAccess = hasPremiumAccess(barklogUser);
  const [status, setStatus] = useState<'accepted' | 'idle' | 'loading'>('idle');
  const [error, setError] = useState<string | null>(null);
  let primaryLabel = 'Unlock Household Sharing';

  if (premiumAccess) {
    primaryLabel = status === 'loading' ? 'Joining...' : 'Accept Invite';
  }

  const handleAccept = async () => {
    if (!premiumAccess) {
      openPremiumGate(router, 'household-sharing');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      await Haptics.selectionAsync();
      await acceptHouseholdInvite(token);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStatus('accepted');
    } catch (acceptError) {
      setStatus('idle');
      setError(
        acceptError instanceof Error
          ? acceptError.message
          : 'Unable to accept this household invite.',
      );
    }
  };

  return (
    <HomeShell
      activeTab="household"
      tabVariant="household"
      headerVariant="compact"
      headerTitle="Household Invite"
      headerAvatarEmoji="🏡"
      headerAvatarBackgroundColor="#1A1A1A"
      tabRoutes={{
        household: '/household',
      }}
    >
      <View style={styles.stack}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {status === 'accepted'
              ? 'You joined this BarkLog household'
              : 'Join a BarkLog household'}
          </Text>
          <Text style={styles.body}>
            Household sharing is a Premium cloud feature. Urgent safety tools,
            local logging, and manual export stay available outside this invite.
          </Text>

          {status === 'accepted' ? (
            <PrimaryButton
              label="Open Household"
              size="large"
              onPress={() => router.replace('/household')}
            />
          ) : (
            <PrimaryButton
              label={primaryLabel}
              size="large"
              onPress={() => {
                handleAccept().catch(() => undefined);
              }}
            />
          )}

          {error ? (
            <Text style={[styles.body, styles.error]}>{error}</Text>
          ) : null}
        </View>
      </View>
    </HomeShell>
  );
}
