import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BarklogStatusBanner } from '@/components/ui';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { FREE_V1_RELEASE } from '@/config/releaseMode';
import {
  createLocalPhotoBaseline,
  createPhotoBaselineAttachmentUri,
  deleteLocalPhotoBaseline,
  listLocalPhotoBaselinesForDog,
  type PhotoBaselineModel,
} from '@/db';
import { ChevronRightIcon } from '@/features/home/components/HomeIcons';
import { HomeShell } from '@/features/home/components/HomeShell';
import { openPremiumGate } from '@/features/premium/utils/premiumNavigation';
import HapticManager from '@/managers/HapticManager';
import { getSelectedDog, useLocalProfileStore } from '@/stores';
import {
  getPhotoBaselineCategoryOption,
  PHOTO_BASELINE_CATEGORY_OPTIONS,
  type PhotoBaselineCategory,
} from '@/types/photoBaseline';
import { getBarklogErrorMessage } from '@/utils/barklogErrorMessages';

import {
  formatPhotoBaselineCapturedLabel,
  formatPhotoBaselineDateInput,
  getPhotoBaselineLabel,
  normalizePhotoBaselineDateInput,
  sortPhotoBaselinesNewestFirst,
} from '../utils/photoBaselinePresentation';

const styles = StyleSheet.create({
  stack: {
    gap: 22,
  },
  hero: {
    gap: 8,
  },
  overline: {
    color: '#8D867F',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.6,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0A0A0A',
    fontSize: 38,
    fontWeight: '400',
    letterSpacing: -1.1,
    lineHeight: 44,
  },
  body: {
    color: '#5F6670',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#FFFCFA',
    borderColor: '#E4E0DC',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 16,
    padding: 18,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#1F2528',
    flex: 1,
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 26,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderColor: '#DDD8D2',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipSelected: {
    backgroundColor: '#0A0A0A',
    borderColor: '#0A0A0A',
  },
  chipText: {
    color: '#4F575F',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  chipTextSelected: {
    color: '#FFFCFA',
  },
  field: {
    borderBottomColor: '#DDD8D2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    color: '#0A0A0A',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 24,
    minHeight: 52,
    paddingVertical: 10,
  },
  formSection: {
    gap: 10,
  },
  formLabel: {
    color: '#6F777F',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.4,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  helperText: {
    color: '#687079',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  message: {
    color: '#687079',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  error: {
    color: '#A8342A',
  },
  baselineCard: {
    backgroundColor: '#FFFCFA',
    borderColor: '#E4E0DC',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    padding: 16,
  },
  baselineTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  emoji: {
    fontSize: 24,
    lineHeight: 30,
  },
  baselineCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  baselineTitle: {
    color: '#172026',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 23,
  },
  baselineMeta: {
    color: '#697179',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  deleteButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: '#F7C1C1',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  deleteText: {
    color: '#791F1F',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  actionButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: '#D8D4CF',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  actionText: {
    color: '#263136',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  premiumCard: {
    backgroundColor: '#F3F0FB',
    borderColor: '#E2DCEF',
  },
  premiumButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
  },
  scrollRow: {
    marginHorizontal: -4,
  },
  scrollContent: {
    gap: 10,
    paddingHorizontal: 4,
  },
});

const DEFAULT_CATEGORY: PhotoBaselineCategory = 'skin';

function PhotoBaselineRow({
  baseline,
  onDelete,
}: {
  baseline: PhotoBaselineModel;
  onDelete: (baseline: PhotoBaselineModel) => void;
}) {
  const category = getPhotoBaselineCategoryOption(baseline.category);
  const meta = [
    getPhotoBaselineLabel(baseline.category),
    baseline.bodyArea,
    formatPhotoBaselineCapturedLabel(baseline.capturedAt),
  ]
    .filter(Boolean)
    .join(' - ');

  return (
    <View style={styles.baselineCard}>
      <View style={styles.baselineTop}>
        <Text style={styles.emoji}>{category.emoji}</Text>
        <View style={styles.baselineCopy}>
          <Text style={styles.baselineTitle}>{baseline.title}</Text>
          <Text style={styles.baselineMeta}>{meta}</Text>
          {baseline.photoUri ? (
            <Text style={styles.baselineMeta}>Photo reference saved</Text>
          ) : null}
          {baseline.notes ? (
            <Text style={styles.baselineMeta}>{baseline.notes}</Text>
          ) : null}
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        style={styles.deleteButton}
        onPress={() => onDelete(baseline)}
      >
        <Text style={styles.deleteText}>Delete baseline</Text>
      </Pressable>
    </View>
  );
}

export default function PhotoBaselineTrackerScreen() {
  const router = useRouter();
  const dogs = useLocalProfileStore((state) => state.dogs);
  const selectedDogId = useLocalProfileStore((state) => state.selectedDogId);
  const barklogUser = useLocalProfileStore((state) => state.barklogUser);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const [baselines, setBaselines] = useState<PhotoBaselineModel[]>([]);
  const [loadState, setLoadState] = useState<'error' | 'idle' | 'loading'>(
    'loading',
  );
  const [formOpen, setFormOpen] = useState(false);
  const [category, setCategory] =
    useState<PhotoBaselineCategory>(DEFAULT_CATEGORY);
  const [title, setTitle] = useState('');
  const [bodyArea, setBodyArea] = useState('');
  const [capturedDate, setCapturedDate] = useState(
    formatPhotoBaselineDateInput,
  );
  const [photoUri, setPhotoUri] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const sortedBaselines = useMemo(
    () => sortPhotoBaselinesNewestFirst(baselines),
    [baselines],
  );

  const loadPhotoBaselines = useCallback(async () => {
    if (!selectedDog?.id) {
      setBaselines([]);
      setLoadState('idle');
      return;
    }

    setLoadState('loading');

    try {
      const nextBaselines = await listLocalPhotoBaselinesForDog(selectedDog.id);
      setBaselines(nextBaselines);
      setLoadState('idle');
    } catch {
      setLoadState('error');
    }
  }, [selectedDog?.id]);

  useFocusEffect(
    useCallback(() => {
      loadPhotoBaselines().catch(() => setLoadState('error'));
    }, [loadPhotoBaselines]),
  );

  const resetForm = () => {
    setCategory(DEFAULT_CATEGORY);
    setTitle('');
    setBodyArea('');
    setCapturedDate(formatPhotoBaselineDateInput());
    setPhotoUri('');
    setNotes('');
    setError(null);
  };

  const openForm = () => {
    resetForm();
    setFormOpen(true);
    HapticManager.light().catch(() => undefined);
  };

  const handleSave = async () => {
    if (!selectedDog?.id || !barklogUser?.id) {
      setMessage(null);
      setError('Complete BarkLog onboarding before saving photo baselines.');
      return;
    }

    const capturedAt = normalizePhotoBaselineDateInput(capturedDate);

    if (!title.trim()) {
      setMessage(null);
      setError('Baseline title is required.');
      return;
    }

    if (!capturedAt) {
      setMessage(null);
      setError('Use a captured date like 2026-05-02 or 5/2/2026.');
      return;
    }

    setError(null);
    setMessage(null);
    setIsSaving(true);

    try {
      await createLocalPhotoBaseline({
        bodyArea,
        capturedAt,
        category,
        dogId: selectedDog.id,
        notes,
        photoUri,
        title,
        userId: barklogUser.id,
      });

      await HapticManager.success();
      setError(null);
      setMessage('Photo baseline saved on this device.');
      setFormOpen(false);
      resetForm();
      await loadPhotoBaselines();
    } catch (saveError) {
      await HapticManager.error();
      setMessage(null);
      setError(
        getBarklogErrorMessage(saveError, {
          domain: 'local_save',
          fallback: 'Unable to save this photo baseline.',
        }),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (baseline: PhotoBaselineModel) => {
    try {
      await deleteLocalPhotoBaseline(baseline.id);
      await HapticManager.success();
      setError(null);
      setMessage('Photo baseline deleted on this device.');
      await loadPhotoBaselines();
    } catch {
      await HapticManager.error();
      setMessage(null);
      setError('Unable to delete this photo baseline right now.');
    }
  };

  const attachLocalReference = () => {
    setPhotoUri(createPhotoBaselineAttachmentUri(category));
    HapticManager.selectionChange().catch(() => undefined);
  };

  return (
    <HomeShell
      activeTab="profile"
      tabVariant="care"
      showTabBar={false}
      headerVariant="compact"
      headerTitle="Photo Baselines"
      headerAvatarEmoji="📷"
      headerAvatarBackgroundColor="#263136"
    >
      <View style={styles.stack}>
        <View style={styles.hero}>
          <Text style={styles.overline}>Free local record</Text>
          <Text style={styles.title}>Photo baselines</Text>
          <Text style={styles.body}>
            Save dated visual references for owner observations. BarkLog stores
            these photos as care records, not diagnosis or image analysis.
          </Text>
        </View>

        {message ? (
          <BarklogStatusBanner
            tone="success"
            title="Photo baseline updated"
            description={message}
          />
        ) : null}
        {error ? (
          <BarklogStatusBanner
            tone="danger"
            title="Photo baseline not saved"
            description={error}
          />
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {selectedDog
                ? `${selectedDog.name}'s baselines`
                : 'Photo baselines'}
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.actionButton}
              onPress={openForm}
            >
              <Text style={styles.actionText}>Add baseline</Text>
            </Pressable>
          </View>
          {loadState === 'loading' ? (
            <Text style={styles.helperText}>Loading local baselines...</Text>
          ) : null}
          {loadState === 'error' ? (
            <BarklogStatusBanner
              tone="danger"
              title="Photo baselines unavailable"
              description="Unable to load photo baselines on this device."
            />
          ) : null}
          {loadState === 'idle' && sortedBaselines.length === 0 ? (
            <Text style={styles.helperText}>
              Add a skin, teeth, posture, grooming, or other photo reference to
              make future comparisons easier to organize.
            </Text>
          ) : null}
        </View>

        {formOpen ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>New photo baseline</Text>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scrollRow}
                contentContainerStyle={styles.scrollContent}
              >
                {PHOTO_BASELINE_CATEGORY_OPTIONS.map((option) => {
                  const selected = option.value === category;

                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={[
                        styles.chip,
                        selected ? styles.chipSelected : null,
                      ]}
                      onPress={() => {
                        setCategory(option.value);
                        HapticManager.selectionChange().catch(() => undefined);
                      }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected ? styles.chipTextSelected : null,
                        ]}
                      >
                        {option.emoji} {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Title</Text>
              <TextInput
                accessibilityLabel="Photo baseline title"
                value={title}
                placeholder="e.g., Left front paw reference"
                placeholderTextColor="#A0A6AD"
                style={styles.field}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Body area</Text>
              <TextInput
                accessibilityLabel="Photo baseline body area"
                value={bodyArea}
                placeholder="Optional, e.g., left ear"
                placeholderTextColor="#A0A6AD"
                style={styles.field}
                onChangeText={setBodyArea}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Captured date</Text>
              <TextInput
                accessibilityLabel="Photo baseline captured date"
                value={capturedDate}
                placeholder="2026-05-02"
                placeholderTextColor="#A0A6AD"
                style={styles.field}
                onChangeText={setCapturedDate}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Photo reference</Text>
              <TextInput
                accessibilityLabel="Photo baseline local photo reference"
                value={photoUri}
                placeholder="Optional local photo reference"
                placeholderTextColor="#A0A6AD"
                style={styles.field}
                onChangeText={setPhotoUri}
              />
              <Pressable
                accessibilityRole="button"
                style={styles.chip}
                onPress={attachLocalReference}
              >
                <Text style={styles.chipText}>Use local placeholder</Text>
              </Pressable>
              <Text style={styles.helperText}>
                Native camera and picker capture will be added after permission
                copy is finalized.
              </Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                accessibilityLabel="Photo baseline notes"
                value={notes}
                multiline
                placeholder="Optional owner observation"
                placeholderTextColor="#A0A6AD"
                style={[
                  styles.field,
                  { minHeight: 82, textAlignVertical: 'top' },
                ]}
                onChangeText={setNotes}
              />
            </View>

            <PrimaryButton
              label={isSaving ? 'Saving...' : 'Save photo baseline'}
              size="large"
              disabled={isSaving}
              onPress={() => {
                handleSave().catch(() => undefined);
              }}
            />
          </View>
        ) : null}

        {sortedBaselines.map((baseline) => (
          <PhotoBaselineRow
            key={baseline.id}
            baseline={baseline}
            onDelete={(nextBaseline) => {
              handleDelete(nextBaseline).catch(() => undefined);
            }}
          />
        ))}

        {!FREE_V1_RELEASE ? (
          <Pressable
            accessibilityRole="button"
            style={[styles.card, styles.premiumCard]}
            onPress={() => openPremiumGate(router, 'photo-compare')}
          >
            <View style={styles.cardHeader}>
              <View style={styles.baselineCopy}>
                <Text style={styles.cardTitle}>Compare photo history</Text>
                <Text style={styles.helperText}>
                  Premium helps compare your saved baseline photos over time.
                </Text>
              </View>
              <View style={styles.premiumButton}>
                <Sparkles size={20} />
                <ChevronRightIcon color="#534AB7" />
              </View>
            </View>
          </Pressable>
        ) : null}

        <Text style={styles.helperText}>
          Photo baselines are owner observations for organization and vet
          conversations. BarkLog does not analyze photos or identify conditions
          in this local tracker.
        </Text>
      </View>
    </HomeShell>
  );
}
