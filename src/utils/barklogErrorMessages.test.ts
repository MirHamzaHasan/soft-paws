import {
  AI_SAFE_FAILURE_MESSAGE,
  getBarklogErrorMessage,
} from './barklogErrorMessages';

describe('BarkLog safe error messages', () => {
  it('does not expose raw local database details', () => {
    expect(
      getBarklogErrorMessage(
        new Error('SQLite failed with stack details'),
        {
          domain: 'local_profile',
        },
      ),
    ).toBe(
      'Unable to open your local care journal right now. Please try again.',
    );
  });

  it('keeps approved local validation copy', () => {
    expect(
      getBarklogErrorMessage(
        new Error('Complete BarkLog onboarding before logging events.'),
        {
          domain: 'local_save',
        },
      ),
    ).toBe('Complete BarkLog onboarding before logging events.');
  });

  it('does not expose local save stack details', () => {
    expect(
      getBarklogErrorMessage(
        new Error('SQLite failed at saveEvent with { raw: true }'),
        {
          domain: 'local_save',
        },
      ),
    ).toBe('Unable to save this entry on this device. Please try again.');
  });

  it('treats purchase cancellations as warning copy', () => {
    expect(
      getBarklogErrorMessage(new Error('purchase canceled by user'), {
        domain: 'purchase',
      }),
    ).toBe('Purchase cancelled. Premium was not activated.');
  });

  it('always returns the safe AI fallback for AI errors', () => {
    expect(
      getBarklogErrorMessage(new Error('OpenAI provider timeout: raw body'), {
        domain: 'ai',
      }),
    ).toBe(AI_SAFE_FAILURE_MESSAGE);
  });
});
