import { type EdgeRuntimeEnv, getEdgeRuntimeEnv } from './env.ts';

const DEFAULT_TEXT_AI_PROVIDER = 'deepseek';
const DEFAULT_TEXT_AI_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_TEXT_AI_MODEL = 'deepseek-v4-flash';
const DEFAULT_TEXT_AI_THINKING = 'disabled';
const DEFAULT_VISION_AI_PROVIDER = 'openai';
const DEFAULT_VISION_AI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_VISION_AI_MODEL = 'gpt-5.4-nano';

type AiProvider = 'deepseek' | 'openai';
type TextAiThinkingMode = 'disabled' | 'enabled';

export type TextAiConfiguration = {
  apiKey: string | null;
  baseUrl: string;
  isConfigured: boolean;
  model: string;
  provider: AiProvider;
  thinking: TextAiThinkingMode;
};

export type VisionAiConfiguration = {
  apiKey: string | null;
  baseUrl: string;
  isConfigured: boolean;
  model: string;
  provider: 'openai';
};

export type VisionAiImageInput = {
  dataBase64: string;
  mimeType: 'image/heic' | 'image/jpeg' | 'image/png' | 'image/webp';
};

export type VisionAiMessageInput = {
  images: VisionAiImageInput[];
  maxTokens: number;
  prompt: string;
  system: string;
};

type OpenAiCompatibleTextResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  usage?: {
    completion_tokens?: number;
    prompt_tokens?: number;
    total_tokens?: number;
  };
};

type TextAiMessageInput = {
  feature?: string;
  maxTokens: number;
  promptVersion?: string;
  system: string;
  user: string;
};

function trimSlashes(value: string) {
  return value.replace(/\/+$/, '');
}

function cleanOptional(value: string | undefined) {
  const cleaned = value?.trim();

  return cleaned || null;
}

function normalizeProvider(
  value: string | undefined,
  fallback: AiProvider,
): AiProvider {
  const provider = (cleanOptional(value) ?? fallback).toLowerCase();

  if (provider === 'deepseek' || provider === 'openai') {
    return provider;
  }

  throw new Error(`Unsupported BarkLog text AI provider: ${provider}.`);
}

function normalizeThinking(value: string | undefined): TextAiThinkingMode {
  const thinking = (cleanOptional(value) ?? DEFAULT_TEXT_AI_THINKING)
    .toLowerCase()
    .trim();

  if (thinking === 'enabled' || thinking === 'disabled') {
    return thinking;
  }

  throw new Error(`Unsupported BarkLog text AI thinking mode: ${thinking}.`);
}

export function createTextAiConfigurationFromEnv(
  env: EdgeRuntimeEnv,
): TextAiConfiguration {
  const provider = normalizeProvider(
    env.textAiProvider,
    DEFAULT_TEXT_AI_PROVIDER,
  );
  const fallbackBaseUrl =
    provider === 'deepseek'
      ? DEFAULT_TEXT_AI_BASE_URL
      : DEFAULT_VISION_AI_BASE_URL;

  return {
    apiKey: cleanOptional(env.textAiApiKey),
    baseUrl: trimSlashes(cleanOptional(env.textAiBaseUrl) ?? fallbackBaseUrl),
    isConfigured: Boolean(cleanOptional(env.textAiApiKey)),
    model:
      cleanOptional(env.textAiModel) ??
      (provider === 'deepseek'
        ? DEFAULT_TEXT_AI_MODEL
        : DEFAULT_VISION_AI_MODEL),
    provider,
    thinking: normalizeThinking(env.textAiThinking),
  };
}

export function createVisionAiConfigurationFromEnv(
  env: EdgeRuntimeEnv,
): VisionAiConfiguration {
  const provider =
    cleanOptional(env.visionAiProvider) ?? DEFAULT_VISION_AI_PROVIDER;

  if (provider !== 'openai') {
    throw new Error(`Unsupported BarkLog vision AI provider: ${provider}.`);
  }

  return {
    apiKey: cleanOptional(env.visionAiApiKey),
    baseUrl: trimSlashes(
      cleanOptional(env.visionAiBaseUrl) ?? DEFAULT_VISION_AI_BASE_URL,
    ),
    isConfigured: Boolean(cleanOptional(env.visionAiApiKey)),
    model: cleanOptional(env.visionAiModel) ?? DEFAULT_VISION_AI_MODEL,
    provider,
  };
}

export function buildTextAiRequestBody(
  config: TextAiConfiguration,
  input: TextAiMessageInput,
) {
  const body: Record<string, unknown> = {
    max_tokens: input.maxTokens,
    messages: [
      {
        content: input.system,
        role: 'system',
      },
      {
        content: input.user,
        role: 'user',
      },
    ],
    model: config.model,
    stream: false,
  };

  if (config.provider === 'deepseek') {
    body.thinking = {
      type: config.thinking,
    };
  }

  return body;
}

function getTextAiConfiguration() {
  return createTextAiConfigurationFromEnv(getEdgeRuntimeEnv());
}

function assertTextAiConfiguration(
  config: TextAiConfiguration,
): TextAiConfiguration & { apiKey: string } {
  if (!config.isConfigured || !config.apiKey) {
    throw new Error('BARKLOG_TEXT_AI_API_KEY is not configured.');
  }

  return {
    ...config,
    apiKey: config.apiKey,
  };
}

function readTextAiResponseText(body: OpenAiCompatibleTextResponse) {
  const textContent = body.choices?.[0]?.message?.content?.trim();

  if (!textContent) {
    throw new Error('BarkLog text AI response did not include text content.');
  }

  return textContent;
}

function logTextAiResult(input: {
  config: TextAiConfiguration;
  feature?: string;
  promptVersion?: string;
  status: 'failed' | 'succeeded';
  usage?: OpenAiCompatibleTextResponse['usage'];
}) {
  console.info('barklog_text_ai_request', {
    completionTokens: input.usage?.completion_tokens,
    feature: input.feature,
    model: input.config.model,
    promptTokens: input.usage?.prompt_tokens,
    promptVersion: input.promptVersion,
    provider: input.config.provider,
    status: input.status,
    totalTokens: input.usage?.total_tokens,
  });
}

export async function createTextAiMessage(input: TextAiMessageInput) {
  const config = assertTextAiConfiguration(getTextAiConfiguration());

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      body: JSON.stringify(buildTextAiRequestBody(config, input)),
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'content-type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `${config.provider} text AI request failed with ${response.status}: ${errorText}`,
      );
    }

    const body = (await response.json()) as OpenAiCompatibleTextResponse;
    logTextAiResult({
      config,
      feature: input.feature,
      promptVersion: input.promptVersion,
      status: 'succeeded',
      usage: body.usage,
    });

    return readTextAiResponseText(body);
  } catch (error) {
    logTextAiResult({
      config,
      feature: input.feature,
      promptVersion: input.promptVersion,
      status: 'failed',
    });

    throw error;
  }
}

export function clampSentences(input: string, maxSentences: number) {
  const sentences = input
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  return sentences.slice(0, maxSentences).join(' ').trim();
}

export function clampWords(input: string, maxWords: number) {
  const words = input.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);

  return words.slice(0, maxWords).join(' ');
}

export function stripMarkdown(input: string) {
  return input.replace(/[*_#`>-]/g, '').trim();
}
