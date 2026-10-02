import type { BarklogUserRow } from '@/api';
import type { Json } from '@/types/local';

import type { AiAgentId } from '../data/aiAgentCatalog';

export type AiAgentInvocationRequest = {
  agentId: AiAgentId;
  body: Record<string, Json>;
  user: BarklogUserRow | null | undefined;
};

export type AiAgentInvocationResponse = Record<string, Json>;

export async function invokeAiAgent(_input: AiAgentInvocationRequest): Promise<AiAgentInvocationResponse> {
  throw new Error('AI is unavailable in this local-only build.');
}
