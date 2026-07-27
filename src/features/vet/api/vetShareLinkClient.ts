import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';

import { getSupabaseClient } from '@/api';
import type { BarklogUserRow } from '@/api/auth';
import type { Json } from '@/types/supabase';

import type { VetShareReportSnapshot } from '../utils/vetReportBuilder';
import {
  buildVetShareLinkUrl,
  getVetShareLinkExpiresAt,
} from '../utils/vetShareLinks';

export type CreateVetShareLinkInput = {
  dogId: string;
  rangeEnd: string;
  rangeStart: string;
  reportSnapshot: VetShareReportSnapshot;
  user: BarklogUserRow;
};

export type CreatedVetShareLink = {
  expiresAt: string;
  id: string;
  token: string;
  url: string;
};

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function createShareToken() {
  const bytes = await Crypto.getRandomBytesAsync(24);

  return bytesToHex(bytes);
}

async function hashShareToken(token: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, token);
}

export async function createVetShareLink(input: CreateVetShareLinkInput) {
  const token = await createShareToken();
  const tokenHash = await hashShareToken(token);
  const expiresAt = getVetShareLinkExpiresAt();
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('vet_share_links')
    .insert({
      dog_id: input.dogId,
      expires_at: expiresAt,
      range_end: input.rangeEnd,
      range_start: input.rangeStart,
      report_snapshot: input.reportSnapshot as unknown as Json,
      token_hash: tokenHash,
      user_id: input.user.id,
    })
    .select('id, expires_at')
    .single();

  if (error || !data) {
    throw new Error('Unable to create a secure vet share link right now.');
  }

  return {
    expiresAt: data.expires_at,
    id: data.id,
    token,
    url: buildVetShareLinkUrl({
      baseUrl: Linking.createURL('/vet-share'),
      token,
    }),
  } satisfies CreatedVetShareLink;
}

export async function revokeVetShareLink(linkId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('vet_share_links')
    .update({
      revoked_at: new Date().toISOString(),
    })
    .eq('id', linkId);

  if (error) {
    throw new Error('Unable to revoke this vet share link right now.');
  }
}
