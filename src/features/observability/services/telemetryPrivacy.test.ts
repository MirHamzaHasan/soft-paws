import {
  sanitizeTelemetryProperties,
  sanitizeTelemetryText,
  TELEMETRY_REDACTED_VALUE,
} from '@/features/observability/services/telemetryPrivacy';

describe('telemetry privacy sanitizer', () => {
  it('redacts raw notes, symptoms, prompts, export content, and contact PII by key', () => {
    expect(
      sanitizeTelemetryProperties({
        contact_value: '+15551234567',
        email: 'caregiver@example.com',
        event_type: 'symptom',
        exportContent: 'full CSV contents',
        noteText: 'vomited twice after dinner',
        prompt: 'What illness is this?',
        screen_name: '/ask-ai',
        selected_channel: 'whatsapp',
      }),
    ).toEqual({
      contact_value: TELEMETRY_REDACTED_VALUE,
      email: TELEMETRY_REDACTED_VALUE,
      event_type: 'symptom',
      exportContent: TELEMETRY_REDACTED_VALUE,
      noteText: TELEMETRY_REDACTED_VALUE,
      prompt: TELEMETRY_REDACTED_VALUE,
      screen_name: '/ask-ai',
      selected_channel: 'whatsapp',
    });
  });

  it('redacts sensitive error text while preserving neutral text', () => {
    expect(sanitizeTelemetryText('AI provider prompt included raw notes')).toBe(
      TELEMETRY_REDACTED_VALUE,
    );
    expect(sanitizeTelemetryText('Network request failed')).toBe(
      'Network request failed',
    );
  });
});
