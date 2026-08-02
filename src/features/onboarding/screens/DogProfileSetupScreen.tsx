import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useOnboardingDraftStore } from '@/stores';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { OnboardingChoiceChip } from '../components/OnboardingChoiceChip';
import { SearchIcon } from '../components/OnboardingIcons';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { OnboardingLineField } from '../components/OnboardingLineField';
import { OnboardingPhotoButton } from '../components/OnboardingPhotoButton';

const styles = StyleSheet.create({
  form: {
    gap: 24,
  },
  photoWrap: {
    marginBottom: 4,
  },
  doubleRow: {
    flexDirection: 'row',
    gap: 24,
  },
  halfField: {
    flex: 1,
  },
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unitOption: {
    paddingVertical: 6,
  },
  unitText: {
    color: '#A79F98',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
  },
  unitTextActive: {
    color: '#0A0A0A',
  },
  sectionLabel: {
    color: '#0A0A0A',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 1.1,
  },
  chipGrid: {
    gap: 12,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chipCell: {
    flex: 1,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDD8D2',
    marginTop: 14,
  },
  actions: {
    marginTop: 18,
  },
});

function WeightUnitToggle({
  value,
  onChange,
}: {
  value: 'lb' | 'kg';
  onChange: (next: 'lb' | 'kg') => void;
}) {
  return (
    <View style={styles.unitToggle}>
      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        style={styles.unitOption}
        onPress={() => onChange('lb')}
      >
        <Text
          style={[
            styles.unitText,
            value === 'lb' ? styles.unitTextActive : null,
          ]}
        >
          lb
        </Text>
      </Pressable>
      <Text style={styles.unitText}>/</Text>
      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        style={styles.unitOption}
        onPress={() => onChange('kg')}
      >
        <Text
          style={[
            styles.unitText,
            value === 'kg' ? styles.unitTextActive : null,
          ]}
        >
          kg
        </Text>
      </Pressable>
    </View>
  );
}

export default function DogProfileSetupScreen() {
  const router = useRouter();
  const { age, breed, name, patchDraft, sex, status, weight, weightUnit } =
    useOnboardingDraftStore((state) => ({
      age: state.age,
      breed: state.breed,
      name: state.name,
      patchDraft: state.patchDraft,
      sex: state.sex,
      status: state.status,
      weight: state.weight,
      weightUnit: state.weightUnit,
    }));

  const handleSelectMale = () => {
    patchDraft({
      sex: 'male',
      status: status === 'spayed' ? null : status,
    });
  };

  const handleSelectFemale = () => {
    patchDraft({
      sex: 'female',
      status: status === 'neutered' ? null : status,
    });
  };

  const handleSelectNeutered = () => {
    patchDraft({
      sex: 'male',
      status: status === 'neutered' ? null : 'neutered',
    });
  };

  const handleSelectSpayed = () => {
    patchDraft({
      sex: 'female',
      status: status === 'spayed' ? null : 'spayed',
    });
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={4}
      title="Tell us about your dog"
      subtitle="Let's start building their living archive."
      surfaceVariant="card"
    >
      <View style={styles.form}>
        <View style={styles.photoWrap}>
          <OnboardingPhotoButton />
        </View>

        <OnboardingLineField
          label="NAME"
          value={name}
          placeholder="e.g. Bella"
          onChangeText={(next) => patchDraft({ name: next })}
        />

        <OnboardingLineField
          label="BREED"
          value={breed}
          placeholder="Search breed..."
          trailing={<SearchIcon />}
          onChangeText={(next) => patchDraft({ breed: next })}
        />

        <View style={styles.doubleRow}>
          <View style={styles.halfField}>
            <OnboardingLineField
              label="AGE (YEARS)"
              value={age}
              keyboardType="numeric"
              placeholder="0"
              onChangeText={(next) => patchDraft({ age: next })}
            />
          </View>

          <View style={styles.halfField}>
            <OnboardingLineField
              label="WEIGHT"
              value={weight}
              keyboardType="numeric"
              placeholder="0.0"
              headerAccessory={
                <WeightUnitToggle
                  value={weightUnit}
                  onChange={(next) => patchDraft({ weightUnit: next })}
                />
              }
              onChangeText={(next) => patchDraft({ weight: next })}
            />
          </View>
        </View>

        <View style={styles.chipGrid}>
          <Text style={styles.sectionLabel}>SEX &amp; STATUS</Text>

          <View style={styles.chipRow}>
            <View style={styles.chipCell}>
              <OnboardingChoiceChip
                label="Male"
                selected={sex === 'male'}
                onPress={handleSelectMale}
              />
            </View>
            <View style={styles.chipCell}>
              <OnboardingChoiceChip
                label="Female"
                selected={sex === 'female'}
                onPress={handleSelectFemale}
              />
            </View>
          </View>

          <View style={styles.chipRow}>
            <View style={styles.chipCell}>
              <OnboardingChoiceChip
                label="Neutered"
                selected={status === 'neutered'}
                onPress={handleSelectNeutered}
              />
            </View>
            <View style={styles.chipCell}>
              <OnboardingChoiceChip
                label="Spayed"
                selected={status === 'spayed'}
                onPress={handleSelectSpayed}
              />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.actions}>
          <PrimaryButton
            label="Next"
            disabled={!name.trim()}
            onPress={() => router.replace('/(onboarding)/permissions')}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}
