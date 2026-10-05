export async function isStarterModelInstalled(): Promise<boolean> {
  return false;
}

export async function downloadStarterModel(): Promise<void> {
  throw new Error('On-device AI is available in the iOS and Android app.');
}

export async function deleteStarterModel(): Promise<void> {
  return undefined;
}

export async function embedLocalTexts(
  _texts: readonly string[],
): Promise<number[][]> {
  throw new Error('On-device AI is available in the iOS and Android app.');
}
