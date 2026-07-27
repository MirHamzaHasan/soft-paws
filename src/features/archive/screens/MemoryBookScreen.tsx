import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getDogAvatar } from '@/features/dogs/utils/dogDisplay';
import {
  buildMemoryBookText,
  getWalkMinutes,
  summarizeEventCounts,
} from '@/features/export/utils/exportBuilders';
import { loadMonthlyEvents } from '@/features/insights/utils/insightSummaries';
import { getSelectedDog, useAuthSessionStore } from '@/stores';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { shareTextDocument } from '../../export/services/exportDocumentService';
import { HomeAvatar } from '../../home/components/HomeAvatar';
import { ClockIcon } from '../../home/components/HomeIcons';
import { HomeShell } from '../../home/components/HomeShell';
import {
  ExportIcon,
  MealsIcon,
  ShareIcon,
  WalksIcon,
} from '../../insights/components/InsightsIcons';
import { hasPremiumAccess } from '../../premium/utils/premiumAccess';
import { openPremiumGate } from '../../premium/utils/premiumNavigation';
import { ArchiveFilterPill } from '../components/ArchiveFilterPill';
import { MemoryBookMetricCard } from '../components/MemoryBookMetricCard';

const collageEmojiByTile = {
  meal: '🍽️',
  photo: '📷',
  walk: '🐾',
} as const;

const styles = StyleSheet.create({
  stack: {
    gap: 24,
  },
  monthRail: {
    marginHorizontal: -18,
  },
  monthRailContent: {
    gap: 12,
    paddingHorizontal: 18,
  },
  heroCard: {
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DAD4CC',
    backgroundColor: '#FFFCFA',
    overflow: 'hidden',
  },
  coverArt: {
    minHeight: 430,
    backgroundColor: '#EFE5D1',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  coverTitle: {
    color: '#0A0A0A',
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '400',
    letterSpacing: -1.4,
    marginTop: 12,
  },
  coverMeta: {
    color: '#5B6166',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  body: {
    gap: 26,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 26,
  },
  narrative: {
    color: '#1E2528',
    fontSize: 18,
    lineHeight: 34,
    fontWeight: '400',
  },
  statusText: {
    color: '#687079',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DAD4CC',
    backgroundColor: '#F8F2E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#5B6166',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  collageRow: {
    flexDirection: 'row',
    gap: 10,
  },
  collageTile: {
    flex: 1,
    minHeight: 82,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD5CC',
    backgroundColor: '#F5EFE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collageEmoji: {
    fontSize: 24,
    lineHeight: 28,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  metricCell: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 18,
  },
  actionCell: {
    flex: 1,
  },
});

function getMonthOffsets() {
  return [-2, -1, 0];
}

function formatActiveHours(minutes: number) {
  if (minutes <= 0) {
    return '0h';
  }

  return `${Math.max(minutes / 60, 0.1).toFixed(1)}h`;
}

function buildNarrative(input: {
  dogName: string;
  mealCount: number;
  monthLabel: string;
  photoCount: number;
  walkCount: number;
}) {
  if (input.walkCount + input.mealCount + input.photoCount === 0) {
    return `${input.monthLabel} is ready for ${input.dogName}'s next chapter. Logs, photos, and little routines saved this month will turn into a shareable BarkLog keepsake here.`;
  }

  return `${input.monthLabel} captured ${input.dogName}'s care rhythm: ${input.walkCount} walks, ${input.mealCount} meals, and ${input.photoCount} photo moments. BarkLog keeps this as a warm recap while the timeline remains the factual record.`;
}

export default function MemoryBookScreen() {
  const router = useRouter();
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const dogs = useAuthSessionStore((state) => state.dogs);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const premiumAccess = hasPremiumAccess(barklogUser);
  const [monthOffset, setMonthOffset] = useState(0);
  const [snapshot, setSnapshot] = useState<Awaited<
    ReturnType<typeof loadMonthlyEvents>
  > | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!premiumAccess) {
      openPremiumGate(router, 'memory-book');
    }
  }, [premiumAccess, router]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      if (!premiumAccess || !selectedDog?.id) {
        setSnapshot(null);
        return () => {
          isMounted = false;
        };
      }

      loadMonthlyEvents({ dogId: selectedDog.id, monthOffset })
        .then((nextSnapshot) => {
          if (isMounted) {
            setSnapshot(nextSnapshot);
            setError(null);
          }
        })
        .catch(() => {
          if (isMounted) {
            setError('Unable to load this memory book month.');
          }
        });

      return () => {
        isMounted = false;
      };
    }, [monthOffset, premiumAccess, selectedDog?.id]),
  );

  if (!premiumAccess) {
    return null;
  }

  const dogName = selectedDog?.name ?? 'Your dog';
  const avatar = selectedDog
    ? getDogAvatar(selectedDog)
    : { backgroundColor: '#D7B46B', emoji: '🐶' };
  const counts = summarizeEventCounts(snapshot?.events ?? []);
  const walkMinutes = getWalkMinutes(snapshot?.events ?? []);
  const activeHours = formatActiveHours(walkMinutes);
  const photoCount =
    snapshot?.events.filter((event) => Boolean(event.photoUrl)).length ?? 0;
  const monthLabel =
    snapshot?.label ??
    new Intl.DateTimeFormat(undefined, {
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  const narrative = buildNarrative({
    dogName,
    mealCount: counts.meal,
    monthLabel,
    photoCount,
    walkCount: counts.walk,
  });
  const memoryText = buildMemoryBookText({
    activeHours,
    dogName,
    mealCount: counts.meal,
    monthLabel,
    narrative,
    photoCount,
    walkCount: counts.walk,
  });

  const handleShare = async () => {
    setStatusMessage(null);
    setError(null);

    try {
      const message = await shareTextDocument({
        content: memoryText,
        fileName: `${dogName}-${monthLabel}-memory-book.txt`,
        mimeType: 'text/plain',
        title: `${dogName}'s ${monthLabel} Memory Book`,
        uti: 'public.plain-text',
      });

      setStatusMessage(message);
    } catch {
      setError('Unable to share this memory book right now.');
    }
  };

  return (
    <HomeShell
      activeTab="memories"
      tabVariant="care"
      headerVariant="compact"
      headerAvatarEmoji={avatar.emoji}
      headerAvatarBackgroundColor={avatar.backgroundColor}
      tabRoutes={{
        archive: '/timeline',
        memories: '/memory-book',
      }}
    >
      <View style={styles.stack}>
        <ScrollView
          horizontal
          style={styles.monthRail}
          contentContainerStyle={styles.monthRailContent}
          showsHorizontalScrollIndicator={false}
        >
          {getMonthOffsets().map((offset) => {
            const label = new Intl.DateTimeFormat(undefined, {
              month: 'short',
              year: 'numeric',
            }).format(
              new Date(
                new Date().getFullYear(),
                new Date().getMonth() + offset,
              ),
            );

            return (
              <ArchiveFilterPill
                key={offset}
                label={label}
                selected={offset === monthOffset}
                onPress={() => setMonthOffset(offset)}
              />
            );
          })}
        </ScrollView>

        <View style={styles.heroCard}>
          <View style={styles.coverArt}>
            <HomeAvatar
              emoji={avatar.emoji}
              backgroundColor={avatar.backgroundColor}
              size={180}
            />
            <Text style={styles.coverTitle}>{monthLabel.split(' ')[0]}</Text>
            <Text style={styles.coverMeta}>{dogName} • The Living Archive</Text>
          </View>

          <View style={styles.body}>
            <Text style={styles.narrative}>{narrative}</Text>

            <View style={styles.collageRow}>
              {Object.entries(collageEmojiByTile).map(([tile, emoji]) => (
                <View key={tile} style={styles.collageTile}>
                  <Text style={styles.collageEmoji}>{emoji}</Text>
                </View>
              ))}
            </View>

            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {counts.walk > 0 ? 'Walk streak' : 'Ready for walks'}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {photoCount > 0 ? 'Photo month' : 'Photo-ready'}
                </Text>
              </View>
            </View>

            <View style={styles.metricGrid}>
              <View style={styles.metricCell}>
                <MemoryBookMetricCard
                  icon={<WalksIcon size={24} />}
                  value={`${counts.walk}`}
                  label="Walks Logged"
                  backgroundColor="#FFF7E2"
                  borderColor="#F3D37D"
                  valueColor="#9A6800"
                  labelColor="#9A6800"
                />
              </View>
              <View style={styles.metricCell}>
                <MemoryBookMetricCard
                  icon={<MealsIcon size={24} />}
                  value={`${counts.meal}`}
                  label="Meals Served"
                  backgroundColor="#EEF9ED"
                  borderColor="#CFE4C6"
                  valueColor="#0F6A22"
                  labelColor="#0F6A22"
                />
              </View>
              <View style={styles.metricCell}>
                <MemoryBookMetricCard
                  icon={<ClockIcon color="#3F4850" size={24} />}
                  value={activeHours}
                  label="Active Time"
                  backgroundColor="#F6F7F8"
                  borderColor="#D6DCE1"
                />
              </View>
              <View style={styles.metricCell}>
                <MemoryBookMetricCard
                  icon={<ClockIcon color="#3F4850" size={24} />}
                  value={`${photoCount}`}
                  label="Photos"
                  backgroundColor="#F6F7F8"
                  borderColor="#D6DCE1"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <View style={styles.actionCell}>
            <PrimaryButton
              label="Share to Story"
              size="large"
              leadingIcon={<ShareIcon color="#FAFAFA" />}
              onPress={() => {
                handleShare().catch(() => undefined);
              }}
            />
          </View>
          <View style={styles.actionCell}>
            <PrimaryButton
              label="Save Story"
              size="large"
              leadingIcon={<ExportIcon color="#0A0A0A" />}
              backgroundColor="#FFFCFA"
              borderColor="#0A0A0A"
              labelColor="#0A0A0A"
              onPress={() => {
                handleShare().catch(() => undefined);
              }}
            />
          </View>
        </View>

        {statusMessage ? (
          <Text style={styles.statusText}>{statusMessage}</Text>
        ) : null}
        {error ? (
          <Text style={[styles.statusText, { color: '#B02921' }]}>{error}</Text>
        ) : null}
      </View>
    </HomeShell>
  );
}
