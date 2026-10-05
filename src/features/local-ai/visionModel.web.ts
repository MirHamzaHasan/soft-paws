export async function isVisionModelInstalled(): Promise<boolean> {
  return false;
}

export async function downloadVisionModel(): Promise<void> {
  throw new Error(
    'Local photo descriptions are available in the iOS and Android app.',
  );
}

export async function deleteVisionModel(): Promise<void> {
  // Web has no on-device model.
}

export async function describeLocalPhoto(_uri: string): Promise<string> {
  throw new Error(
    'Local photo descriptions are available in the iOS and Android app.',
  );
}
