import {
  buildTextAiRequestBody,
  createTextAiConfigurationFromEnv,
  createVisionAiConfigurationFromEnv,
} from '../../../../supabase/functions/_shared/aiProvider';

describe('BarkLog AI provider configuration', () => {
  it('defaults missing text AI keys to unconfigured DeepSeek Flash', () => {
    expect(createTextAiConfigurationFromEnv({})).toMatchObject({
      apiKey: null,
      baseUrl: 'https://api.deepseek.com',
      isConfigured: false,
      model: 'deepseek-v4-flash',
      provider: 'deepseek',
      thinking: 'disabled',
    });
  });

  it('defaults missing vision AI keys to unconfigured OpenAI nano', () => {
    expect(createVisionAiConfigurationFromEnv({})).toMatchObject({
      apiKey: null,
      baseUrl: 'https://api.openai.com/v1',
      isConfigured: false,
      model: 'gpt-5.4-nano',
      provider: 'openai',
    });
  });

  it('parses valid DeepSeek text and OpenAI vision secrets', () => {
    expect(
      createTextAiConfigurationFromEnv({
        textAiApiKey: ' deepseek-key ',
        textAiBaseUrl: 'https://api.deepseek.com/',
        textAiModel: 'deepseek-v4-flash',
        textAiProvider: 'deepseek',
        textAiThinking: 'disabled',
      }),
    ).toMatchObject({
      apiKey: 'deepseek-key',
      baseUrl: 'https://api.deepseek.com',
      isConfigured: true,
      model: 'deepseek-v4-flash',
      provider: 'deepseek',
      thinking: 'disabled',
    });

    expect(
      createVisionAiConfigurationFromEnv({
        visionAiApiKey: ' openai-key ',
        visionAiBaseUrl: 'https://api.openai.com/v1/',
        visionAiModel: 'gpt-5.4-nano',
        visionAiProvider: 'openai',
      }),
    ).toMatchObject({
      apiKey: 'openai-key',
      baseUrl: 'https://api.openai.com/v1',
      isConfigured: true,
      model: 'gpt-5.4-nano',
      provider: 'openai',
    });
  });

  it('builds DeepSeek text requests with thinking disabled', () => {
    const config = createTextAiConfigurationFromEnv({
      textAiApiKey: 'deepseek-key',
    });

    expect(
      buildTextAiRequestBody(config, {
        maxTokens: 120,
        system: 'Stay non-diagnostic.',
        user: 'Summarize this week.',
      }),
    ).toMatchObject({
      max_tokens: 120,
      messages: [
        {
          content: 'Stay non-diagnostic.',
          role: 'system',
        },
        {
          content: 'Summarize this week.',
          role: 'user',
        },
      ],
      model: 'deepseek-v4-flash',
      stream: false,
      thinking: {
        type: 'disabled',
      },
    });
  });
});
