export type EdgeRuntimeEnv = {
  textAiApiKey?: string;
  textAiBaseUrl?: string;
  textAiModel?: string;
  textAiProvider?: string;
  textAiThinking?: string;
  supabaseServiceRoleKey?: string;
  supabaseUrl?: string;
  visionAiApiKey?: string;
  visionAiBaseUrl?: string;
  visionAiModel?: string;
  visionAiProvider?: string;
};

export function getEdgeRuntimeEnv(): EdgeRuntimeEnv {
  return {
    supabaseServiceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    supabaseUrl: Deno.env.get('SUPABASE_URL'),
    textAiApiKey: Deno.env.get('BARKLOG_TEXT_AI_API_KEY'),
    textAiBaseUrl: Deno.env.get('BARKLOG_TEXT_AI_BASE_URL'),
    textAiModel: Deno.env.get('BARKLOG_TEXT_AI_MODEL'),
    textAiProvider: Deno.env.get('BARKLOG_TEXT_AI_PROVIDER'),
    textAiThinking: Deno.env.get('BARKLOG_TEXT_AI_THINKING'),
    visionAiApiKey: Deno.env.get('BARKLOG_VISION_AI_API_KEY'),
    visionAiBaseUrl: Deno.env.get('BARKLOG_VISION_AI_BASE_URL'),
    visionAiModel: Deno.env.get('BARKLOG_VISION_AI_MODEL'),
    visionAiProvider: Deno.env.get('BARKLOG_VISION_AI_PROVIDER'),
  };
}

export function summarizeConfiguredEnv() {
  const env = getEdgeRuntimeEnv();

  return {
    hasSupabaseServiceRoleKey: Boolean(env.supabaseServiceRoleKey),
    hasSupabaseUrl: Boolean(env.supabaseUrl),
    hasTextAiApiKey: Boolean(env.textAiApiKey),
    hasVisionAiApiKey: Boolean(env.visionAiApiKey),
    textAiModel: env.textAiModel ?? 'deepseek-v4-flash',
    textAiProvider: env.textAiProvider ?? 'deepseek',
    visionAiModel: env.visionAiModel ?? 'gpt-5.4-nano',
    visionAiProvider: env.visionAiProvider ?? 'openai',
  };
}
