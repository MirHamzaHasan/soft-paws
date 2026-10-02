import { useRouter } from 'expo-router';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import {
  deleteLocalEvent,
  type EventModel,
  getLocalEventById,
  updateLocalEvent,
} from '@/db';
import HapticManager from '@/managers/HapticManager';
import { useLocalProfileStore } from '@/stores';
import {
  APPETITE_OPTIONS,
  BEHAVIOR_CONTEXT_OPTIONS,
  BEHAVIOR_INTENSITY_OPTIONS,
  BEHAVIOR_OPTIONS,
  BEHAVIOR_TRIGGER_OPTIONS,
  type BehaviorContext,
  type BehaviorIntensity,
  type BehaviorTrigger,
  type BehaviorValue,
  COUGH_SNEEZE_FREQUENCY_OPTIONS,
  COUGH_SNEEZE_TYPE_OPTIONS,
  DENTAL_ACTION_OPTIONS,
  getBehaviorContextLabel,
  isBehaviorContext,
  isBehaviorIntensity,
  isBehaviorTrigger,
  isBehaviorValue,
  isExpandedCareEventType,
  isMoodEnergy,
  isMoodValue,
  MOBILITY_OBSERVATION_OPTIONS,
  MOOD_ENERGY_OPTIONS,
  MOOD_OPTIONS,
  type MoodEnergy,
  type MoodValue,
  OBSERVATION_SEVERITY_OPTIONS,
  PARASITE_PREVENTION_OPTIONS,
  REST_QUALITY_OPTIONS,
  VET_VISIT_TYPE_OPTIONS,
  VOMIT_APPEARANCE_OPTIONS,
  VOMIT_FREQUENCY_OPTIONS,
  WATER_SOURCE_OPTIONS,
} from '@/types/events';
import type { Json } from '@/types/local';

import { LogDetailLayout } from '../../logging/components/LogDetailLayout';
import { LogMediaUploadButton } from '../../logging/components/LogMediaUploadButton';
import { LogSegmentedControl } from '../../logging/components/LogSegmentedControl';
import {
  createLocalAttachmentUri,
  normalizeOptionalText,
  resolveDetailWhenTimestamp,
} from '../../logging/hooks/useDetailedEventSave';
import {
  buildExpandedCareDetails,
  defaultExpandedCareFormState,
  type ExpandedCareFormState,
  getExpandedCareFormStateFromDetails,
} from '../../logging/utils/expandedCareDetails';
import { OnboardingChoiceChip } from '../../onboarding/components/OnboardingChoiceChip';
import {
  buildEventDetailRows,
  formatEventDateTime,
  getEventPresentation,
} from '../utils/eventPresentation';

type EventDetailScreenProps = {
  eventId?: string;
};

type EditWhenValue = 'earlier' | 'keep' | 'just-now';

const EDIT_WHEN_OPTIONS = [
  { label: 'Keep time', value: 'keep' },
  { label: 'Just now', value: 'just-now' },
  { label: 'Earlier', value: 'earlier' },
];

const styles = StyleSheet.create({
  stack: {
    gap: 24,
  },
  hero: {
    gap: 14,
  },
  icon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emoji: {
    fontSize: 26,
    lineHeight: 30,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '400',
    letterSpacing: -1,
  },
  timestamp: {
    color: '#5F6670',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400',
  },
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E1DDD8',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 16,
  },
  row: {
    gap: 5,
  },
  label: {
    color: '#8C857E',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  value: {
    color: '#263136',
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '400',
  },
  input: {
    minHeight: 118,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD8D2',
    backgroundColor: '#FFFCFA',
    color: '#111111',
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '400',
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlignVertical: 'top',
  },
  inlineInput: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD8D2',
    backgroundColor: '#FFFCFA',
    color: '#111111',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400',
    paddingHorizontal: 16,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodChip: {
    minWidth: 116,
    flexGrow: 1,
  },
  moodEmoji: {
    fontSize: 16,
    lineHeight: 18,
  },
  energyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  energyItem: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionItem: {
    flex: 1,
  },
  deleteButton: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  deleteText: {
    color: '#B02921',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  errorText: {
    color: '#B02921',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
});

function asDetailsRecord(value: Json | null | undefined) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, Json | undefined>;
}

function getMoodEditState(event: EventModel | null) {
  if (!event || event.type !== 'mood') {
    return {
      energy: 'normal' as MoodEnergy,
      mood: 'happy' as MoodValue,
    };
  }

  const details = asDetailsRecord(event.details);

  return {
    energy: isMoodEnergy(details.energy) ? details.energy : 'normal',
    mood: isMoodValue(details.mood) ? details.mood : 'happy',
  };
}

function getBehaviorEditState(event: EventModel | null) {
  if (!event || event.type !== 'behavior') {
    return {
      behavior: 'barking' as BehaviorValue,
      context: null as BehaviorContext | null,
      duration: '',
      intensity: 'mild' as BehaviorIntensity,
      trigger: 'unknown' as BehaviorTrigger,
    };
  }

  const details = asDetailsRecord(event.details);
  const duration =
    typeof details.duration_min === 'number'
      ? String(details.duration_min)
      : '';

  return {
    behavior: isBehaviorValue(details.behavior)
      ? details.behavior
      : ('barking' as BehaviorValue),
    context: isBehaviorContext(details.context) ? details.context : null,
    duration,
    intensity: isBehaviorIntensity(details.intensity)
      ? details.intensity
      : ('mild' as BehaviorIntensity),
    trigger: isBehaviorTrigger(details.trigger)
      ? details.trigger
      : ('unknown' as BehaviorTrigger),
  };
}

function parseEditDuration(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function renderMoodEmoji(emoji: string) {
  return <Text style={styles.moodEmoji}>{emoji}</Text>;
}

function updateExpandedCareEditState(
  setFormState: Dispatch<SetStateAction<ExpandedCareFormState>>,
  patch: Partial<ExpandedCareFormState>,
) {
  setFormState((current) => ({
    ...current,
    ...patch,
  }));
}

function ExpandedCareChoiceGrid<TValue extends string>({
  options,
  selected,
  onSelect,
}: {
  onSelect: (value: TValue) => void;
  options: readonly { label: string; value: TValue }[];
  selected: TValue | null;
}) {
  return (
    <View style={styles.chipWrap}>
      {options.map((option) => (
        <View key={option.value} style={styles.moodChip}>
          <OnboardingChoiceChip
            label={option.label}
            selected={selected === option.value}
            backgroundColor="#FFFCFA"
            borderColor="#DDD8D2"
            labelColor="#263136"
            selectedBackgroundColor="#F5F5F4"
            selectedBorderColor="#0A0A0A"
            selectedLabelColor="#0A0A0A"
            onPress={() => onSelect(option.value)}
          />
        </View>
      ))}
    </View>
  );
}

function EventIcon({ event }: { event: EventModel }) {
  const presentation = getEventPresentation(event);

  return (
    <View
      style={[
        styles.icon,
        {
          backgroundColor: presentation.iconBackgroundColor,
          borderColor: presentation.iconBorderColor,
        },
      ]}
    >
      <Text style={styles.emoji}>{presentation.emoji}</Text>
    </View>
  );
}

export default function EventDetailScreen({ eventId }: EventDetailScreenProps) {
  const router = useRouter();
  const barklogUser = useLocalProfileStore((state) => state.barklogUser);
  const [event, setEvent] = useState<EventModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editWhen, setEditWhen] = useState<EditWhenValue>('keep');
  const [editMood, setEditMood] = useState<MoodValue>('happy');
  const [editEnergy, setEditEnergy] = useState<MoodEnergy>('normal');
  const [editBehavior, setEditBehavior] = useState<BehaviorValue>('barking');
  const [editTrigger, setEditTrigger] = useState<BehaviorTrigger>('unknown');
  const [editIntensity, setEditIntensity] = useState<BehaviorIntensity>('mild');
  const [editDuration, setEditDuration] = useState('');
  const [editContext, setEditContext] = useState<BehaviorContext | null>(null);
  const [editExpandedCare, setEditExpandedCare] =
    useState<ExpandedCareFormState>(defaultExpandedCareFormState);
  const [editNotes, setEditNotes] = useState('');
  const [editPhotoAttached, setEditPhotoAttached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadEvent = async () => {
      if (!eventId) {
        setIsLoading(false);
        setEvent(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      const nextEvent = await getLocalEventById(eventId);

      if (!isActive) {
        return;
      }

      setEvent(nextEvent);
      const moodEditState = getMoodEditState(nextEvent);
      const behaviorEditState = getBehaviorEditState(nextEvent);
      const expandedCareEditState =
        nextEvent && isExpandedCareEventType(nextEvent.type)
          ? getExpandedCareFormStateFromDetails(
              nextEvent.type,
              nextEvent.details,
            )
          : defaultExpandedCareFormState;
      setEditMood(moodEditState.mood);
      setEditEnergy(moodEditState.energy);
      setEditBehavior(behaviorEditState.behavior);
      setEditTrigger(behaviorEditState.trigger);
      setEditIntensity(behaviorEditState.intensity);
      setEditDuration(behaviorEditState.duration);
      setEditContext(behaviorEditState.context);
      setEditExpandedCare(expandedCareEditState);
      setEditNotes(nextEvent?.notes ?? '');
      setEditPhotoAttached(Boolean(nextEvent?.photoUrl));
      setEditWhen('keep');
      setIsLoading(false);
    };

    loadEvent().catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, [eventId]);

  const handleSave = async () => {
    if (!event) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const nextPhotoUrl = editPhotoAttached
        ? (event.photoUrl ?? createLocalAttachmentUri(event.type))
        : null;
      let nextOccurredAt = event.occurredAt;

      if (editWhen !== 'keep') {
        nextOccurredAt = resolveDetailWhenTimestamp(editWhen);
      }

      let nextDetails: Json | undefined;

      if (event.type === 'mood') {
        nextDetails = {
          energy: editEnergy,
          mood: editMood,
        };
      }

      if (event.type === 'behavior') {
        nextDetails = {
          behavior: editBehavior,
          context: editContext ?? undefined,
          duration_min: parseEditDuration(editDuration),
          intensity: editIntensity,
          trigger: editTrigger,
        };
      }

      if (isExpandedCareEventType(event.type)) {
        nextDetails = buildExpandedCareDetails(event.type, editExpandedCare);
      }

      await updateLocalEvent({
        details: nextDetails,
        eventId: event.id,
        notes: normalizeOptionalText(editNotes),
        occurredAt: nextOccurredAt,
        photoUrl: nextPhotoUrl,
      });

      const refreshedEvent = await getLocalEventById(event.id);
      setEvent(refreshedEvent);
      const moodEditState = getMoodEditState(refreshedEvent);
      const behaviorEditState = getBehaviorEditState(refreshedEvent);
      const expandedCareEditState =
        refreshedEvent && isExpandedCareEventType(refreshedEvent.type)
          ? getExpandedCareFormStateFromDetails(
              refreshedEvent.type,
              refreshedEvent.details,
            )
          : defaultExpandedCareFormState;
      setEditMood(moodEditState.mood);
      setEditEnergy(moodEditState.energy);
      setEditBehavior(behaviorEditState.behavior);
      setEditTrigger(behaviorEditState.trigger);
      setEditIntensity(behaviorEditState.intensity);
      setEditDuration(behaviorEditState.duration);
      setEditContext(behaviorEditState.context);
      setEditExpandedCare(expandedCareEditState);
      setEditNotes(refreshedEvent?.notes ?? '');
      setEditPhotoAttached(Boolean(refreshedEvent?.photoUrl));
      setEditWhen('keep');
      setIsEditing(false);
      await HapticManager.medium();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to update this event.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event) {
      return;
    }

    await deleteLocalEvent(event.id);
    router.replace('/timeline');
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.card}>
          <Text style={styles.value}>Loading event from this device...</Text>
        </View>
      );
    }

    if (!event) {
      return (
        <View style={styles.card}>
          <Text style={styles.errorText}>
            This local Timeline event could not be found.
          </Text>
        </View>
      );
    }

    const presentation = getEventPresentation(event);
    const detailRows = buildEventDetailRows(event);
    const loggedByHouseholdMember =
      barklogUser?.id && event.userId !== barklogUser.id;

    return (
      <>
        <View style={styles.hero}>
          <EventIcon event={event} />
          <Text style={[styles.title, { color: presentation.titleColor }]}>
            {presentation.title}
          </Text>
          <Text style={styles.timestamp}>
            {formatEventDateTime(event.occurredAt)}
          </Text>
          {loggedByHouseholdMember ? (
            <Text style={styles.timestamp}>Logged by household member</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          {detailRows.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.value}>{row.value}</Text>
            </View>
          ))}
        </View>

        {isEditing ? (
          <>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>When</Text>
                <LogSegmentedControl
                  value={editWhen}
                  options={EDIT_WHEN_OPTIONS}
                  onChange={(value) => setEditWhen(value as EditWhenValue)}
                />
              </View>

              {event.type === 'mood' ? (
                <>
                  <View style={styles.row}>
                    <Text style={styles.label}>Mood</Text>
                    <View style={styles.chipWrap}>
                      {MOOD_OPTIONS.map((option) => (
                        <View key={option.value} style={styles.moodChip}>
                          <OnboardingChoiceChip
                            label={option.label}
                            leading={renderMoodEmoji(option.emoji)}
                            selected={editMood === option.value}
                            backgroundColor="#FFFCFA"
                            borderColor="#DDD8D2"
                            labelColor="#263136"
                            selectedBackgroundColor="#F5F0FF"
                            selectedBorderColor="#4A3580"
                            selectedLabelColor="#4A3580"
                            onPress={() => setEditMood(option.value)}
                          />
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Energy</Text>
                    <View style={styles.energyRow}>
                      {MOOD_ENERGY_OPTIONS.map((option) => (
                        <View key={option.value} style={styles.energyItem}>
                          <OnboardingChoiceChip
                            label={option.label}
                            selected={editEnergy === option.value}
                            backgroundColor="#FFFCFA"
                            borderColor="#DDD8D2"
                            labelColor="#263136"
                            selectedBackgroundColor="#0A0A0A"
                            selectedBorderColor="#0A0A0A"
                            selectedLabelColor="#FAFAFA"
                            onPress={() => setEditEnergy(option.value)}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              ) : null}

              {event.type === 'behavior' ? (
                <>
                  <View style={styles.row}>
                    <Text style={styles.label}>Behavior</Text>
                    <View style={styles.chipWrap}>
                      {BEHAVIOR_OPTIONS.map((option) => (
                        <View key={option.value} style={styles.moodChip}>
                          <OnboardingChoiceChip
                            label={option.label}
                            selected={editBehavior === option.value}
                            backgroundColor="#FFFCFA"
                            borderColor="#DDD8D2"
                            labelColor="#263136"
                            selectedBackgroundColor="#FFF5EC"
                            selectedBorderColor="#7A4510"
                            selectedLabelColor="#7A4510"
                            onPress={() => setEditBehavior(option.value)}
                          />
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Trigger</Text>
                    <View style={styles.chipWrap}>
                      {BEHAVIOR_TRIGGER_OPTIONS.map((option) => (
                        <View key={option.value} style={styles.moodChip}>
                          <OnboardingChoiceChip
                            label={option.label}
                            selected={editTrigger === option.value}
                            backgroundColor="#FFFCFA"
                            borderColor="#DDD8D2"
                            labelColor="#263136"
                            selectedBackgroundColor="#FFF5EC"
                            selectedBorderColor="#7A4510"
                            selectedLabelColor="#7A4510"
                            onPress={() => setEditTrigger(option.value)}
                          />
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Intensity</Text>
                    <View style={styles.energyRow}>
                      {BEHAVIOR_INTENSITY_OPTIONS.map((option) => (
                        <View key={option.value} style={styles.energyItem}>
                          <OnboardingChoiceChip
                            label={option.label}
                            selected={editIntensity === option.value}
                            backgroundColor="#FFFCFA"
                            borderColor="#DDD8D2"
                            labelColor="#263136"
                            selectedBackgroundColor="#0A0A0A"
                            selectedBorderColor="#0A0A0A"
                            selectedLabelColor="#FAFAFA"
                            onPress={() => setEditIntensity(option.value)}
                          />
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Duration</Text>
                    <TextInput
                      value={editDuration}
                      keyboardType="number-pad"
                      placeholder="Minutes"
                      placeholderTextColor="#B4ADA7"
                      style={styles.inlineInput}
                      onChangeText={setEditDuration}
                    />
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Context</Text>
                    <View style={styles.chipWrap}>
                      {BEHAVIOR_CONTEXT_OPTIONS.map((option) => (
                        <View key={option.value} style={styles.moodChip}>
                          <OnboardingChoiceChip
                            label={getBehaviorContextLabel(option.value)}
                            selected={editContext === option.value}
                            backgroundColor="#FFFCFA"
                            borderColor="#DDD8D2"
                            labelColor="#263136"
                            selectedBackgroundColor="#FFF5EC"
                            selectedBorderColor="#7A4510"
                            selectedLabelColor="#7A4510"
                            onPress={() =>
                              setEditContext((current) =>
                                current === option.value ? null : option.value,
                              )
                            }
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              ) : null}

              {isExpandedCareEventType(event.type) ? (
                <>
                  {event.type === 'water' ? (
                    <>
                      <View style={styles.row}>
                        <Text style={styles.label}>Source</Text>
                        <ExpandedCareChoiceGrid
                          options={WATER_SOURCE_OPTIONS}
                          selected={editExpandedCare.waterSource}
                          onSelect={(value) =>
                            updateExpandedCareEditState(setEditExpandedCare, {
                              waterSource: value,
                            })
                          }
                        />
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.label}>Amount</Text>
                        <TextInput
                          value={editExpandedCare.amountOz}
                          keyboardType="number-pad"
                          placeholder="Ounces"
                          placeholderTextColor="#B4ADA7"
                          style={styles.inlineInput}
                          onChangeText={(value) =>
                            updateExpandedCareEditState(setEditExpandedCare, {
                              amountOz: value,
                            })
                          }
                        />
                      </View>
                    </>
                  ) : null}

                  {event.type === 'rest' ? (
                    <>
                      <View style={styles.row}>
                        <Text style={styles.label}>Quality</Text>
                        <ExpandedCareChoiceGrid
                          options={REST_QUALITY_OPTIONS}
                          selected={editExpandedCare.restQuality}
                          onSelect={(value) =>
                            updateExpandedCareEditState(setEditExpandedCare, {
                              restQuality: value,
                            })
                          }
                        />
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.label}>Duration</Text>
                        <TextInput
                          value={editExpandedCare.restDurationMin}
                          keyboardType="number-pad"
                          placeholder="Minutes"
                          placeholderTextColor="#B4ADA7"
                          style={styles.inlineInput}
                          onChangeText={(value) =>
                            updateExpandedCareEditState(setEditExpandedCare, {
                              restDurationMin: value,
                            })
                          }
                        />
                      </View>
                    </>
                  ) : null}

                  {event.type === 'vomit' ? (
                    <>
                      <View style={styles.row}>
                        <Text style={styles.label}>Appearance</Text>
                        <ExpandedCareChoiceGrid
                          options={VOMIT_APPEARANCE_OPTIONS}
                          selected={editExpandedCare.vomitAppearance}
                          onSelect={(value) =>
                            updateExpandedCareEditState(setEditExpandedCare, {
                              vomitAppearance: value,
                            })
                          }
                        />
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.label}>Frequency</Text>
                        <ExpandedCareChoiceGrid
                          options={VOMIT_FREQUENCY_OPTIONS}
                          selected={editExpandedCare.vomitFrequency}
                          onSelect={(value) =>
                            updateExpandedCareEditState(setEditExpandedCare, {
                              vomitFrequency: value,
                            })
                          }
                        />
                      </View>
                    </>
                  ) : null}

                  {event.type === 'cough_sneeze' ? (
                    <>
                      <View style={styles.row}>
                        <Text style={styles.label}>Type</Text>
                        <ExpandedCareChoiceGrid
                          options={COUGH_SNEEZE_TYPE_OPTIONS}
                          selected={editExpandedCare.coughSneezeType}
                          onSelect={(value) =>
                            updateExpandedCareEditState(setEditExpandedCare, {
                              coughSneezeType: value,
                            })
                          }
                        />
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.label}>Frequency</Text>
                        <ExpandedCareChoiceGrid
                          options={COUGH_SNEEZE_FREQUENCY_OPTIONS}
                          selected={editExpandedCare.coughSneezeFrequency}
                          onSelect={(value) =>
                            updateExpandedCareEditState(setEditExpandedCare, {
                              coughSneezeFrequency: value,
                            })
                          }
                        />
                      </View>
                    </>
                  ) : null}

                  {event.type === 'mobility' ? (
                    <>
                      <View style={styles.row}>
                        <Text style={styles.label}>Observation</Text>
                        <ExpandedCareChoiceGrid
                          options={MOBILITY_OBSERVATION_OPTIONS}
                          selected={editExpandedCare.mobilityObservation}
                          onSelect={(value) =>
                            updateExpandedCareEditState(setEditExpandedCare, {
                              mobilityObservation: value,
                            })
                          }
                        />
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.label}>Severity</Text>
                        <ExpandedCareChoiceGrid
                          options={OBSERVATION_SEVERITY_OPTIONS}
                          selected={editExpandedCare.mobilitySeverity}
                          onSelect={(value) =>
                            updateExpandedCareEditState(setEditExpandedCare, {
                              mobilitySeverity:
                                editExpandedCare.mobilitySeverity === value
                                  ? null
                                  : value,
                            })
                          }
                        />
                      </View>
                    </>
                  ) : null}

                  {event.type === 'appetite' ? (
                    <View style={styles.row}>
                      <Text style={styles.label}>Appetite</Text>
                      <ExpandedCareChoiceGrid
                        options={APPETITE_OPTIONS}
                        selected={editExpandedCare.appetite}
                        onSelect={(value) =>
                          updateExpandedCareEditState(setEditExpandedCare, {
                            appetite: value,
                          })
                        }
                      />
                    </View>
                  ) : null}

                  {event.type === 'dental' ? (
                    <View style={styles.row}>
                      <Text style={styles.label}>Action</Text>
                      <ExpandedCareChoiceGrid
                        options={DENTAL_ACTION_OPTIONS}
                        selected={editExpandedCare.dentalAction}
                        onSelect={(value) =>
                          updateExpandedCareEditState(setEditExpandedCare, {
                            dentalAction: value,
                          })
                        }
                      />
                    </View>
                  ) : null}

                  {event.type === 'parasite_prevention' ? (
                    <>
                      <View style={styles.row}>
                        <Text style={styles.label}>Prevention type</Text>
                        <ExpandedCareChoiceGrid
                          options={PARASITE_PREVENTION_OPTIONS}
                          selected={editExpandedCare.parasitePreventionType}
                          onSelect={(value) =>
                            updateExpandedCareEditState(setEditExpandedCare, {
                              parasitePreventionType: value,
                            })
                          }
                        />
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.label}>Product</Text>
                        <TextInput
                          value={editExpandedCare.parasiteProductName}
                          placeholder="Optional"
                          placeholderTextColor="#B4ADA7"
                          style={styles.inlineInput}
                          onChangeText={(value) =>
                            updateExpandedCareEditState(setEditExpandedCare, {
                              parasiteProductName: value,
                            })
                          }
                        />
                      </View>
                    </>
                  ) : null}

                  {event.type === 'vet_visit' ? (
                    <>
                      <View style={styles.row}>
                        <Text style={styles.label}>Visit type</Text>
                        <ExpandedCareChoiceGrid
                          options={VET_VISIT_TYPE_OPTIONS}
                          selected={editExpandedCare.vetVisitType}
                          onSelect={(value) =>
                            updateExpandedCareEditState(setEditExpandedCare, {
                              vetVisitType: value,
                            })
                          }
                        />
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.label}>Clinic</Text>
                        <TextInput
                          value={editExpandedCare.vetClinicName}
                          placeholder="Optional"
                          placeholderTextColor="#B4ADA7"
                          style={styles.inlineInput}
                          onChangeText={(value) =>
                            updateExpandedCareEditState(setEditExpandedCare, {
                              vetClinicName: value,
                            })
                          }
                        />
                      </View>
                    </>
                  ) : null}
                </>
              ) : null}

              <View style={styles.row}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  value={editNotes}
                  multiline
                  placeholder="Add notes..."
                  placeholderTextColor="#B4ADA7"
                  style={styles.input}
                  onChangeText={setEditNotes}
                />
              </View>

              <LogMediaUploadButton
                label="Add Photo"
                selected={editPhotoAttached}
                onPress={() => setEditPhotoAttached((current) => !current)}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.actionRow}>
              <View style={styles.actionItem}>
                <PrimaryButton
                  label="Cancel"
                  backgroundColor="#FFFCFA"
                  borderColor="#DDD8D2"
                  labelColor="#263136"
                  onPress={() => {
                    const moodEditState = getMoodEditState(event);
                    const behaviorEditState = getBehaviorEditState(event);
                    const expandedCareEditState = isExpandedCareEventType(
                      event.type,
                    )
                      ? getExpandedCareFormStateFromDetails(
                          event.type,
                          event.details,
                        )
                      : defaultExpandedCareFormState;
                    setEditMood(moodEditState.mood);
                    setEditEnergy(moodEditState.energy);
                    setEditBehavior(behaviorEditState.behavior);
                    setEditTrigger(behaviorEditState.trigger);
                    setEditIntensity(behaviorEditState.intensity);
                    setEditDuration(behaviorEditState.duration);
                    setEditContext(behaviorEditState.context);
                    setEditExpandedCare(expandedCareEditState);
                    setEditNotes(event.notes ?? '');
                    setEditPhotoAttached(Boolean(event.photoUrl));
                    setEditWhen('keep');
                    setIsEditing(false);
                  }}
                />
              </View>
              <View style={styles.actionItem}>
                <PrimaryButton
                  label={isSaving ? 'Saving...' : 'Save edits'}
                  disabled={isSaving}
                  onPress={() => {
                    handleSave().catch(() => undefined);
                  }}
                />
              </View>
            </View>
          </>
        ) : (
          <PrimaryButton
            label="Edit event"
            onPress={() => setIsEditing(true)}
          />
        )}

        <Pressable
          accessibilityRole="button"
          style={styles.deleteButton}
          onPress={() => {
            handleDelete().catch(() => undefined);
          }}
        >
          <Text style={styles.deleteText}>Delete event</Text>
        </Pressable>
      </>
    );
  };

  return (
    <LogDetailLayout title="Event Detail" onBackPress={() => router.back()}>
      <View style={styles.stack}>{renderBody()}</View>
    </LogDetailLayout>
  );
}
