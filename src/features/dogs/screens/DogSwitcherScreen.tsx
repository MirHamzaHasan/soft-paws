import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getSelectedDog, useAuthSessionStore } from '@/stores';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { CloseIcon } from '../../auth/components/AuthIcons';
import { hasPremiumAccess } from '../../premium/utils/premiumAccess';
import { openPremiumGate } from '../../premium/utils/premiumNavigation';
import { DogSwitcherRow } from '../components/DogSwitcherRow';
import { DogSwitcherTag } from '../components/DogSwitcherTag';
import {
  formatDogCreatedAt,
  formatDogMeta,
  getDogAvatar,
} from '../utils/dogDisplay';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(24, 24, 24, 0.34)',
  },
  screen: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    minHeight: '72%',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 22,
  },
  grabber: {
    alignSelf: 'center',
    width: 74,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#B7BFC3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E2DC',
  },
  title: {
    color: '#0A0A0A',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '400',
    letterSpacing: -1,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 18,
    paddingVertical: 2,
  },
  emptyCard: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2DED9',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 20,
    paddingVertical: 22,
    gap: 8,
  },
  emptyTitle: {
    color: '#263136',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500',
  },
  emptyBody: {
    color: '#5F6670',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  freeLimitText: {
    color: '#687079',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  spacer: {
    flex: 1,
  },
});

export default function DogSwitcherScreen() {
  const router = useRouter();
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const dogs = useAuthSessionStore((state) => state.dogs);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const setSelectedDogId = useAuthSessionStore(
    (state) => state.setSelectedDogId,
  );
  const premiumAccess = hasPremiumAccess(barklogUser);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const addAnotherDogIsLocked = dogs.length >= 1 && !premiumAccess;

  const handleAddDogPress = () => {
    if (addAnotherDogIsLocked) {
      openPremiumGate(router, 'multi-dog');
      return;
    }

    router.push('/add-dog');
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'right', 'bottom', 'left']}
    >
      <View style={styles.screen}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <Text style={styles.title}>Your dogs</Text>
            <Pressable
              accessibilityRole="button"
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <CloseIcon />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {dogs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No dog profiles yet</Text>
                <Text style={styles.emptyBody}>
                  Add the first profile so BarkLog can keep logs and care notes
                  in the right place.
                </Text>
              </View>
            ) : null}

            {dogs.map((dog, index) => {
              const avatar = getDogAvatar(dog, index);
              const selected = dog.id === selectedDog?.id;

              return (
                <DogSwitcherRow
                  key={dog.id}
                  name={dog.name}
                  meta={formatDogMeta(dog)}
                  avatarEmoji={avatar.emoji}
                  avatarBackgroundColor={avatar.backgroundColor}
                  tag={
                    <DogSwitcherTag
                      label={dog.is_primary ? 'Primary' : 'Profile'}
                      tone={dog.is_primary ? 'walk' : 'meal'}
                    />
                  }
                  trailingMeta={formatDogCreatedAt(dog)}
                  selected={selected}
                  onPress={() => {
                    setSelectedDogId(dog.id);
                    router.back();
                  }}
                />
              );
            })}
          </ScrollView>

          <View style={styles.spacer} />

          {addAnotherDogIsLocked ? (
            <Text style={styles.freeLimitText}>
              Free BarkLog keeps one dog profile. Premium unlocks separate
              profiles, logs, medications, and insights for every dog.
            </Text>
          ) : null}

          <PrimaryButton
            label="+ Add another dog"
            size="large"
            backgroundColor="#FFFCFA"
            borderColor="#0A0A0A"
            labelColor="#0A0A0A"
            onPress={handleAddDogPress}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
