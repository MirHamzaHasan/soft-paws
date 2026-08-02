import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { signInWithEmailPassword } from '@/api';
import { BarklogStatusBanner, useBarklogFeedback } from '@/components/ui';
import HapticManager from '@/managers/HapticManager';
import { useAuthSessionStore } from '@/stores';
import { getBarklogErrorMessage } from '@/utils/barklogErrorMessages';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { AuthField } from '../components/AuthField';
import { EyeOffIcon } from '../components/AuthIcons';
import { AuthLayout } from '../components/AuthLayout';
import { AUTH_COLORS } from '../components/authTheme';

const styles = StyleSheet.create({
  form: {
    gap: 24,
  },
  forgottenRow: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  utilityLink: {
    color: AUTH_COLORS.utility,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  actions: {
    marginTop: 22,
    gap: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    color: AUTH_COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  footerLink: {
    color: AUTH_COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});

function getPostSignInRoute(
  snapshot: Awaited<ReturnType<typeof signInWithEmailPassword>>,
) {
  if (snapshot.onboardingStatus === 'complete') {
    return '/(tabs)' as const;
  }

  if (snapshot.contactPreferenceStatus === 'required') {
    return '/(onboarding)/contact-preferences' as const;
  }

  return '/(onboarding)/dog-profile' as const;
}

export default function SignInScreen() {
  const router = useRouter();
  const feedback = useBarklogFeedback();
  const setSignedIn = useAuthSessionStore((state) => state.setSignedIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSignIn = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      const message = 'Enter your email and password to continue';

      setSubmitError(message);
      feedback.showWarning({
        title: 'Sign-in needs details',
        description: message,
      });
      await HapticManager.warning();
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const snapshot = await signInWithEmailPassword({
        email: normalizedEmail,
        password,
      });

      setSignedIn(snapshot);
      router.replace(getPostSignInRoute(snapshot));
    } catch (error) {
      const message = getBarklogErrorMessage(error, { domain: 'auth' });

      setSubmitError(message);
      feedback.showError({
        title: 'Sign-in failed',
        description: message,
      });
      await HapticManager.error();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your details to sign in to BarkLog."
      heroTopSpacing={0}
      bodyTopSpacing={48}
      centerContent
      onBackPress={() => router.replace('/(auth)/welcome')}
    >
      <View style={styles.form}>
        <AuthField
          label="EMAIL"
          value={email}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="name@example.com"
          onChangeText={setEmail}
        />

        <AuthField
          label="PASSWORD"
          value={password}
          placeholder="password"
          secureTextEntry={!passwordVisible}
          onChangeText={setPassword}
          trailing={
            <Pressable
              accessibilityLabel={
                passwordVisible ? 'Hide password' : 'Show password'
              }
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setPasswordVisible((current) => !current)}
            >
              <EyeOffIcon color="#737373" />
            </Pressable>
          }
        />

        <View style={styles.forgottenRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/(auth)/forgot-password')}
          >
            <Text style={styles.utilityLink}>Forgot password?</Text>
          </Pressable>
        </View>

        {submitError ? (
          <BarklogStatusBanner
            tone="danger"
            title="Sign-in failed"
            description={submitError}
          />
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label={submitting ? 'Signing in...' : 'Sign in'}
            disabled={submitting}
            onPress={() => {
              handleSignIn().catch(() => undefined);
            }}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account?</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/(auth)/sign-up')}
            >
              <Text style={styles.footerLink}>Sign up</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </AuthLayout>
  );
}
