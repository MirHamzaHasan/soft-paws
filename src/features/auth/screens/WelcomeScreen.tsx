import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { PawIcon } from '../../onboarding/components/OnboardingIcons';
import { AuthWelcomeLayout } from '../components/AuthWelcomeLayout';

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: 12,
  },
  accountLink: {
    color: '#0A0A0A',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <AuthWelcomeLayout
      hero={
        <View style={styles.hero}>
          <PawIcon size={80} />
        </View>
      }
      title="BarkLog"
      subtitle="Daily dog health, in one tap."
      footerNote="By continuing, you agree to our terms of service and privacy policy."
    >
      <View style={styles.actions}>
        <PrimaryButton
          label="Get started"
          onPress={() => router.replace('/(auth)/sign-up')}
        />

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(auth)/sign-in')}
        >
          <Text style={styles.accountLink}>I already have an account</Text>
        </Pressable>
      </View>
    </AuthWelcomeLayout>
  );
}
