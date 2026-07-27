export const VET_SHARE_LINK_TOKEN_BYTES = 24;
export const VET_SHARE_LINK_DEFAULT_TTL_DAYS = 14;

export type VetShareLinkStatusInput = {
  expires_at: string;
  revoked_at: string | null;
};

export function getVetShareLinkExpiresAt(
  now = new Date(),
  ttlDays = VET_SHARE_LINK_DEFAULT_TTL_DAYS,
) {
  return new Date(now.getTime() + ttlDays * 86_400_000).toISOString();
}

export function isVetShareLinkAccessible(
  link: VetShareLinkStatusInput,
  now = new Date(),
) {
  if (link.revoked_at) {
    return false;
  }

  const expiresAt = new Date(link.expires_at).getTime();

  return Number.isFinite(expiresAt) && expiresAt > now.getTime();
}

export function buildVetShareLinkUrl(input: {
  baseUrl: string;
  token: string;
}) {
  const baseUrl = input.baseUrl.replace(/\/+$/, '');

  return `${baseUrl}/${encodeURIComponent(input.token)}`;
}
