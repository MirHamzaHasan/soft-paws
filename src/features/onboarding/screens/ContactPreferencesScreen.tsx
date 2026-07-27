import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type TextInputProps,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  type BarklogContactChannel,
  type BarklogContactGoal,
  saveContactPreferences,
  skipContactPreferences,
  validateContactPreferencesInput,
} from '@/api';
import { BarklogStatusBanner, useBarklogFeedback } from '@/components/ui';
import { captureBarklogError } from '@/features/observability';
import AnalyticsManager from '@/managers/AnalyticsManager';
import HapticManager from '@/managers/HapticManager';
import { useAuthSessionStore } from '@/stores';
import { getBarklogErrorMessage } from '@/utils/barklogErrorMessages';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { ToggleSwitch } from '../../../components/ui/ToggleSwitch';
import { OnboardingChoiceChip } from '../components/OnboardingChoiceChip';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { OnboardingLineField } from '../components/OnboardingLineField';

type ChoiceOption<TValue extends string> = {
  label: string;
  value: TValue;
};

const GOAL_OPTIONS: Array<ChoiceOption<BarklogContactGoal>> = [
  { label: 'Health patterns', value: 'health_patterns' },
  { label: 'Training', value: 'training' },
  { label: 'Medications', value: 'medications' },
  { label: 'Vet prep', value: 'vet_prep' },
  { label: 'Multi-caregiver', value: 'multi_caregiver' },
  { label: 'Other', value: 'other' },
];

const CHANNEL_OPTIONS: Array<ChoiceOption<BarklogContactChannel>> = [
  { label: 'Email', value: 'email' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'SMS', value: 'sms' },
  { label: 'Telegram', value: 'telegram' },
  { label: 'Signal', value: 'signal' },
  { label: 'Other', value: 'other' },
];

const styles = StyleSheet.create({
  actions: {
    gap: 22,
    marginTop: 12,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  choiceItem: {
    width: '48%',
  },
  choiceItemCompact: {
    width: '100%',
  },
  consentCopy: {
    color: '#5F6670',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  consentCopyBlock: {
    flex: 1,
    minWidth: 0,
  },
  consentRow: {
    alignItems: 'center',
    borderBottomColor: '#E7E5E4',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  consentTitle: {
    color: '#0A0A0A',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
  },
  fieldStack: {
    gap: 28,
  },
  helperText: {
    color: '#5F6670',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  privacyNote: {
    color: '#737373',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
  },
  section: {
    gap: 16,
  },
  sectionLabel: {
    color: '#0A0A0A',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.8,
    lineHeight: 16,
  },
  skipRow: {
    alignItems: 'center',
  },
  skipText: {
    color: '#5F6670',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 24,
  },
});

function getChannelKeyboardType(
  channel: BarklogContactChannel,
): TextInputProps['keyboardType'] {
  if (channel === 'sms' || channel === 'whatsapp') {
    return 'phone-pad';
  }

  return 'default';
}

function getChannelPlaceholder(channel: BarklogContactChannel) {
  switch (channel) {
    case 'sms':
    case 'whatsapp':
      return '+1 555 123 4567';
    case 'telegram':
      return '@yourhandle';
    case 'signal':
      return 'Phone or Signal username';
    case 'other':
      return 'Best contact detail';
    default:
      return '';
  }
}

function ChoiceGrid<TValue extends string>({
  compact,
  onChange,
  options,
  value,
}: {
  compact: boolean;
  onChange: (next: TValue) => void;
  options: Array<ChoiceOption<TValue>>;
  value: TValue;
}) {
  return (
    <View style={styles.choiceGrid}>
      {options.map((option) => (
        <View
          key={option.value}
          style={[styles.choiceItem, compact ? styles.choiceItemCompact : null]}
        >
          <OnboardingChoiceChip
            label={option.label}
            selected={option.value === value}
            onPress={() => onChange(option.value)}
          />
        </View>
      ))}
    </View>
  );
}

function ConsentRow({
  description,
  enabled,
  onToggle,
  title,
}: {
  description: string;
  enabled: boolean;
  onToggle: () => void;
  title: string;
}) {
  return (
    <View style={styles.consentRow}>
      <View style={styles.consentCopyBlock}>
        <Text style={styles.consentTitle}>{title}</Text>
        <Text style={styles.consentCopy}>{description}</Text>
      </View>
      <ToggleSwitch checked={enabled} onPress={onToggle} />
    </View>
  );
}

export default function ContactPreferencesScreen() {
  const router = useRouter();
  const feedback = useBarklogFeedback();
  const { width } = useWindowDimensions();
  const session = useAuthSessionStore((state) => state.session);
  const setContactPreferenceStatus = useAuthSessionStore(
    (state) => state.setContactPreferenceStatus,
  );
  const [preferredName, setPreferredName] = useState('');
  const [primaryGoal, setPrimaryGoal] =
    useState<BarklogContactGoal>('health_patterns');
  const [preferredContactChannel, setPreferredContactChannel] =
    useState<BarklogContactChannel>('email');
  const [contactValue, setContactValue] = useState('');
  const [supportContactConsent, setSupportContactConsent] = useState(false);
  const [marketingContactConsent, setMarketingContactConsent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<'save' | 'skip' | null>(
    null,
  );

  const compactChoices = width < 430;
  const selectedChannelLabel = useMemo(
    () =>
      CHANNEL_OPTIONS.find((option) => option.value === preferredContactChannel)
        ?.label ?? 'contact',
    [preferredContactChannel],
  );

  useEffect(() => {
    AnalyticsManager.track('contact_preferences_viewed', {
      surface: 'signup_onboarding',
    });
  }, []);

  const routeToDogProfile = () => {
    setContactPreferenceStatus('complete');
    router.replace('/(onboarding)/dog-profile');
  };

  const handleSkip = async () => {
    if (!session) {
      setSubmitError('Sign in again to continue BarkLog setup.');
      await HapticManager.warning();
      return;
    }

    setActiveAction('skip');
    setSubmitError(null);

    try {
      await skipContactPreferences();
      AnalyticsManager.track('contact_preferences_skipped', {
        surface: 'signup_onboarding',
      });
      await HapticManager.success();
      feedback.showSuccess({
        title: 'Contact step skipped',
        description: 'You can continue BarkLog setup now.',
      });
      routeToDogProfile();
    } catch (error) {
      const message = getBarklogErrorMessage(error, {
        domain: 'generic',
        fallback: 'Unable to skip this step right now.',
      });

      captureBarklogError(error, {
        extra: {
          action: 'skip',
          surface: 'signup_onboarding',
        },
        source: 'contact_preferences',
      });
      setSubmitError(message);
      await HapticManager.error();
    } finally {
      setActiveAction(null);
    }
  };

  const handleSave = async () => {
    if (!session) {
      setSubmitError('Sign in again to continue BarkLog setup.');
      await HapticManager.warning();
      return;
    }

    const input = {
      contactValue,
      marketingContactConsent,
      preferredContactChannel,
      preferredName,
      primaryGoal,
      supportContactConsent,
    };
    const validation = validateContactPreferencesInput(input);

    if (!validation.ok) {
      AnalyticsManager.track('contact_preferences_validation_failed', {
        marketing_consent: marketingContactConsent,
        selected_channel: preferredContactChannel,
        selected_goal: primaryGoal,
        support_consent: supportContactConsent,
      });
      setSubmitError(validation.message);
      await HapticManager.warning();
      return;
    }

    setActiveAction('save');
    setSubmitError(null);

    try {
      await saveContactPreferences(input);
      AnalyticsManager.track('contact_preferences_saved', {
        marketing_consent: marketingContactConsent,
        selected_channel: preferredContactChannel,
        selected_goal: primaryGoal,
        support_consent: supportContactConsent,
      });
      await HapticManager.success();
      feedback.showSuccess({
        title: 'Preferences saved',
        description: 'BarkLog will use your choices for account support.',
      });
      routeToDogProfile();
    } catch (error) {
      const message = getBarklogErrorMessage(error, {
        domain: 'generic',
        fallback: 'Unable to save contact preferences right now.',
      });

      AnalyticsManager.track('contact_preferences_save_failed', {
        selected_channel: preferredContactChannel,
        selected_goal: primaryGoal,
      });
      captureBarklogError(error, {
        extra: {
          selected_channel: preferredContactChannel,
          selected_goal: primaryGoal,
          surface: 'signup_onboarding',
        },
        source: 'contact_preferences',
      });
      setSubmitError(message);
      await HapticManager.error();
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={4}
      title="How should BarkLog support you?"
      subtitle="Add contact preferences for setup help and product updates. You can skip this and still use BarkLog."
      surfaceVariant="card"
      heroTopSpacing={34}
      bodyTopSpacing={38}
    >
      <View style={styles.fieldStack}>
        <OnboardingLineField
          label="PREFERRED NAME"
          value={preferredName}
          autoCapitalize="words"
          autoCorrect={false}
          placeholder="Your name"
          onChangeText={setPreferredName}
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PRIMARY GOAL</Text>
          <ChoiceGrid
            compact={compactChoices}
            options={GOAL_OPTIONS}
            value={primaryGoal}
            onChange={setPrimaryGoal}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERRED CONTACT</Text>
          <ChoiceGrid
            compact={compactChoices}
            options={CHANNEL_OPTIONS}
            value={preferredContactChannel}
            onChange={(next) => {
              setPreferredContactChannel(next);

              if (next === 'email') {
                setContactValue('');
              }
            }}
          />
          {preferredContactChannel === 'email' ? (
            <Text style={styles.helperText}>
              We&apos;ll use your account email only if you opt into setup help
              or product updates.
            </Text>
          ) : (
            <OnboardingLineField
              label={`${selectedChannelLabel.toUpperCase()} DETAIL`}
              value={contactValue}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType={getChannelKeyboardType(preferredContactChannel)}
              placeholder={getChannelPlaceholder(preferredContactChannel)}
              onChangeText={setContactValue}
            />
          )}
        </View>

        <View>
          <ConsentRow
            title="Setup help and account support"
            description="BarkLog may contact you about onboarding or account issues."
            enabled={supportContactConsent}
            onToggle={() =>
              setSupportContactConsent((currentValue) => !currentValue)
            }
          />
          <ConsentRow
            title="Product and Premium updates"
            description="Receive occasional updates about new BarkLog features and plans."
            enabled={marketingContactConsent}
            onToggle={() =>
              setMarketingContactConsent((currentValue) => !currentValue)
            }
          />
        </View>

        <Text style={styles.privacyNote}>
          BarkLog stores these preferences only for your account. We do not ask
          for relatives&apos; contact details, and you can continue without
          sharing a chat or phone contact.
        </Text>

        {submitError ? (
          <BarklogStatusBanner
            tone="danger"
            title="Contact preferences not saved"
            description={submitError}
          />
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label={
              activeAction === 'save'
                ? 'Saving preferences...'
                : 'Save and continue'
            }
            disabled={activeAction !== null}
            onPress={() => {
              handleSave().catch(() => undefined);
            }}
          />

          <View style={styles.skipRow}>
            <Pressable
              accessibilityRole="button"
              disabled={activeAction !== null}
              onPress={() => {
                handleSkip().catch(() => undefined);
              }}
            >
              <Text style={styles.skipText}>
                {activeAction === 'skip' ? 'Skipping...' : 'Skip for now'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
}
