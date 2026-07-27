import {
  BARKLOG_CONTACT_PREFERENCE_SOURCE,
  getContactPreferenceStatus,
  saveContactPreferences,
  skipContactPreferences,
  validateContactPreferencesInput,
} from '@/api/contactPreferences';
import { getSupabaseClient } from '@/api/supabaseClient';

jest.mock('@/api/supabaseClient', () => ({
  getSupabaseClient: jest.fn(),
}));

type TerminalResponse = {
  data: unknown;
  error: Error | null;
};

function makeContactPreferenceRow(overrides: Record<string, unknown> = {}) {
  return {
    consent_source: BARKLOG_CONTACT_PREFERENCE_SOURCE,
    contact_value: null,
    created_at: '2026-05-19T00:00:00.000Z',
    marketing_contact_consent: false,
    marketing_consented_at: null,
    preferred_contact_channel: 'email',
    preferred_name: null,
    primary_goal: 'health_patterns',
    skipped_at: null,
    support_contact_consent: false,
    support_consented_at: null,
    updated_at: '2026-05-19T00:00:00.000Z',
    user_id: 'user-1',
    ...overrides,
  };
}

function createSupabaseMock({
  authUserId = 'user-1',
  maybeSingleResponse = { data: null, error: null },
  singleResponse = {
    data: makeContactPreferenceRow(),
    error: null,
  },
}: {
  authUserId?: string;
  maybeSingleResponse?: TerminalResponse;
  singleResponse?: TerminalResponse;
} = {}) {
  const mutationCalls: Array<{
    payload: unknown;
    table: string;
    type: 'upsert';
  }> = [];
  const builder: Record<string, jest.Mock> = {};

  builder.eq = jest.fn(() => builder);
  builder.maybeSingle = jest.fn(async () => maybeSingleResponse);
  builder.select = jest.fn(() => builder);
  builder.single = jest.fn(async () => singleResponse);
  builder.upsert = jest.fn((payload: unknown) => {
    mutationCalls.push({
      payload,
      table: 'user_contact_preferences',
      type: 'upsert',
    });

    return builder;
  });

  const supabase = {
    auth: {
      getUser: jest.fn(async () => ({
        data: {
          user: {
            id: authUserId,
          },
        },
        error: null,
      })),
    },
    from: jest.fn(() => builder),
  };

  jest
    .mocked(getSupabaseClient)
    .mockReturnValue(
      supabase as unknown as ReturnType<typeof getSupabaseClient>,
    );

  return {
    builder,
    mutationCalls,
    supabase,
  };
}

describe('contact preference API', () => {
  beforeEach(() => {
    jest.useFakeTimers({
      now: new Date('2026-05-19T12:00:00.000Z'),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('marks missing contact preferences as required', async () => {
    createSupabaseMock();

    await expect(getContactPreferenceStatus('user-1')).resolves.toBe(
      'required',
    );
  });

  it('marks existing contact preferences as complete', async () => {
    createSupabaseMock({
      maybeSingleResponse: {
        data: { user_id: 'user-1' },
        error: null,
      },
    });

    await expect(getContactPreferenceStatus('user-1')).resolves.toBe(
      'complete',
    );
  });

  it('validates non-email contact value and consent before save', () => {
    expect(
      validateContactPreferencesInput({
        contactValue: '',
        marketingContactConsent: false,
        preferredContactChannel: 'whatsapp',
        preferredName: 'Mira',
        primaryGoal: 'health_patterns',
        supportContactConsent: true,
      }),
    ).toEqual({
      message: 'Enter the contact detail for your selected channel.',
      ok: false,
    });

    expect(
      validateContactPreferencesInput({
        contactValue: '+15551234567',
        marketingContactConsent: false,
        preferredContactChannel: 'whatsapp',
        preferredName: 'Mira',
        primaryGoal: 'health_patterns',
        supportContactConsent: false,
      }),
    ).toEqual({
      message:
        'Turn on setup help or product updates before saving a chat or phone contact.',
      ok: false,
    });
  });

  it('saves email contact preferences without duplicating the email value', async () => {
    const { mutationCalls } = createSupabaseMock();

    await saveContactPreferences({
      contactValue: 'ignored@example.com',
      marketingContactConsent: true,
      preferredContactChannel: 'email',
      preferredName: ' Mira ',
      primaryGoal: 'training',
      supportContactConsent: false,
    });

    expect(mutationCalls).toEqual([
      {
        payload: {
          consent_source: BARKLOG_CONTACT_PREFERENCE_SOURCE,
          contact_value: null,
          marketing_contact_consent: true,
          marketing_consented_at: '2026-05-19T12:00:00.000Z',
          preferred_contact_channel: 'email',
          preferred_name: 'Mira',
          primary_goal: 'training',
          skipped_at: null,
          support_contact_consent: false,
          support_consented_at: null,
          user_id: 'user-1',
        },
        table: 'user_contact_preferences',
        type: 'upsert',
      },
    ]);
  });

  it('records a skip row without contact PII', async () => {
    const { mutationCalls } = createSupabaseMock();

    await skipContactPreferences();

    expect(mutationCalls).toEqual([
      {
        payload: {
          consent_source: BARKLOG_CONTACT_PREFERENCE_SOURCE,
          contact_value: null,
          marketing_contact_consent: false,
          marketing_consented_at: null,
          preferred_contact_channel: 'email',
          preferred_name: null,
          primary_goal: null,
          skipped_at: '2026-05-19T12:00:00.000Z',
          support_contact_consent: false,
          support_consented_at: null,
          user_id: 'user-1',
        },
        table: 'user_contact_preferences',
        type: 'upsert',
      },
    ]);
  });
});
