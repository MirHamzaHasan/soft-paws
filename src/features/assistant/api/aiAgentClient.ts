import type { BarklogUserRow } from '@/api';
import { getSupabaseClient } from '@/api';
import type { Json } from '@/types/supabase';

import {
  assertPremiumAiAccess,
  BARKLOG_AI_SAFE_FAILURE_MESSAGE,
  getSafeAiErrorMessage,
} from '../../insights/utils/aiSafety';
import {
  type AiAgentId,
  getAiAgentById,
  isApprovedAiAgentEdgeFunctionName,
} from '../data/aiAgentCatalog';

export type AiAgentInvocationRequest = {
  agentId: AiAgentId;
  body: Record<string, Json>;
  user: BarklogUserRow | null | undefined;
};

export type AiAgentInvocationResponse = Record<string, Json>;

function unwrapFunctionResponse<T>(input: {
  data: T | null;
  error: Error | null;
}) {
  if (input.error || !input.data) {
    throw new Error(BARKLOG_AI_SAFE_FAILURE_MESSAGE);
  }

  return input.data;
}

export async function invokeAiAgent(input: AiAgentInvocationRequest) {
  try {
    assertPremiumAiAccess(input.user, 'ai-agents');

    const agent = getAiAgentById(input.agentId);

    if (!agent?.edgeFunctionName) {
      throw new Error('This AI agent uses a routed BarkLog surface.');
    }

    if (!isApprovedAiAgentEdgeFunctionName(agent.edgeFunctionName)) {
      throw new Error('This AI agent is not approved for client invocation.');
    }

    const supabase = getSupabaseClient();
    const { data, error } =
      await supabase.functions.invoke<AiAgentInvocationResponse>(
        agent.edgeFunctionName,
        {
          body: {
            ...input.body,
            agentId: input.agentId,
          },
        },
      );

    return unwrapFunctionResponse({ data, error });
  } catch (error) {
    throw new Error(getSafeAiErrorMessage(error));
  }
}
