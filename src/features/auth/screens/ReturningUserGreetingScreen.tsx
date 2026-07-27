import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { HomeAvatar } from '../../home/components/HomeAvatar';
import { PawIcon } from '../../onboarding/components/OnboardingIcons';
import { ReturningActionCard } from '../components/ReturningActionCard';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  screen: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  top: {
    gap: 28,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 70,
    lineHeight: 76,
    fontWeight: '300',
    letterSpacing: -2.4,
  },
  subtitle: {
    color: '#5D656D',
    fontSize: 22,
    lineHeight: 42,
    fontWeight: '400',
  },
  cardStack: {
    gap: 22,
    marginTop: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#DEDAD6',
  },
  footerText: {
    color: '#5D656D',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    textAlign: 'center',
  },
  bottom: {
    gap: 20,
  },
});

export default function ReturningUserGreetingScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'right', 'bottom', 'left']}
      >
        <View style={styles.screen}>
          <View style={styles.top}>
            <PawIcon size={30} />
            <Text style={styles.title}>
              Welcome back,{'\n'}Sarah & Barnaby.
            </Text>
            <Text style={styles.subtitle}>
              It&apos;s been a while. Let&apos;s make sure everything is up to
              date before we continue the log.
            </Text>

            <View style={styles.cardStack}>
              <ReturningActionCard
                title="Update Profile"
                body="Review weight, diet, and daily routine settings for Barnaby."
                leading={
                  <HomeAvatar emoji="🐶" backgroundColor="#3E2B1E" size={78} />
                }
                onPress={() => router.push('/profile')}
              />
              <ReturningActionCard
                title="What's New"
                body="Discover the latest features in The Living Archive since your last visit."
                leading={
                  <HomeAvatar emoji="🧭" backgroundColor="#F1F5F6" size={78} />
                }
                onPress={() => router.push('/memory-book')}
              />
            </View>
          </View>

          <View style={styles.bottom}>
            <View style={styles.divider} />
            <Text style={styles.footerText}>
              Looks good? Skip directly to your timeline.
            </Text>
            <PrimaryButton
              label="Continue to Timeline"
              size="large"
              onPress={() => router.replace('/timeline')}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
