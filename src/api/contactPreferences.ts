import type { Database } from '@/types/supabase';

import { getSupabaseClient } from './supabaseClient';

export const BARKLOG_CONTACT_PREFERENCE_SOURCE = 'signup_contact_preferences';

export const BARKLOG_CONTACT_GOALS = [
  'health_patterns',
  'training',
  'medications',
  'vet_prep',
  'multi_caregiver',
  'other',
] as const;

export const BARKLOG_CONTACT_CHANNELS = [
  'email',
  'whatsapp',
  'sms',
  'telegram',
  'signal',
  'other',
] as const;

export type BarklogContactPreferenceRow =
  Database['public']['Tables']['user_contact_preferences']['Row'];

export type BarklogContactPreferenceStatus = 'complete' | 'required';

export type BarklogContactGoal = (typeof BARKLOG_CONTACT_GOALS)[number];

export type BarklogContactChannel = (typeof BARKLOG_CONTACT_CHANNELS)[number];

export type SaveContactPreferencesInput = {
  contactValue?: string;
  marketingContactConsent: boolean;
  preferredContactChannel: BarklogContactChannel;
  preferredName?: string;
  primaryGoal: BarklogContactGoal;
  supportContactConsent: boolean;
};

export type NormalizedContactPreferencesInput = {
  contactValue: string | null;
  marketingContactConsent: boolean;
  preferredContactChannel: BarklogContactChannel;
  preferredName: string | null;
  primaryGoal: BarklogContactGoal;
  supportContactConsent: boolean;
};

export type ContactPreferenceValidationResult =
  | {
      input: NormalizedContactPreferencesInput;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

function isContactGoal(value: string): value is BarklogContactGoal {
  return BARKLOG_CONTACT_GOALS.includes(value as BarklogContactGoal);
}

function isContactChannel(value: string): value is BarklogContactChannel {
  return BARKLOG_CONTACT_CHANNELS.includes(value as BarklogContactChannel);
}

export function validateContactPreferencesInput(
  input: SaveContactPreferencesInput,
): ContactPreferenceValidationResult {
  if (!isContactGoal(input.primaryGoal)) {
    return {
      message: 'Choose what you want BarkLog to help with first.',
      ok: false,
    };
  }

  if (!isContactChannel(input.preferredContactChannel)) {
    return {
      message: 'Choose how you prefer to be contacted.',
      ok: false,
    };
  }

  const preferredName = input.preferredName?.trim() || null;
  const contactValue = input.contactValue?.trim() || '';
  const nonEmailChannel = input.preferredContactChannel !== 'email';
  const hasConsent =
    input.supportContactConsent || input.marketingContactConsent;

  if (nonEmailChannel && !contactValue) {
    return {
      message: 'Enter the contact detail for your selected channel.',
      ok: false,
    };
  }

  if (nonEmailChannel && !hasConsent) {
    return {
      message:
        'Turn on setup help or product updates before saving a chat or phone contact.',
      ok: false,
    };
  }

  return {
    input: {
      contactValue: nonEmailChannel ? contactValue : null,
      marketingContactConsent: input.marketingContactConsent,
      preferredContactChannel: input.preferredContactChannel,
      preferredName,
      primaryGoal: input.primaryGoal,
      supportContactConsent: input.supportContactConsent,
    },
    ok: true,
  };
}

async function readCurrentAuthUserId() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.id) {
    throw new Error('Sign in again to update contact preferences.');
  }

  return data.user.id;
}

export async function getContactPreferenceStatus(
  userId: string,
): Promise<BarklogContactPreferenceStatus> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_contact_preferences')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? 'complete' : 'required';
}

export async function saveContactPreferences(
  input: SaveContactPreferencesInput,
) {
  const validation = validateContactPreferencesInput(input);

  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const userId = await readCurrentAuthUserId();
  const now = new Date().toISOString();
  const { input: normalizedInput } = validation;
  const { data, error } = await getSupabaseClient()
    .from('user_contact_preferences')
    .upsert(
      {
        consent_source: BARKLOG_CONTACT_PREFERENCE_SOURCE,
        contact_value: normalizedInput.contactValue,
        marketing_contact_consent: normalizedInput.marketingContactConsent,
        marketing_consented_at: normalizedInput.marketingContactConsent
          ? now
          : null,
        preferred_contact_channel: normalizedInput.preferredContactChannel,
        preferred_name: normalizedInput.preferredName,
        primary_goal: normalizedInput.primaryGoal,
        skipped_at: null,
        support_contact_consent: normalizedInput.supportContactConsent,
        support_consented_at: normalizedInput.supportContactConsent
          ? now
          : null,
        user_id: userId,
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('Unable to save contact preferences.');
  }

  return data;
}

export async function skipContactPreferences() {
  const userId = await readCurrentAuthUserId();
  const { data, error } = await getSupabaseClient()
    .from('user_contact_preferences')
    .upsert(
      {
        consent_source: BARKLOG_CONTACT_PREFERENCE_SOURCE,
        contact_value: null,
        marketing_contact_consent: false,
        marketing_consented_at: null,
        preferred_contact_channel: 'email',
        preferred_name: null,
        primary_goal: null,
        skipped_at: new Date().toISOString(),
        support_contact_consent: false,
        support_consented_at: null,
        user_id: userId,
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('Unable to skip contact preferences.');
  }

  return data;
}
