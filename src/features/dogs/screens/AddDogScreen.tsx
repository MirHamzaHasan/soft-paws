import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { createDogForCurrentUser } from '@/api/auth';
import { useAuthSessionStore } from '@/stores';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { OnboardingChoiceChip } from '../../onboarding/components/OnboardingChoiceChip';
import { CameraAddIcon } from '../../onboarding/components/OnboardingIcons';
import { OnboardingLineField } from '../../onboarding/components/OnboardingLineField';
import { OnboardingPhotoButton } from '../../onboarding/components/OnboardingPhotoButton';
import { hasPremiumAccess } from '../../premium/utils/premiumAccess';
import { openPremiumGate } from '../../premium/utils/premiumNavigation';
import { DogEditorLayout } from '../components/DogEditorLayout';

type SexValue = 'male' | 'female';

const styles = StyleSheet.create({
  form: {
    gap: 32,
  },
  photoWrap: {
    marginBottom: 10,
  },
  fieldStack: {
    gap: 24,
  },
  doubleRow: {
    flexDirection: 'row',
    gap: 16,
  },
  halfField: {
    flex: 1,
  },
  sexSection: {
    gap: 12,
  },
  sectionLabel: {
    color: '#6F767D',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 16,
  },
  chipCell: {
    flex: 1,
  },
  actions: {
    marginTop: 8,
    gap: 14,
  },
  helperText: {
    color: '#687079',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  errorText: {
    color: '#B02921',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
});

export default function AddDogScreen() {
  const router = useRouter();
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const dogs = useAuthSessionStore((state) => state.dogs);
  const session = useAuthSessionStore((state) => state.session);
  const setDogs = useAuthSessionStore((state) => state.setDogs);
  const setSelectedDogId = useAuthSessionStore(
    (state) => state.setSelectedDogId,
  );
  const premiumAccess = hasPremiumAccess(barklogUser);
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState<SexValue>('male');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const requiresPremium = dogs.length >= 1 && !premiumAccess;

  useEffect(() => {
    if (requiresPremium) {
      openPremiumGate(router, 'multi-dog');
    }
  }, [requiresPremium, router]);

  if (requiresPremium) {
    return null;
  }

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Dog name is required.');
      return;
    }

    if (!session) {
      setError('Sign in before adding another dog.');
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const result = await createDogForCurrentUser(session, {
        age,
        breed,
        name: trimmedName,
        sex,
        weight,
      });

      setDogs(result.dogs);
      setSelectedDogId(result.dog.id);
      router.replace('/profile');
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to add this dog.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DogEditorLayout
      title="Add another dog"
      onClosePress={() => router.replace('/(tabs)')}
    >
      <View style={styles.form}>
        <View style={styles.photoWrap}>
          <OnboardingPhotoButton
            size={76}
            alignSelf="flex-start"
            accessibilityLabel="Add another dog photo"
            icon={<CameraAddIcon />}
          />
        </View>

        <View style={styles.fieldStack}>
          <OnboardingLineField
            label="NAME"
            labelColor="#6F767D"
            variant="box"
            value={name}
            autoCapitalize="words"
            placeholder="e.g. Bella"
            onChangeText={setName}
          />

          <OnboardingLineField
            label="BREED"
            labelColor="#6F767D"
            variant="box"
            value={breed}
            autoCapitalize="words"
            placeholder="e.g. Golden Retriever"
            onChangeText={setBreed}
          />

          <View style={styles.doubleRow}>
            <View style={styles.halfField}>
              <OnboardingLineField
                label="AGE"
                labelColor="#6F767D"
                variant="box"
                value={age}
                placeholder="Yrs / Mos"
                onChangeText={setAge}
              />
            </View>

            <View style={styles.halfField}>
              <OnboardingLineField
                label="WEIGHT"
                labelColor="#6F767D"
                variant="box"
                value={weight}
                placeholder="kg or lbs"
                onChangeText={setWeight}
              />
            </View>
          </View>
        </View>

        <View style={styles.sexSection}>
          <Text style={styles.sectionLabel}>SEX</Text>

          <View style={styles.chipRow}>
            <View style={styles.chipCell}>
              <OnboardingChoiceChip
                label="Male"
                size="large"
                selected={sex === 'male'}
                onPress={() => setSex('male')}
              />
            </View>

            <View style={styles.chipCell}>
              <OnboardingChoiceChip
                label="Female"
                size="large"
                selected={sex === 'female'}
                onPress={() => setSex('female')}
              />
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Text style={styles.helperText}>
            Free BarkLog includes one dog. Premium keeps each dog&apos;s logs,
            medications, insights, and profile context separate.
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <PrimaryButton
            label={isSaving ? 'Adding Dog...' : 'Add Dog'}
            size="large"
            backgroundColor="#313735"
            disabled={isSaving}
            onPress={() => {
              handleSave().catch(() => undefined);
            }}
          />
        </View>
      </View>
    </DogEditorLayout>
  );
}
