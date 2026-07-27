import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { signUpWithEmailPassword } from '@/api';
import { BarklogStatusBanner } from '@/components/ui';
import HapticManager from '@/managers/HapticManager';
import { useAuthSessionStore } from '@/stores';
import { getBarklogErrorMessage } from '@/utils/barklogErrorMessages';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { AuthField } from '../components/AuthField';
import {
  ArrowRightIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from '../components/AuthIcons';
import { AuthLayout } from '../components/AuthLayout';
import { AUTH_COLORS } from '../components/authTheme';

const styles = StyleSheet.create({
  form: {
    gap: 30,
  },
  actions: {
    marginTop: 34,
    gap: 26,
  },
  helperTextError: {
    color: '#791F1F',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    marginTop: -18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    color: AUTH_COLORS.textMuted,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
  },
  footerLink: {
    color: AUTH_COLORS.textPrimary,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default function SignUpScreen() {
  const router = useRouter();
  const setSignedIn = useAuthSessionStore((state) => state.setSignedIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const normalizedEmail = email.trim().toLowerCase();
  const emailIsValid = /^\S+@\S+\.\S+$/.test(normalizedEmail);
  const passwordIsValid = password.length >= 8;
  const emailError =
    emailTouched && normalizedEmail.length > 0 && !emailIsValid
      ? 'Enter a valid email address.'
      : null;
  const passwordError =
    passwordTouched && password.length > 0 && !passwordIsValid
      ? 'Password must be at least 8 characters.'
      : null;

  const handleSignUp = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!emailIsValid || !passwordIsValid) {
      const message = 'Fix the highlighted fields to continue';

      setSubmitError(message);
      setSubmitSuccess(null);
      await HapticManager.warning();
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const result = await signUpWithEmailPassword({
        email: normalizedEmail,
        password,
      });

      if (result.requiresEmailConfirmation || !result.bootstrap) {
        const message =
          'Check your email to confirm your account, then sign in.';

        setSubmitSuccess(message);
        await HapticManager.success();
        return;
      }

      setSignedIn(result.bootstrap);
      router.replace(
        result.bootstrap.contactPreferenceStatus === 'required'
          ? '/(onboarding)/contact-preferences'
          : '/(onboarding)/dog-profile',
      );
    } catch (error) {
      const message = getBarklogErrorMessage(error, { domain: 'auth' });

      setSubmitError(message);
      await HapticManager.error();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join The Living Archive to start logging."
      heroAlign="left"
      heroTopSpacing={Platform.select({ web: 80, default: 72 }) ?? 72}
      bodyTopSpacing={Platform.select({ web: 62, default: 56 }) ?? 56}
      onBackPress={() => router.replace('/(auth)/welcome')}
      showTopDivider
    >
      <View style={styles.form}>
        <AuthField
          label="EMAIL ADDRESS"
          value={email}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          leadingIcon={<MailIcon />}
          variant="filled"
          onChangeText={setEmail}
          onBlur={() => setEmailTouched(true)}
        />
        {emailError ? (
          <Text style={styles.helperTextError}>{emailError}</Text>
        ) : null}

        <AuthField
          label="PASSWORD"
          value={password}
          placeholder="password"
          helperText={passwordError ?? 'Must be at least 8 characters.'}
          leadingIcon={<LockIcon />}
          trailing={
            <Pressable
              accessibilityLabel={
                passwordVisible ? 'Hide password' : 'Show password'
              }
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setPasswordVisible((current) => !current)}
            >
              <EyeOffIcon />
            </Pressable>
          }
          secureTextEntry={!passwordVisible}
          variant="filled"
          onChangeText={setPassword}
          onBlur={() => setPasswordTouched(true)}
        />

        {submitError || submitSuccess ? (
          <BarklogStatusBanner
            tone={submitError ? 'danger' : 'success'}
            title={
              submitError ? 'Account not created' : 'Confirmation email sent'
            }
            description={submitError ?? submitSuccess ?? undefined}
          />
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label={submitting ? 'Creating account...' : 'Continue'}
            trailingIcon={<ArrowRightIcon />}
            disabled={submitting}
            onPress={() => {
              handleSignUp().catch(() => undefined);
            }}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/(auth)/sign-in')}
            >
              <Text style={styles.footerLink}>Sign in</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </AuthLayout>
  );
}
