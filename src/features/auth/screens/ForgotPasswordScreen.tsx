import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { sendPasswordResetEmail } from '@/api';
import { BarklogStatusBanner } from '@/components/ui';
import HapticManager from '@/managers/HapticManager';
import { getBarklogErrorMessage } from '@/utils/barklogErrorMessages';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { AuthField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';
import { AUTH_COLORS } from '../components/authTheme';

const styles = StyleSheet.create({
  form: {
    gap: 32,
  },
  actions: {
    marginTop: 0,
  },
});

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handlePasswordReset = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      const message = 'Enter your email to receive a reset link';

      setSubmitError(message);
      setEmailSent(false);
      await HapticManager.warning();
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setEmailSent(false);

    try {
      await sendPasswordResetEmail(normalizedEmail);
      setEmailSent(true);
      await HapticManager.success();
    } catch (error) {
      const message = getBarklogErrorMessage(error, {
        domain: 'auth',
        fallback: 'Unable to send reset email right now.',
      });

      setSubmitError(message);
      await HapticManager.error();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="We'll send a reset link to your email."
      heroAlign="left"
      heroTopSpacing={0}
      bodyTopSpacing={48}
      centerContent
      onBackPress={() => router.replace('/(auth)/sign-in')}
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
          placeholderTextColor={AUTH_COLORS.inputDefault}
          variant="filled"
          labelColor={AUTH_COLORS.textPrimary}
          inputColor={AUTH_COLORS.inputDefault}
          onChangeText={setEmail}
        />

        {emailSent ? (
          <BarklogStatusBanner
            tone="success"
            title="Check your email"
            description={`We sent a reset link to ${email.trim().toLowerCase()}.`}
          />
        ) : null}

        {submitError ? (
          <BarklogStatusBanner
            tone="danger"
            title="Reset link not sent"
            description={submitError}
          />
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label={submitting ? 'Sending link...' : 'Send reset link'}
            disabled={submitting}
            onPress={() => {
              handlePasswordReset().catch(() => undefined);
            }}
          />
        </View>
      </View>
    </AuthLayout>
  );
}
