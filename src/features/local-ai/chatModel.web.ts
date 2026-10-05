export async function isChatModelInstalled(): Promise<boolean> {
  return false;
}

export async function downloadChatModel(): Promise<void> {
  throw new Error('Local conversation is available in the iOS and Android app.');
}

export async function deleteChatModel(): Promise<void> {
  return undefined;
}

export async function generateLocalChat(_prompt: string): Promise<string> {
  throw new Error('Local conversation is available in the iOS and Android app.');
}
