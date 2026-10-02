import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useSyncExternalStore } from 'react';
import { Paragraph, YStack } from 'tamagui';

import {
  BarklogButton,
  BarklogInput,
  BarklogScreenShell,
} from '@/components/ui';
import { AI_FEATURES_ENABLED } from '@/config/featureFlags';
import {
  getFirebaseAiAuthEmail,
  isFirebaseAiAuthConfigured,
  resetFirebaseAiPassword,
  signInFirebaseAi,
  signOutFirebaseAi,
  subscribeFirebaseAiAuth,
} from '@/features/auth/services/firebaseAiAuth';

function AiSignInScreen() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const destination = next === 'insights' ? '/(tabs)/insights' : '/ask-ai';
  const configured = isFirebaseAiAuthConfigured();
  const signedInEmail = useSyncExternalStore(
    subscribeFirebaseAiAuth,
    getFirebaseAiAuthEmail,
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (createAccount: boolean) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await signInFirebaseAi(email, password, createAccount);
      setPassword('');
      router.replace(destination);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Unable to sign in.',
      );
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await resetFirebaseAiPassword(email);
      setNotice('If this email has an account, a reset link has been sent.');
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Unable to send reset email.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <BarklogScreenShell
      title="Connect BarkLog AI"
      subtitle="Sign in with Firebase to use Atlas AI. Your journal stays on this device; AI actions send the selected care summary to Atlas."
    >
      <YStack gap="$md">
        {!configured && (
          <Paragraph color="$textMuted" fontFamily="$body">
            AI sign-in is not configured for this build. Add BarkLog Firebase
            and Atlas public identifiers, then rebuild.
          </Paragraph>
        )}
        {configured && signedInEmail && (
          <>
            <Paragraph color="$textPrimary" fontFamily="$body">
              Signed in as {signedInEmail}
            </Paragraph>
            <BarklogButton
              label="Continue to AI"
              onPress={() => router.replace(destination)}
            />
            <BarklogButton
              label="Sign out of AI"
              tone="secondary"
              onPress={signOutFirebaseAi}
            />
          </>
        )}
        {configured && !signedInEmail && (
          <>
            <BarklogInput
              label="Email"
              accessibilityLabel="Email for AI sign-in"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <BarklogInput
              label="Password"
              accessibilityLabel="Password for AI sign-in"
              autoComplete="password"
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {error ? (
              <Paragraph
                accessibilityRole="alert"
                color="$danger"
                fontFamily="$body"
              >
                {error}
              </Paragraph>
            ) : null}
            {notice ? (
              <Paragraph color="$textMuted" fontFamily="$body">
                {notice}
              </Paragraph>
            ) : null}
            <BarklogButton
              label={busy ? 'Connecting...' : 'Sign in'}
              disabled={busy}
              onPress={() => submit(false)}
            />
            <BarklogButton
              label="Create account"
              tone="secondary"
              disabled={busy}
              onPress={() => submit(true)}
            />
            <BarklogButton
              label="Reset password"
              tone="secondary"
              disabled={busy}
              onPress={resetPassword}
            />
          </>
        )}
        <BarklogButton
          label="Back to journal"
          tone="secondary"
          onPress={() => router.replace('/(tabs)')}
        />
      </YStack>
    </BarklogScreenShell>
  );
}

export default function AiSignInRoute() {
  return AI_FEATURES_ENABLED ? <AiSignInScreen /> : <Redirect href="/(tabs)" />;
}
