import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  BarklogBottomSheet,
  BarklogStatusBanner,
  useBarklogFeedback,
} from '@/components/ui';
import { captureBarklogError } from '@/features/observability';
import { SkeletonBlock } from '@/features/states/components/SkeletonBlock';
import HapticManager from '@/managers/HapticManager';
import { getSelectedDog, useLocalProfileStore } from '@/stores';
import { barklogEventColors } from '@/theme/tokens';
import {
  BEHAVIOR_INTENSITY_OPTIONS,
  BEHAVIOR_OPTIONS,
  BEHAVIOR_TRIGGER_OPTIONS,
  type BehaviorDetails,
  type BehaviorIntensity,
  type BehaviorTrigger,
  type BehaviorValue,
  MOOD_ENERGY_OPTIONS,
  MOOD_OPTIONS,
  type MoodDetails,
  type MoodEnergy,
  type MoodValue,
} from '@/types/events';
import { getBarklogErrorMessage } from '@/utils/barklogErrorMessages';

import { queueBarklogEvent } from '../../observability';
import { HomeActionRow } from '../components/HomeActionRow';
import {
  ChevronRightIcon,
  ClockIcon,
  OfflineIcon,
  WarningIcon,
} from '../components/HomeIcons';
import { HomeQuickActionTile } from '../components/HomeQuickActionTile';
import { HomeSecondaryActionButton } from '../components/HomeSecondaryActionButton';
import { HomeShell } from '../components/HomeShell';
import {
  type HomeInstantLogType,
  useHomeLoggingLoop,
} from '../hooks/useHomeLoggingLoop';

const PRIMARY_ACTIONS: Array<{
  emoji: string;
  key: HomeInstantLogType;
  label: string;
  route: '/log/meal' | '/log/pee' | '/log/poop' | '/log/walk';
}> = [
  { emoji: '💩', key: 'poop', label: 'Poop', route: '/log/poop' },
  { emoji: '💧', key: 'pee', label: 'Pee', route: '/log/pee' },
  { emoji: '🍽️', key: 'meal', label: 'Meal', route: '/log/meal' },
  { emoji: '🚶', key: 'walk', label: 'Walk', route: '/log/walk' },
];

const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
  offlineBanner: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#EEF2F3',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  offlineBannerText: {
    flex: 1,
    color: '#2F353B',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  hero: {
    gap: 3,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '400',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#5F6670',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
  },
  helperText: {
    color: '#8D867F',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  medicationCard: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: barklogEventColors.medication.border,
    backgroundColor: barklogEventColors.medication.bg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  medicationCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  medicationCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  medicationEmoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  medicationLabelWrap: {
    flex: 1,
    gap: 1,
  },
  medicationLabel: {
    color: barklogEventColors.medication.text,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  },
  medicationMeta: {
    color: barklogEventColors.medication.text,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '400',
    opacity: 0.78,
  },
  medicationPlus: {
    color: barklogEventColors.medication.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  behaviorStepLabel: {
    color: '#7A4510',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  moodSheetHeader: {
    gap: 4,
  },
  moodSheetTitle: {
    color: '#0A0A0A',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  moodSheetBody: {
    color: '#737373',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
  },
  moodPillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodPill: {
    minHeight: 48,
    minWidth: 104,
    flexGrow: 1,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0D4F5',
    backgroundColor: '#F5F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  behaviorPill: {
    borderColor: '#FFE0C2',
    backgroundColor: '#FFF5EC',
  },
  behaviorPillSelected: {
    borderColor: '#7A4510',
    backgroundColor: '#7A4510',
  },
  behaviorPillText: {
    color: '#7A4510',
  },
  moodPillSelected: {
    borderColor: '#4A3580',
    backgroundColor: '#4A3580',
  },
  moodPillText: {
    color: '#4A3580',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  moodPillTextSelected: {
    color: '#FAFAFA',
  },
  moodEnergyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  moodEnergyPill: {
    minHeight: 48,
    flex: 1,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E7E5E4',
    backgroundColor: '#FFFCFA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  moodEnergyPillDisabled: {
    opacity: 0.48,
  },
  moodEnergyText: {
    color: '#0A0A0A',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  banner: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerWarning: {
    backgroundColor: '#FFF7E7',
    borderColor: '#EEDCB4',
  },
  bannerError: {
    backgroundColor: '#FCEBEB',
    borderColor: '#F7C1C1',
  },
  bannerText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bannerTextWarning: {
    color: '#8F6110',
  },
  bannerTextError: {
    color: '#791F1F',
  },
  summaryCard: {
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E1DB',
    backgroundColor: '#F8F8F7',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  summaryTitle: {
    color: '#0A0A0A',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
  },
  summaryStats: {
    color: '#5F6670',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
  },
  summaryEmpty: {
    color: '#5F6670',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E1DDD8',
  },
  summaryFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  summaryFootText: {
    flex: 1,
    color: '#5F6670',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '400',
  },
  recentList: {
    gap: 14,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  recentIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E7E5E4',
  },
  recentEmoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  recentCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  recentTitle: {
    color: '#0A0A0A',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
  },
  recentDetail: {
    color: '#737373',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  recentTime: {
    color: '#737373',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  utilityStack: {
    gap: 4,
  },
});

type HomeScreenProps = {
  mode: 'online' | 'offline';
};

function getSummaryText(
  counts: Record<'meal' | 'pee' | 'poop' | 'walk', number>,
) {
  return `${counts.meal} meals · ${counts.pee} pees · ${counts.poop} poops · ${counts.walk} walks`;
}

function getToastCopy(type: HomeInstantLogType) {
  if (type === 'poop') {
    return { title: 'Poop logged', tone: 'success' as const };
  }

  if (type === 'pee') {
    return { title: 'Pee logged', tone: 'success' as const };
  }

  if (type === 'meal') {
    return { title: 'Meal logged', tone: 'success' as const };
  }

  if (type === 'walk') {
    return { title: 'Walk logged', tone: 'success' as const };
  }

  if (type === 'weight') {
    return {
      title: 'Weight checkpoint saved',
      description: 'Saved on this device.',
      tone: 'success' as const,
    };
  }

  if (type === 'mood') {
    return {
      title: 'Mood check-in saved',
      description: 'Stored locally for future pattern checks.',
      tone: 'success' as const,
    };
  }

  if (type === 'behavior') {
    return {
      title: 'Behavior logged',
      description: 'Saved locally as an observation, not a diagnosis.',
      tone: 'success' as const,
    };
  }

  return {
    title: 'Grooming logged',
    description: 'Saved locally. Add more detail later if needed.',
    tone: 'success' as const,
  };
}

function BehaviorQuickLogSheet({
  open,
  saving,
  selectedBehavior,
  selectedTrigger,
  onClose,
  onSelectBehavior,
  onSelectIntensity,
  onSelectTrigger,
}: {
  open: boolean;
  saving: boolean;
  selectedBehavior: BehaviorValue | null;
  selectedTrigger: BehaviorTrigger | null;
  onClose: () => void;
  onSelectBehavior: (behavior: BehaviorValue) => void;
  onSelectIntensity: (intensity: BehaviorIntensity) => void;
  onSelectTrigger: (trigger: BehaviorTrigger) => void;
}) {
  return (
    <BarklogBottomSheet
      accessibilityLabel="Behavior quick log"
      open={open}
      onClose={onClose}
    >
      <View style={styles.moodSheetHeader}>
        <Text style={styles.moodSheetTitle}>Behavior log</Text>
        <Text style={styles.moodSheetBody}>
          Choose the behavior, likely trigger, then intensity to save.
        </Text>
      </View>

      <Text style={styles.behaviorStepLabel}>Behavior</Text>
      <View style={styles.moodPillGrid}>
        {BEHAVIOR_OPTIONS.map((option) => {
          const selected = selectedBehavior === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              disabled={saving}
              style={[
                styles.moodPill,
                styles.behaviorPill,
                selected ? styles.behaviorPillSelected : null,
              ]}
              onPress={() => onSelectBehavior(option.value)}
            >
              <Text
                style={[
                  styles.moodPillText,
                  styles.behaviorPillText,
                  selected ? styles.moodPillTextSelected : null,
                ]}
              >
                {option.emoji} {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {selectedBehavior ? (
        <>
          <Text style={styles.behaviorStepLabel}>Trigger</Text>
          <View style={styles.moodPillGrid}>
            {BEHAVIOR_TRIGGER_OPTIONS.map((option) => {
              const selected = selectedTrigger === option.value;

              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  disabled={saving}
                  style={[
                    styles.moodPill,
                    styles.behaviorPill,
                    selected ? styles.behaviorPillSelected : null,
                  ]}
                  onPress={() => onSelectTrigger(option.value)}
                >
                  <Text
                    style={[
                      styles.moodPillText,
                      styles.behaviorPillText,
                      selected ? styles.moodPillTextSelected : null,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      {selectedBehavior && selectedTrigger ? (
        <>
          <Text style={styles.behaviorStepLabel}>Intensity</Text>
          <View style={styles.moodEnergyRow}>
            {BEHAVIOR_INTENSITY_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                disabled={saving}
                style={[
                  styles.moodEnergyPill,
                  saving ? styles.moodEnergyPillDisabled : null,
                ]}
                onPress={() => onSelectIntensity(option.value)}
              >
                <Text style={styles.moodEnergyText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
    </BarklogBottomSheet>
  );
}

function SummarySkeleton() {
  return (
    <View style={styles.summaryCard}>
      <SkeletonBlock width="42%" height={24} borderRadius={10} />
      <SkeletonBlock width="92%" height={18} borderRadius={8} />
      <SkeletonBlock width="88%" height={18} borderRadius={8} />
      <View style={styles.summaryDivider} />
      <View style={styles.recentList}>
        {['first', 'second', 'third'].map((item) => (
          <View key={item} style={styles.recentRow}>
            <SkeletonBlock width={42} height={42} borderRadius={21} />
            <View style={styles.recentCopy}>
              <SkeletonBlock width="55%" height={16} borderRadius={8} />
              <SkeletonBlock width="72%" height={14} borderRadius={8} />
            </View>
            <SkeletonBlock width={54} height={14} borderRadius={7} />
          </View>
        ))}
      </View>
    </View>
  );
}

function MoodQuickLogSheet({
  open,
  saving,
  selectedMood,
  onClose,
  onSelectEnergy,
  onSelectMood,
}: {
  open: boolean;
  saving: boolean;
  selectedMood: MoodValue | null;
  onClose: () => void;
  onSelectEnergy: (energy: MoodEnergy) => void;
  onSelectMood: (mood: MoodValue) => void;
}) {
  return (
    <BarklogBottomSheet
      accessibilityLabel="Mood quick log"
      open={open}
      onClose={onClose}
    >
      <View style={styles.moodSheetHeader}>
        <Text style={styles.moodSheetTitle}>Mood check-in</Text>
        <Text style={styles.moodSheetBody}>
          Pick a mood, then choose energy to save.
        </Text>
      </View>

      <View style={styles.moodPillGrid}>
        {MOOD_OPTIONS.map((option) => {
          const selected = selectedMood === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              disabled={saving}
              style={[
                styles.moodPill,
                selected ? styles.moodPillSelected : null,
              ]}
              onPress={() => onSelectMood(option.value)}
            >
              <Text
                style={[
                  styles.moodPillText,
                  selected ? styles.moodPillTextSelected : null,
                ]}
              >
                {option.emoji} {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.moodEnergyRow}>
        {MOOD_ENERGY_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            disabled={!selectedMood || saving}
            style={[
              styles.moodEnergyPill,
              !selectedMood || saving ? styles.moodEnergyPillDisabled : null,
            ]}
            onPress={() => onSelectEnergy(option.value)}
          >
            <Text style={styles.moodEnergyText}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
    </BarklogBottomSheet>
  );
}

function QuickLogGrid({
  onInstantLog,
  onOpenDetail,
}: {
  onInstantLog: (type: HomeInstantLogType) => void;
  onOpenDetail: (
    route: '/log/meal' | '/log/pee' | '/log/poop' | '/log/walk',
  ) => void;
}) {
  return (
    <View style={styles.grid}>
      {PRIMARY_ACTIONS.map((item) => {
        const colors = barklogEventColors[item.key];

        return (
          <HomeQuickActionTile
            key={item.key}
            emoji={item.emoji}
            label={item.label}
            labelColor={colors.text}
            backgroundColor={colors.bg}
            borderColor={colors.border}
            onLongPress={() => onOpenDetail(item.route)}
            onPress={() => onInstantLog(item.key)}
          />
        );
      })}
    </View>
  );
}

export function HomeScreen({ mode }: HomeScreenProps) {
  const router = useRouter();
  const feedback = useBarklogFeedback();
  const barklogUser = useLocalProfileStore((state) => state.barklogUser);
  const dogs = useLocalProfileStore((state) => state.dogs);
  const selectedDogId = useLocalProfileStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const dogName = selectedDog?.name ?? 'your dog';
  const dogMeta = selectedDog?.breed?.trim() || 'Dog care journal';
  const offline = mode === 'offline';
  const [savingKey, setSavingKey] = useState<HomeInstantLogType | null>(null);
  const [quickLogError, setQuickLogError] = useState<string | null>(null);
  const [moodSheetOpen, setMoodSheetOpen] = useState(false);
  const [selectedQuickMood, setSelectedQuickMood] = useState<MoodValue | null>(
    null,
  );
  const [behaviorSheetOpen, setBehaviorSheetOpen] = useState(false);
  const [selectedQuickBehavior, setSelectedQuickBehavior] =
    useState<BehaviorValue | null>(null);
  const [selectedQuickTrigger, setSelectedQuickTrigger] =
    useState<BehaviorTrigger | null>(null);
  const { isLoading, logInstantEvent, snapshot } = useHomeLoggingLoop({
    dogId: selectedDog?.id ?? null,
    userId: barklogUser?.id ?? null,
    weightLbs: selectedDog?.weight_lbs ?? null,
  });

  const handleInstantLog = async (type: HomeInstantLogType) => {
    if (savingKey) {
      return;
    }

    setQuickLogError(null);

    if (type === 'weight' && typeof selectedDog?.weight_lbs !== 'number') {
      const message =
        'Set your dog weight in Profile before using quick weight log.';

      await HapticManager.warning();
      feedback.showWarning({
        title: 'Add a weight first',
        description: message,
      });
      router.push('/profile');
      return;
    }

    setSavingKey(type);

    try {
      await logInstantEvent(type);
      queueBarklogEvent('quick_log_saved', {
        dog_id: selectedDog?.id ?? null,
        event_type: type,
      });
      await HapticManager.success();
      setQuickLogError(null);
      feedback.showSuccess(getToastCopy(type));
    } catch (error) {
      const message = getBarklogErrorMessage(error, { domain: 'local_save' });

      queueBarklogEvent('quick_log_failed', {
        dog_id: selectedDog?.id ?? null,
        event_type: type,
      });
      captureBarklogError(error, {
        extra: {
          dog_id: selectedDog?.id ?? null,
          event_type: type,
        },
        source: 'home.quick_log',
      });
      await HapticManager.error();
      setQuickLogError(message);
    } finally {
      setSavingKey(null);
    }
  };

  const handleOpenMoodSheet = async () => {
    setQuickLogError(null);
    setSelectedQuickMood(null);
    setMoodSheetOpen(true);
    await HapticManager.light();
  };

  const handleQuickMoodSelect = async (mood: MoodValue) => {
    setSelectedQuickMood(mood);
    await HapticManager.selectionChange();
  };

  const handleQuickMoodSave = async (energy: MoodEnergy) => {
    if (!selectedQuickMood || savingKey) {
      return;
    }

    const details = {
      energy,
      mood: selectedQuickMood,
    } satisfies MoodDetails;

    setSavingKey('mood');

    try {
      await logInstantEvent('mood', {
        details: {
          energy: details.energy,
          mood: details.mood,
        },
      });
      queueBarklogEvent('quick_log_saved', {
        dog_id: selectedDog?.id ?? null,
        event_type: 'mood',
      });
      await HapticManager.success();
      setMoodSheetOpen(false);
      setSelectedQuickMood(null);
      setQuickLogError(null);
      feedback.showSuccess(getToastCopy('mood'));
    } catch (error) {
      const message = getBarklogErrorMessage(error, { domain: 'local_save' });

      queueBarklogEvent('quick_log_failed', {
        dog_id: selectedDog?.id ?? null,
        event_type: 'mood',
      });
      captureBarklogError(error, {
        extra: {
          dog_id: selectedDog?.id ?? null,
          event_type: 'mood',
        },
        source: 'home.quick_log',
      });
      await HapticManager.error();
      setQuickLogError(message);
    } finally {
      setSavingKey(null);
    }
  };

  const handleOpenBehaviorSheet = async () => {
    setQuickLogError(null);
    setSelectedQuickBehavior(null);
    setSelectedQuickTrigger(null);
    setBehaviorSheetOpen(true);
    await HapticManager.light();
  };

  const handleQuickBehaviorSelect = async (behavior: BehaviorValue) => {
    setSelectedQuickBehavior(behavior);
    setSelectedQuickTrigger(null);
    await HapticManager.selectionChange();
  };

  const handleQuickTriggerSelect = async (trigger: BehaviorTrigger) => {
    setSelectedQuickTrigger(trigger);
    await HapticManager.selectionChange();
  };

  const handleQuickBehaviorSave = async (intensity: BehaviorIntensity) => {
    if (!selectedQuickBehavior || !selectedQuickTrigger || savingKey) {
      return;
    }

    const details = {
      behavior: selectedQuickBehavior,
      intensity,
      trigger: selectedQuickTrigger,
    } satisfies BehaviorDetails;

    setSavingKey('behavior');

    try {
      await logInstantEvent('behavior', {
        details: {
          behavior: details.behavior,
          intensity: details.intensity,
          trigger: details.trigger,
        },
      });
      queueBarklogEvent('quick_log_saved', {
        dog_id: selectedDog?.id ?? null,
        event_type: 'behavior',
      });
      await HapticManager.success();
      setBehaviorSheetOpen(false);
      setSelectedQuickBehavior(null);
      setSelectedQuickTrigger(null);
      setQuickLogError(null);
      feedback.showSuccess(getToastCopy('behavior'));
    } catch (error) {
      const message = getBarklogErrorMessage(error, { domain: 'local_save' });

      queueBarklogEvent('quick_log_failed', {
        dog_id: selectedDog?.id ?? null,
        event_type: 'behavior',
      });
      captureBarklogError(error, {
        extra: {
          dog_id: selectedDog?.id ?? null,
          event_type: 'behavior',
        },
        source: 'home.quick_log',
      });
      await HapticManager.error();
      setQuickLogError(message);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <>
      <BehaviorQuickLogSheet
        open={behaviorSheetOpen}
        saving={savingKey === 'behavior'}
        selectedBehavior={selectedQuickBehavior}
        selectedTrigger={selectedQuickTrigger}
        onClose={() => {
          setBehaviorSheetOpen(false);
          setSelectedQuickBehavior(null);
          setSelectedQuickTrigger(null);
        }}
        onSelectBehavior={(behavior) => {
          handleQuickBehaviorSelect(behavior).catch(() => undefined);
        }}
        onSelectIntensity={(intensity) => {
          handleQuickBehaviorSave(intensity).catch(() => undefined);
        }}
        onSelectTrigger={(trigger) => {
          handleQuickTriggerSelect(trigger).catch(() => undefined);
        }}
      />
      <MoodQuickLogSheet
        open={moodSheetOpen}
        saving={savingKey === 'mood'}
        selectedMood={selectedQuickMood}
        onClose={() => {
          setMoodSheetOpen(false);
          setSelectedQuickMood(null);
        }}
        onSelectEnergy={(energy) => {
          handleQuickMoodSave(energy).catch(() => undefined);
        }}
        onSelectMood={(mood) => {
          handleQuickMoodSelect(mood).catch(() => undefined);
        }}
      />
      <HomeShell
        activeTab="home"
        headerDogName={dogName}
        headerDogMeta={dogMeta}
      >
        <View style={styles.stack}>
          {offline ? (
            <View style={styles.offlineBanner}>
              <OfflineIcon />
              <Text style={styles.offlineBannerText}>
                You&apos;re offline. Your care journal still saves on this
                device.
              </Text>
            </View>
          ) : null}

          <View style={styles.hero}>
            <Text style={styles.title}>Today.</Text>
            <Text style={styles.subtitle}>How is {dogName} doing?</Text>
          </View>

          {quickLogError ? (
            <BarklogStatusBanner
              tone="danger"
              title="Log not saved"
              description={quickLogError}
            />
          ) : null}

          <QuickLogGrid
            onInstantLog={(type) => {
              handleInstantLog(type).catch(() => undefined);
            }}
            onOpenDetail={(route) => router.push(route)}
          />

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.medicationCard,
              pressed ? styles.medicationCardPressed : null,
            ]}
            onPress={() => router.push('/log/medication')}
          >
            <View style={styles.medicationCopy}>
              <Text style={styles.medicationEmoji}>💊</Text>
              <View style={styles.medicationLabelWrap}>
                <Text style={styles.medicationLabel}>Log Medication</Text>
              </View>
            </View>

            <Text style={styles.medicationPlus}>+</Text>
          </Pressable>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.secondaryRow}
          >
            <HomeSecondaryActionButton
              emoji="🤕"
              label="Symptom"
              backgroundColor={barklogEventColors.symptom.bg}
              borderColor={barklogEventColors.symptom.border}
              labelColor={barklogEventColors.symptom.text}
              onPress={() => router.push('/log/symptom')}
            />
            <HomeSecondaryActionButton
              emoji="⚖️"
              label="Weight"
              backgroundColor={barklogEventColors.weight.bg}
              borderColor={barklogEventColors.weight.border}
              labelColor={barklogEventColors.weight.text}
              onLongPress={() => router.push('/profile')}
              onPress={() => {
                handleInstantLog('weight').catch(() => undefined);
              }}
            />
            <HomeSecondaryActionButton
              emoji="🛁"
              label="Grooming"
              backgroundColor={barklogEventColors.grooming.bg}
              borderColor={barklogEventColors.grooming.border}
              labelColor={barklogEventColors.grooming.text}
              onLongPress={() => router.push('/profile')}
              onPress={() => {
                handleInstantLog('grooming').catch(() => undefined);
              }}
            />
            <HomeSecondaryActionButton
              emoji="😊"
              label="Mood"
              backgroundColor={barklogEventColors.mood.bg}
              borderColor={barklogEventColors.mood.border}
              labelColor={barklogEventColors.mood.text}
              onLongPress={() => router.push('/log/mood')}
              onPress={() => {
                handleOpenMoodSheet().catch(() => undefined);
              }}
            />
            <HomeSecondaryActionButton
              emoji="🐕"
              label="Behavior"
              backgroundColor={barklogEventColors.behavior.bg}
              borderColor={barklogEventColors.behavior.border}
              labelColor={barklogEventColors.behavior.text}
              onLongPress={() => router.push('/log/behavior')}
              onPress={() => {
                handleOpenBehaviorSheet().catch(() => undefined);
              }}
            />
          </ScrollView>

          {snapshot.warningMessage ? (
            <BarklogStatusBanner
              tone="warning"
              title="Care pattern noticed"
              description={`${dogName} ${snapshot.warningMessage}`}
            />
          ) : null}

          {snapshot.error ? (
            <BarklogStatusBanner
              tone="danger"
              title="Today could not load"
              description={snapshot.error}
            />
          ) : null}

          {isLoading ? (
            <SummarySkeleton />
          ) : (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Today&apos;s Summary</Text>
              <Text style={styles.summaryStats}>
                {getSummaryText(snapshot.summaryCounts)}
              </Text>
              <View style={styles.summaryDivider} />

              <View style={styles.summaryFoot}>
                <ClockIcon />
                <Text style={styles.summaryFootText}>
                  {snapshot.latestEntryLabel ?? 'Ready for the next quick log.'}{' '}
                  Saved on this device.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.utilityStack}>
            <HomeActionRow
              label="Is this safe to eat?"
              trailing={<ChevronRightIcon />}
              onPress={() => router.push('/toxicity')}
            />
            <HomeActionRow
              label="Emergency / SOS"
              color="#A8342A"
              trailing={<WarningIcon />}
              onPress={() => router.push('/emergency')}
            />
          </View>
        </View>
      </HomeShell>
    </>
  );
}
