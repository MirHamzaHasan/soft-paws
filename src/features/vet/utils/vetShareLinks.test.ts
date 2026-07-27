import {
  buildVetShareLinkUrl,
  getVetShareLinkExpiresAt,
  isVetShareLinkAccessible,
} from '@/features/vet/utils/vetShareLinks';

describe('vet share links', () => {
  it('builds deterministic expiration windows', () => {
    expect(
      getVetShareLinkExpiresAt(new Date('2026-04-27T00:00:00.000Z'), 14),
    ).toBe('2026-05-11T00:00:00.000Z');
  });

  it('treats revoked or expired links as inaccessible', () => {
    const now = new Date('2026-04-27T00:00:00.000Z');

    expect(
      isVetShareLinkAccessible(
        {
          expires_at: '2026-04-28T00:00:00.000Z',
          revoked_at: null,
        },
        now,
      ),
    ).toBe(true);
    expect(
      isVetShareLinkAccessible(
        {
          expires_at: '2026-04-28T00:00:00.000Z',
          revoked_at: '2026-04-27T12:00:00.000Z',
        },
        now,
      ),
    ).toBe(false);
    expect(
      isVetShareLinkAccessible(
        {
          expires_at: '2026-04-26T00:00:00.000Z',
          revoked_at: null,
        },
        now,
      ),
    ).toBe(false);
  });

  it('creates public report URLs without leaking token query params', () => {
    expect(
      buildVetShareLinkUrl({
        baseUrl: 'https://app.barklog.example/vet-share/',
        token: 'token value',
      }),
    ).toBe('https://app.barklog.example/vet-share/token%20value');
  });
});
