import { useRouter } from 'expo-router';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BarklogStatusBanner } from '@/components/ui';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import {
  APPETITE_OPTIONS,
  COUGH_SNEEZE_FREQUENCY_OPTIONS,
  COUGH_SNEEZE_TYPE_OPTIONS,
  DENTAL_ACTION_OPTIONS,
  type ExpandedCareEventType,
  getExpandedCareEventDescription,
  getExpandedCareEventEmoji,
  getExpandedCareEventLabel,
  getExpandedCareEventSafetyNote,
  MOBILITY_OBSERVATION_OPTIONS,
  OBSERVATION_SEVERITY_OPTIONS,
  PARASITE_PREVENTION_OPTIONS,
  REST_QUALITY_OPTIONS,
  VET_VISIT_TYPE_OPTIONS,
  VOMIT_APPEARANCE_OPTIONS,
  VOMIT_FREQUENCY_OPTIONS,
  WATER_SOURCE_OPTIONS,
} from '@/types/events';

import { OnboardingChoiceChip } from '../../onboarding/components/OnboardingChoiceChip';
import { LogBoxField } from '../components/LogBoxField';
import { LogDetailLayout } from '../components/LogDetailLayout';
import { LogMediaUploadButton } from '../components/LogMediaUploadButton';
import { LogNotesCard } from '../components/LogNotesCard';
import { LogSegmentedControl } from '../components/LogSegmentedControl';
import {
  createLocalAttachmentUri,
  DETAIL_WHEN_OPTIONS,
  type DetailWhenValue,
  normalizeOptionalText,
  resolveDetailWhenTimestamp,
  useDetailedEventSave,
} from '../hooks/useDetailedEventSave';
import {
  buildExpandedCareDetails,
  defaultExpandedCareFormState,
  type ExpandedCareFormState,
} from '../utils/expandedCareDetails';

type LogExpandedCareDetailScreenProps = {
  eventType: ExpandedCareEventType;
};

const styles = StyleSheet.create({
  content: {
    gap: 30,
  },
  hero: {
    gap: 8,
  },
  emoji: {
    fontSize: 36,
    lineHeight: 42,
  },
  title: {
    color: '#263136',
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '400',
    letterSpacing: -1,
  },
  subtitle: {
    color: '#5F6670',
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
  },
  section: {
    gap: 16,
  },
  sectionLabel: {
    color: '#263136',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chipItem: {
    minWidth: 118,
    flexGrow: 1,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  splitItem: {
    flex: 1,
  },
  safetyCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEDCB4',
    backgroundColor: '#FFF7E7',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  safetyText: {
    color: '#6F4A0C',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  safetyAction: {
    color: '#A8342A',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  action: {
    marginTop: 8,
    gap: 14,
  },
  errorText: {
    color: '#B02921',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
});

function updateFormState(
  setFormState: Dispatch<SetStateAction<ExpandedCareFormState>>,
  patch: Partial<ExpandedCareFormState>,
) {
  setFormState((current) => ({
    ...current,
    ...patch,
  }));
}

function ChoiceGrid<TValue extends string>({
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
        <View key={option.value} style={styles.chipItem}>
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

export default function LogExpandedCareDetailScreen({
  eventType,
}: LogExpandedCareDetailScreenProps) {
  const router = useRouter();
  const { canSave, error, isSaving, saveEvent } = useDetailedEventSave();
  const [when, setWhen] = useState<DetailWhenValue>('just-now');
  const [formState, setFormState] = useState<ExpandedCareFormState>(
    defaultExpandedCareFormState,
  );
  const [notes, setNotes] = useState('');
  const [photoAttached, setPhotoAttached] = useState(false);
  const label = getExpandedCareEventLabel(eventType);
  const safetyNote = getExpandedCareEventSafetyNote(eventType);

  const handleSave = async () => {
    try {
      const event = await saveEvent({
        details: buildExpandedCareDetails(eventType, formState),
        notes: normalizeOptionalText(notes),
        occurredAt: resolveDetailWhenTimestamp(when),
        photoUrl: photoAttached ? createLocalAttachmentUri(eventType) : null,
        type: eventType,
      });

      router.replace(`/event/${event.id}`);
    } catch {
      // The shared save hook exposes the error inline.
    }
  };

  return (
    <LogDetailLayout title={`Log ${label}`} onBackPress={() => router.back()}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.emoji}>
            {getExpandedCareEventEmoji(eventType)}
          </Text>
          <Text style={styles.title}>{label}</Text>
          <Text style={styles.subtitle}>
            {getExpandedCareEventDescription(eventType)}
          </Text>
        </View>

        {safetyNote ? (
          <View style={styles.safetyCard}>
            <Text style={styles.safetyText}>{safetyNote}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/emergency')}
            >
              <Text style={styles.safetyAction}>Open Emergency / SOS</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>When</Text>
          <LogSegmentedControl
            value={when}
            variant="split"
            size="large"
            options={DETAIL_WHEN_OPTIONS}
            onChange={(value) => setWhen(value as DetailWhenValue)}
          />
        </View>

        {eventType === 'water' ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Source</Text>
              <ChoiceGrid
                options={WATER_SOURCE_OPTIONS}
                selected={formState.waterSource}
                onSelect={(value) =>
                  updateFormState(setFormState, { waterSource: value })
                }
              />
            </View>
            <LogBoxField
              label="Amount"
              unitLabel="oz"
              value={formState.amountOz}
              keyboardType="number-pad"
              placeholder="8"
              onChangeText={(value) =>
                updateFormState(setFormState, { amountOz: value })
              }
            />
          </>
        ) : null}

        {eventType === 'rest' ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Quality</Text>
              <ChoiceGrid
                options={REST_QUALITY_OPTIONS}
                selected={formState.restQuality}
                onSelect={(value) =>
                  updateFormState(setFormState, { restQuality: value })
                }
              />
            </View>
            <LogBoxField
              label="Duration"
              unitLabel="min"
              value={formState.restDurationMin}
              keyboardType="number-pad"
              placeholder="60"
              onChangeText={(value) =>
                updateFormState(setFormState, { restDurationMin: value })
              }
            />
          </>
        ) : null}

        {eventType === 'vomit' ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Appearance</Text>
              <ChoiceGrid
                options={VOMIT_APPEARANCE_OPTIONS}
                selected={formState.vomitAppearance}
                onSelect={(value) =>
                  updateFormState(setFormState, { vomitAppearance: value })
                }
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Frequency</Text>
              <View style={styles.splitRow}>
                {VOMIT_FREQUENCY_OPTIONS.map((option) => (
                  <View key={option.value} style={styles.splitItem}>
                    <OnboardingChoiceChip
                      label={option.label}
                      selected={formState.vomitFrequency === option.value}
                      backgroundColor="#FFFCFA"
                      borderColor="#DDD8D2"
                      labelColor="#263136"
                      selectedBackgroundColor="#0A0A0A"
                      selectedBorderColor="#0A0A0A"
                      selectedLabelColor="#FAFAFA"
                      onPress={() =>
                        updateFormState(setFormState, {
                          vomitFrequency: option.value,
                        })
                      }
                    />
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}

        {eventType === 'cough_sneeze' ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Type</Text>
              <ChoiceGrid
                options={COUGH_SNEEZE_TYPE_OPTIONS}
                selected={formState.coughSneezeType}
                onSelect={(value) =>
                  updateFormState(setFormState, { coughSneezeType: value })
                }
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Frequency</Text>
              <ChoiceGrid
                options={COUGH_SNEEZE_FREQUENCY_OPTIONS}
                selected={formState.coughSneezeFrequency}
                onSelect={(value) =>
                  updateFormState(setFormState, {
                    coughSneezeFrequency: value,
                  })
                }
              />
            </View>
          </>
        ) : null}

        {eventType === 'mobility' ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Observation</Text>
              <ChoiceGrid
                options={MOBILITY_OBSERVATION_OPTIONS}
                selected={formState.mobilityObservation}
                onSelect={(value) =>
                  updateFormState(setFormState, {
                    mobilityObservation: value,
                  })
                }
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Severity</Text>
              <ChoiceGrid
                options={OBSERVATION_SEVERITY_OPTIONS}
                selected={formState.mobilitySeverity}
                onSelect={(value) =>
                  updateFormState(setFormState, {
                    mobilitySeverity:
                      formState.mobilitySeverity === value ? null : value,
                  })
                }
              />
            </View>
          </>
        ) : null}

        {eventType === 'appetite' ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Appetite</Text>
            <ChoiceGrid
              options={APPETITE_OPTIONS}
              selected={formState.appetite}
              onSelect={(value) =>
                updateFormState(setFormState, { appetite: value })
              }
            />
          </View>
        ) : null}

        {eventType === 'dental' ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Action</Text>
            <ChoiceGrid
              options={DENTAL_ACTION_OPTIONS}
              selected={formState.dentalAction}
              onSelect={(value) =>
                updateFormState(setFormState, { dentalAction: value })
              }
            />
          </View>
        ) : null}

        {eventType === 'parasite_prevention' ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Prevention type</Text>
              <ChoiceGrid
                options={PARASITE_PREVENTION_OPTIONS}
                selected={formState.parasitePreventionType}
                onSelect={(value) =>
                  updateFormState(setFormState, {
                    parasitePreventionType: value,
                  })
                }
              />
            </View>
            <LogBoxField
              label="Product"
              value={formState.parasiteProductName}
              placeholder="Optional"
              onChangeText={(value) =>
                updateFormState(setFormState, {
                  parasiteProductName: value,
                })
              }
            />
          </>
        ) : null}

        {eventType === 'vet_visit' ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Visit type</Text>
              <ChoiceGrid
                options={VET_VISIT_TYPE_OPTIONS}
                selected={formState.vetVisitType}
                onSelect={(value) =>
                  updateFormState(setFormState, { vetVisitType: value })
                }
              />
            </View>
            <LogBoxField
              label="Clinic"
              value={formState.vetClinicName}
              placeholder="Optional"
              onChangeText={(value) =>
                updateFormState(setFormState, { vetClinicName: value })
              }
            />
          </>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes</Text>
          <LogNotesCard
            value={notes}
            onChangeText={setNotes}
            placeholder="Add context for this observation..."
            label=""
            showPhotoRow={false}
            minHeight={122}
            borderRadius={18}
          />
          <LogMediaUploadButton
            label="Add Photo"
            selected={photoAttached}
            onPress={() => setPhotoAttached((current) => !current)}
          />
        </View>

        <View style={styles.action}>
          {error ? (
            <BarklogStatusBanner
              tone="danger"
              title={`${label} not saved`}
              description={error}
            />
          ) : null}
          <PrimaryButton
            label={isSaving ? 'Saving...' : `Save ${label}`}
            size="large"
            disabled={!canSave || isSaving}
            onPress={() => {
              handleSave().catch(() => undefined);
            }}
          />
        </View>
      </View>
    </LogDetailLayout>
  );
}
