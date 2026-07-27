import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { BarklogDogRow } from '@/api/auth';
import {
  type BarklogEventType,
  createLocalEvent,
  type EventModel,
  listLocalEventsForDogDate,
} from '@/db';
import { formatDogMeta, getDogAvatar } from '@/features/dogs/utils/dogDisplay';
import { getSelectedDog, useAuthSessionStore } from '@/stores';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { HomeShell } from '../../home/components/HomeShell';
import { hasPremiumAccess } from '../../premium/utils/premiumAccess';
import { openPremiumGate } from '../../premium/utils/premiumNavigation';
import {
  createCareHandoff,
  createHousehold,
  createHouseholdInvite,
  getSitterInviteExpiresAt,
  type HouseholdMemberRow,
  type HouseholdOverviewData,
  leaveHousehold,
  listHouseholdOverview,
  removeHouseholdMember,
  revokeHouseholdInvite,
} from '../api/householdClient';
import { HouseholdAttentionCard } from '../components/HouseholdAttentionCard';
import { HouseholdCompanionCard } from '../components/HouseholdCompanionCard';
import { HouseholdMiniTag } from '../components/HouseholdMiniTag';
import { HouseholdStatusPill } from '../components/HouseholdStatusPill';
import { HouseholdSummaryGrid } from '../components/HouseholdSummaryGrid';
import {
  canMemberPerform,
  getDefaultHouseholdPermissions,
  getHouseholdRoleLabel,
  type HouseholdPermission,
  type HouseholdRole,
} from '../utils/householdPermissions';

const styles = StyleSheet.create({
  stack: {
    gap: 24,
  },
  statusCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D7D3CF',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 22,
    paddingVertical: 22,
    gap: 12,
  },
  statusTitle: {
    color: '#263136',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500',
  },
  statusBody: {
    color: '#5F6670',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  sectionHeader: {
    color: '#263136',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  inlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rolePill: {
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D7D3CF',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  rolePillActive: {
    borderColor: '#0A0A0A',
    backgroundColor: '#0A0A0A',
  },
  rolePillText: {
    color: '#263136',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  rolePillTextActive: {
    color: '#FFFCFA',
  },
  input: {
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D7D3CF',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#263136',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  memberRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E1DDD8',
    paddingTop: 12,
    gap: 8,
  },
  memberTitle: {
    color: '#263136',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  memberMeta: {
    color: '#5F6670',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  textButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  textButtonLabel: {
    color: '#0A0A0A',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  dangerText: {
    color: '#B02921',
  },
});

type DogEventsById = Record<string, EventModel[]>;

const QUICK_ACTIONS: { icon: string; label: string; type: BarklogEventType }[] =
  [
    { icon: '💧', label: 'Pee', type: 'pee' },
    { icon: '🐾', label: 'Poop', type: 'poop' },
    { icon: '🍴', label: 'Meal', type: 'meal' },
    { icon: '🚶', label: 'Walk', type: 'walk' },
  ];

const INVITE_ROLES: Exclude<HouseholdRole, 'owner'>[] = [
  'caregiver',
  'sitter',
  'viewer',
];

const HOUSEHOLD_PERMISSION_VALUES: HouseholdPermission[] = [
  'view_logs',
  'create_logs',
  'edit_own_logs',
  'manage_medications',
  'view_reports',
  'manage_members',
];

function getStartOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

function getTodayLabel() {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());
}

function countEvents(events: EventModel[], type: BarklogEventType) {
  return events.filter((event) => event.type === type).length;
}

function getLatestEvent(events: EventModel[], type: BarklogEventType) {
  return events.find((event) => event.type === type) ?? null;
}

function formatEventAge(event: EventModel | null) {
  if (!event) {
    return 'Not logged today';
  }

  const minutesAgo = Math.max(
    0,
    Math.round((Date.now() - event.occurredAt) / (60 * 1000)),
  );

  if (minutesAgo < 1) {
    return 'Just now';
  }

  if (minutesAgo < 60) {
    return `${minutesAgo}m ago`;
  }

  return `${Math.round(minutesAgo / 60)}h ago`;
}

function getDogEventCounts(eventsByDog: DogEventsById, dog: BarklogDogRow) {
  const events = eventsByDog[dog.id] ?? [];

  return {
    meal: countEvents(events, 'meal'),
    medication: countEvents(events, 'medication'),
    pee: countEvents(events, 'pee'),
    poop: countEvents(events, 'poop'),
    symptom: countEvents(events, 'symptom'),
    walk: countEvents(events, 'walk'),
  };
}

function normalizeHouseholdPermissions(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is HouseholdPermission => {
    return (
      typeof entry === 'string' &&
      HOUSEHOLD_PERMISSION_VALUES.includes(entry as HouseholdPermission)
    );
  });
}

function getMemberPermissionState(
  member: HouseholdMemberRow | null | undefined,
) {
  if (!member) {
    return null;
  }

  return {
    permissions: normalizeHouseholdPermissions(member.permissions),
    role: member.role,
    sitter_expires_at: member.sitter_expires_at,
  };
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'No expiration';
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(value));
}

export default function HouseholdOverviewScreen() {
  const router = useRouter();
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const dogs = useAuthSessionStore((state) => state.dogs);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const setSelectedDogId = useAuthSessionStore(
    (state) => state.setSelectedDogId,
  );
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const premiumAccess = hasPremiumAccess(barklogUser);
  const [eventsByDog, setEventsByDog] = useState<DogEventsById>({});
  const [error, setError] = useState<string | null>(null);
  const [sharingData, setSharingData] = useState<HouseholdOverviewData | null>(
    null,
  );
  const [sharingLoading, setSharingLoading] = useState(false);
  const [sharingError, setSharingError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] =
    useState<Exclude<HouseholdRole, 'owner'>>('caregiver');
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [handoffNote, setHandoffNote] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const startOfToday = getStartOfToday();

  const loadHouseholdEvents = useCallback(() => {
    let isMounted = true;

    if (dogs.length === 0) {
      setEventsByDog({});
      setError(null);

      return () => {
        isMounted = false;
      };
    }

    Promise.all(
      dogs.map(async (dog) => {
        const events = await listLocalEventsForDogDate({
          dogId: dog.id,
          endAt: startOfToday + 24 * 60 * 60 * 1000,
          startAt: startOfToday,
        });

        return [dog.id, events] as const;
      }),
    )
      .then((entries) => {
        if (isMounted) {
          setEventsByDog(Object.fromEntries(entries));
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Unable to load household events from this device.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dogs, startOfToday]);

  useFocusEffect(loadHouseholdEvents);

  const loadHouseholdSharing = useCallback(() => {
    let isMounted = true;

    if (!premiumAccess || !barklogUser?.id) {
      setSharingData(null);
      setSharingError(null);
      setSharingLoading(false);

      return () => {
        isMounted = false;
      };
    }

    setSharingLoading(true);
    listHouseholdOverview(barklogUser.id)
      .then((data) => {
        if (isMounted) {
          setSharingData(data);
          setSharingError(null);
        }
      })
      .catch((sharingLoadError) => {
        if (isMounted) {
          setSharingError(
            sharingLoadError instanceof Error
              ? sharingLoadError.message
              : 'Unable to load household sharing.',
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setSharingLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [barklogUser?.id, premiumAccess]);

  useFocusEffect(loadHouseholdSharing);

  const primaryHousehold = sharingData?.households[0] ?? null;
  const householdDogs = useMemo(() => {
    if (!primaryHousehold || !sharingData) {
      return [];
    }

    const dogIds = new Set(
      sharingData.householdDogs
        .filter((entry) => entry.household_id === primaryHousehold.id)
        .map((entry) => entry.dog_id),
    );

    return sharingData.dogs.filter((dog) => dogIds.has(dog.id));
  }, [primaryHousehold, sharingData]);
  const currentMember = sharingData?.memberships.find((member) => {
    return (
      member.user_id === barklogUser?.id &&
      member.household_id === primaryHousehold?.id
    );
  });
  const currentPermissionState = getMemberPermissionState(currentMember);
  const canManageMembers = canMemberPerform(
    currentPermissionState,
    'manage_members',
  );
  const canCreateHandoffs = canMemberPerform(
    currentPermissionState,
    'create_logs',
  );

  const handleQuickLog = async (dog: BarklogDogRow, type: BarklogEventType) => {
    if (!barklogUser?.id) {
      setError('Sign in before logging household events.');
      return;
    }

    setSelectedDogId(dog.id);
    setError(null);

    try {
      await createLocalEvent({
        details: type === 'poop' ? { color: 'brown', quality: 'normal' } : {},
        dogId: dog.id,
        notes: null,
        occurredAt: Date.now(),
        source: 'instant',
        synced: false,
        type,
        userId: barklogUser.id,
      });

      loadHouseholdEvents();
    } catch (quickLogError) {
      setError(
        quickLogError instanceof Error
          ? quickLogError.message
          : 'Unable to save this household event.',
      );
    }
  };

  const handleCreateHousehold = async () => {
    if (!barklogUser) {
      setSharingError('Sign in before creating a household.');
      return;
    }

    if (!premiumAccess) {
      openPremiumGate(router, 'household-sharing');
      return;
    }

    setSharingError(null);
    setActionMessage(null);

    try {
      await Haptics.selectionAsync();
      await createHousehold({
        dogs,
        name: `${selectedDog?.name ?? 'BarkLog'} Household`,
        user: barklogUser,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setActionMessage('Household created. Invite a caregiver when ready.');
      loadHouseholdSharing();
    } catch (createError) {
      setSharingError(
        createError instanceof Error
          ? createError.message
          : 'Unable to create a household.',
      );
    }
  };

  const handleCreateInvite = async () => {
    if (!barklogUser?.id || !primaryHousehold) {
      setSharingError('Create a household before inviting caregivers.');
      return;
    }

    if (!canManageMembers) {
      setSharingError('Only household managers can invite caregivers.');
      return;
    }

    if (!inviteEmail.trim()) {
      setSharingError('Add an email address for the invite.');
      return;
    }

    setSharingError(null);
    setActionMessage(null);

    try {
      await Haptics.selectionAsync();
      const invite = await createHouseholdInvite({
        dogIds: householdDogs.map((dog) => dog.id),
        email: inviteEmail,
        householdId: primaryHousehold.id,
        inviterUserId: barklogUser.id,
        role: inviteRole,
      });
      setInviteEmail('');
      setLastInviteUrl(invite.url);
      setActionMessage(
        inviteRole === 'sitter'
          ? `Sitter invite created. Accepted sitter access lasts until ${formatDateTime(
              getSitterInviteExpiresAt(),
            )}.`
          : 'Household invite created.',
      );
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Share.share({
        message: invite.url,
      });
      loadHouseholdSharing();
    } catch (inviteError) {
      setSharingError(
        inviteError instanceof Error
          ? inviteError.message
          : 'Unable to create this invite.',
      );
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    setSharingError(null);

    try {
      await Haptics.selectionAsync();
      await revokeHouseholdInvite(inviteId);
      setActionMessage('Invite revoked.');
      loadHouseholdSharing();
    } catch (revokeError) {
      setSharingError(
        revokeError instanceof Error
          ? revokeError.message
          : 'Unable to revoke this invite.',
      );
    }
  };

  const handleRemoveMember = async (member: HouseholdMemberRow) => {
    if (member.user_id === barklogUser?.id) {
      await leaveHousehold(member.id);
      setActionMessage('You left this household.');
      loadHouseholdSharing();
      return;
    }

    setSharingError(null);

    try {
      await Haptics.selectionAsync();
      await removeHouseholdMember(member.id);
      setActionMessage('Household member removed.');
      loadHouseholdSharing();
    } catch (removeError) {
      setSharingError(
        removeError instanceof Error
          ? removeError.message
          : 'Unable to remove this household member.',
      );
    }
  };

  const handleCreateHandoff = async () => {
    const handoffDog = householdDogs[0];

    if (!barklogUser?.id || !primaryHousehold || !handoffDog) {
      setSharingError('Add a shared dog before saving a care handoff.');
      return;
    }

    if (!canCreateHandoffs) {
      setSharingError('Your household role cannot create care handoffs.');
      return;
    }

    if (!handoffNote.trim()) {
      setSharingError('Write a short handoff note first.');
      return;
    }

    setSharingError(null);

    try {
      await Haptics.selectionAsync();
      await createCareHandoff({
        authorUserId: barklogUser.id,
        dogId: handoffDog.id,
        householdId: primaryHousehold.id,
        note: handoffNote,
      });
      setHandoffNote('');
      setActionMessage('Care handoff saved.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      loadHouseholdSharing();
    } catch (handoffError) {
      setSharingError(
        handoffError instanceof Error
          ? handoffError.message
          : 'Unable to save this care handoff.',
      );
    }
  };

  const allEvents = dogs.flatMap((dog) => eventsByDog[dog.id] ?? []);
  const mealCount = countEvents(allEvents, 'meal');
  const walkCount = countEvents(allEvents, 'walk');
  const medicationCount = countEvents(allEvents, 'medication');
  const symptomCount = countEvents(allEvents, 'symptom');
  const expectedMealCount = dogs.length * 2;
  let mealDetail = 'Meals still open';

  if (dogs.length === 0) {
    mealDetail = 'Add a dog to begin';
  } else if (mealCount >= expectedMealCount) {
    mealDetail = 'All planned meals logged';
  }

  const attentionItems = [
    ...(symptomCount > 0
      ? [
          {
            color: '#A73A33',
            detail: `${symptomCount} symptom log${
              symptomCount === 1 ? '' : 's'
            } recorded today.`,
            title: 'Review symptom notes before the next care handoff.',
          },
        ]
      : []),
    ...(dogs.length > 0 && mealCount < dogs.length
      ? [
          {
            color: '#8B6509',
            detail: `${mealCount}/${expectedMealCount} planned meal logs are in today.`,
            title: 'Some household meals are not logged yet.',
          },
        ]
      : []),
    ...(dogs.length > 1 && !premiumAccess
      ? [
          {
            color: '#5E6670',
            detail:
              'Free BarkLog keeps one active dog profile. Premium unlocks new multi-dog profiles.',
            title: 'Adding more dogs is a Premium feature.',
          },
        ]
      : []),
  ];

  return (
    <HomeShell
      activeTab="household"
      tabVariant="household"
      headerVariant="compact"
      headerTitle="The Living Archive"
      headerAvatarEmoji="🐶"
      headerAvatarBackgroundColor="#1A1A1A"
      tabRoutes={{
        household: '/household',
      }}
    >
      <View style={styles.stack}>
        <HouseholdSummaryGrid
          title="Today's Ledger"
          date={getTodayLabel()}
          items={[
            {
              label: 'Total Walks',
              value: `${walkCount}`,
              detail: `${dogs.length} dog${dogs.length === 1 ? '' : 's'} in household`,
            },
            {
              label: 'Meals Served',
              value: `${mealCount}/${expectedMealCount}`,
              detail: mealDetail,
            },
            {
              label: 'Meds Administered',
              value: `${medicationCount}`,
              detail: 'Medication logs today',
            },
            {
              label: 'Incidents',
              value: `${symptomCount}`,
              detail: symptomCount > 0 ? 'Review symptoms' : 'Quiet day',
              detailColor: symptomCount > 0 ? '#B03A32' : undefined,
            },
          ]}
        />

        {dogs.length === 0 ? (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Start with one profile</Text>
            <Text style={styles.statusBody}>
              Add a dog before BarkLog can build a household ledger.
            </Text>
            <PrimaryButton
              label="Add Dog"
              size="large"
              onPress={() => router.push('/add-dog')}
            />
          </View>
        ) : null}

        {dogs.map((dog, index) => {
          const events = eventsByDog[dog.id] ?? [];
          const counts = getDogEventCounts(eventsByDog, dog);
          const avatar = getDogAvatar(dog, index);
          const latestWalk = getLatestEvent(events, 'walk');
          const selected = dog.id === selectedDog?.id;

          return (
            <HouseholdCompanionCard
              key={dog.id}
              name={dog.name}
              meta={formatDogMeta(dog)}
              avatarEmoji={avatar.emoji}
              avatarBackgroundColor={avatar.backgroundColor}
              status={
                <HouseholdStatusPill
                  label={selected ? 'Active' : 'Ready'}
                  tone={selected ? 'due' : 'good'}
                />
              }
              lastLabel="Last Walk"
              lastValue={formatEventAge(latestWalk)}
              nextLabel="Today"
              nextValue={`${events.length} total logs`}
              tags={[
                <HouseholdMiniTag
                  key="walk"
                  label={`${counts.walk} Walks`}
                  tone="walk"
                />,
                <HouseholdMiniTag
                  key="meal"
                  label={`${counts.meal} Meals`}
                  tone="meal"
                />,
                <HouseholdMiniTag
                  key="poop"
                  label={`${counts.poop} Poops`}
                  tone="poop"
                />,
                <HouseholdMiniTag
                  key="pee"
                  label={`${counts.pee} Pees`}
                  tone="pee"
                />,
              ]}
              actions={QUICK_ACTIONS.map((action) => ({
                ...action,
                onPress: () => {
                  handleQuickLog(dog, action.type).catch(() => undefined);
                },
              }))}
              selected={selected}
              onPress={() => setSelectedDogId(dog.id)}
            />
          );
        })}

        {dogs.length >= 1 ? (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Add another dog</Text>
            <Text style={styles.statusBody}>
              Keep each dog&apos;s logs, medications, profile, and insights
              separate. Adding more dog profiles requires Premium.
            </Text>
            <PrimaryButton
              label={premiumAccess ? 'Add Dog' : 'Unlock Multi-Dog'}
              size="large"
              backgroundColor={premiumAccess ? '#0A0A0A' : '#FFFCFA'}
              borderColor={premiumAccess ? 'transparent' : '#0A0A0A'}
              labelColor={premiumAccess ? '#FAFAFA' : '#0A0A0A'}
              onPress={() =>
                premiumAccess
                  ? router.push('/add-dog')
                  : openPremiumGate(router, 'multi-dog')
              }
            />
          </View>
        ) : null}

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Household sharing</Text>
          <Text style={styles.statusBody}>
            Coordinate care with family, sitters, and trusted helpers. BarkLog
            keeps shared care cloud-backed with role-based access.
          </Text>

          {!premiumAccess ? (
            <PrimaryButton
              label="Unlock Household Sharing"
              size="large"
              backgroundColor="#FFFCFA"
              borderColor="#0A0A0A"
              labelColor="#0A0A0A"
              onPress={() => openPremiumGate(router, 'household-sharing')}
            />
          ) : null}

          {premiumAccess && sharingLoading ? (
            <Text style={styles.statusBody}>Loading household sharing...</Text>
          ) : null}

          {premiumAccess && !sharingLoading && !primaryHousehold ? (
            <>
              <Text style={styles.statusBody}>
                Create one household for your dog profiles, then invite helpers
                with caregiver, sitter, or viewer access.
              </Text>
              <PrimaryButton
                label="Create Household"
                size="large"
                onPress={() => {
                  handleCreateHousehold().catch(() => undefined);
                }}
              />
            </>
          ) : null}

          {premiumAccess && primaryHousehold ? (
            <>
              <Text style={styles.sectionHeader}>{primaryHousehold.name}</Text>
              <View style={styles.inlineRow}>
                {householdDogs.length > 0 ? (
                  householdDogs.map((dog) => (
                    <HouseholdMiniTag
                      key={dog.id}
                      label={dog.name}
                      tone="walk"
                    />
                  ))
                ) : (
                  <Text style={styles.statusBody}>
                    No shared dogs are attached yet.
                  </Text>
                )}
              </View>

              <Text style={styles.sectionHeader}>Members</Text>
              {(sharingData?.memberships ?? [])
                .filter((member) => member.household_id === primaryHousehold.id)
                .map((member) => {
                  const isCurrentUser = member.user_id === barklogUser?.id;

                  return (
                    <View key={member.id} style={styles.memberRow}>
                      <Text style={styles.memberTitle}>
                        {member.email || member.user_id}
                      </Text>
                      <Text style={styles.memberMeta}>
                        {getHouseholdRoleLabel(member.role)}
                        {member.role === 'sitter'
                          ? ` · access until ${formatDateTime(
                              member.sitter_expires_at,
                            )}`
                          : ''}
                      </Text>
                      {canManageMembers || isCurrentUser ? (
                        <Pressable
                          accessibilityRole="button"
                          style={styles.textButton}
                          onPress={() => {
                            handleRemoveMember(member).catch(() => undefined);
                          }}
                        >
                          <Text
                            style={[styles.textButtonLabel, styles.dangerText]}
                          >
                            {isCurrentUser ? 'Leave household' : 'Remove'}
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  );
                })}

              {canManageMembers ? (
                <>
                  <Text style={styles.sectionHeader}>Invite</Text>
                  <TextInput
                    accessibilityLabel="Caregiver email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="caregiver@example.com"
                    placeholderTextColor="#9C958E"
                    style={styles.input}
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                  />
                  <View style={styles.inlineRow}>
                    {INVITE_ROLES.map((role) => {
                      const active = inviteRole === role;

                      return (
                        <Pressable
                          key={role}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                          style={[
                            styles.rolePill,
                            active ? styles.rolePillActive : null,
                          ]}
                          onPress={() => setInviteRole(role)}
                        >
                          <Text
                            style={[
                              styles.rolePillText,
                              active ? styles.rolePillTextActive : null,
                            ]}
                          >
                            {getHouseholdRoleLabel(role)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Text style={styles.memberMeta}>
                    {inviteRole === 'sitter'
                      ? 'Sitter mode can log care during a short access window, but cannot see reports or manage medications.'
                      : `${getHouseholdRoleLabel(
                          inviteRole,
                        )} permissions: ${getDefaultHouseholdPermissions(
                          inviteRole,
                        ).join(', ')}.`}
                  </Text>
                  <PrimaryButton
                    label="Create Invite"
                    size="large"
                    onPress={() => {
                      handleCreateInvite().catch(() => undefined);
                    }}
                  />
                </>
              ) : null}

              {(sharingData?.invites ?? [])
                .filter((invite) => invite.household_id === primaryHousehold.id)
                .map((invite) => (
                  <View key={invite.id} style={styles.memberRow}>
                    <Text style={styles.memberTitle}>{invite.email}</Text>
                    <Text style={styles.memberMeta}>
                      Pending {getHouseholdRoleLabel(invite.role)} invite ·
                      expires {formatDateTime(invite.expires_at)}
                    </Text>
                    {canManageMembers ? (
                      <Pressable
                        accessibilityRole="button"
                        style={styles.textButton}
                        onPress={() => {
                          handleRevokeInvite(invite.id).catch(() => undefined);
                        }}
                      >
                        <Text
                          style={[styles.textButtonLabel, styles.dangerText]}
                        >
                          Revoke invite
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                ))}

              {lastInviteUrl ? (
                <Text style={styles.memberMeta}>
                  Last invite: {lastInviteUrl}
                </Text>
              ) : null}

              <Text style={styles.sectionHeader}>Care handoff</Text>
              {canCreateHandoffs ? (
                <>
                  <TextInput
                    accessibilityLabel="Care handoff note"
                    multiline
                    placeholder="Anything the next caregiver should know?"
                    placeholderTextColor="#9C958E"
                    style={[styles.input, { minHeight: 88 }]}
                    value={handoffNote}
                    onChangeText={setHandoffNote}
                  />
                  <PrimaryButton
                    label="Save Handoff"
                    size="large"
                    onPress={() => {
                      handleCreateHandoff().catch(() => undefined);
                    }}
                  />
                </>
              ) : (
                <Text style={styles.statusBody}>
                  Your role can read household care but cannot create handoff
                  notes.
                </Text>
              )}

              {(sharingData?.handoffs ?? [])
                .filter(
                  (handoff) => handoff.household_id === primaryHousehold.id,
                )
                .slice(0, 3)
                .map((handoff) => (
                  <View key={handoff.id} style={styles.memberRow}>
                    <Text style={styles.memberTitle}>{handoff.note}</Text>
                    <Text style={styles.memberMeta}>
                      Saved {formatDateTime(handoff.created_at)}
                    </Text>
                  </View>
                ))}
            </>
          ) : null}

          {actionMessage ? (
            <Text style={styles.statusBody}>{actionMessage}</Text>
          ) : null}
          {sharingError ? (
            <Text style={[styles.statusBody, styles.dangerText]}>
              {sharingError}
            </Text>
          ) : null}
        </View>

        <HouseholdAttentionCard
          title="Requires Attention"
          items={
            attentionItems.length > 0
              ? attentionItems
              : [
                  {
                    color: '#2A7A39',
                    title: 'No household alerts from local logs today.',
                    detail:
                      'BarkLog will surface symptoms, missed routine signals, and multi-dog reminders here.',
                  },
                ]
          }
        />

        {error ? (
          <Text style={[styles.statusBody, { color: '#B02921' }]}>{error}</Text>
        ) : null}
      </View>
    </HomeShell>
  );
}
