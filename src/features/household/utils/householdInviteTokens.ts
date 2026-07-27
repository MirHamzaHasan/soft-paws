import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function createHouseholdInviteToken() {
  const bytes = await Crypto.getRandomBytesAsync(24);

  return bytesToHex(bytes);
}

export async function hashHouseholdInviteToken(token: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, token);
}

export function buildHouseholdInviteUrl(token: string) {
  return Linking.createURL(`/household/invite/${token}`);
}

export function getHouseholdInviteExpiresAt(daysFromNow = 7, now = new Date()) {
  return new Date(now.getTime() + daysFromNow * 86_400_000).toISOString();
}
