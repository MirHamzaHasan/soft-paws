import { onRequest } from './atlas-chat';

const baseUrl = 'https://barklog.example/api/atlas-chat';
const appId = '90b0fb60-5efa-41bb-a839-08e33c05ff7f';
const key = 'fba29e2c-d2d4-41fb-bb48-af35745098a9';
const body = JSON.stringify({
  capability: 'chat',
  metadata: {
    contextRequired: true,
    contextFeature: 'barklog.weekly-insight',
    feature: 'barklog.weekly-insight',
  },
  messages: [{ role: 'user', content: 'Observed two walks.' }],
});

const makeRequest = (overrides?: Record<string, string>) =>
  new Request(baseUrl, {
    method: 'POST',
    headers: {
      origin: 'https://barklog.example',
      authorization: 'Bearer firebase-id-token',
      'x-atlas-app-id': appId,
      'idempotency-key': key,
      ...overrides,
    },
    body,
  });

describe('BarkLog web Atlas bridge', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('forwards a same-origin Firebase call and context evidence', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          requestId: 'request-1',
          output: { content: 'Observed two walks.' },
        }),
        {
          status: 200,
          headers: {
            'x-request-id': 'request-1',
            'x-atlas-context-checked': 'true',
            'x-atlas-context-feature': 'barklog.weekly-insight',
          },
        },
      ),
    );
    global.fetch = fetchImpl;
    const response = await onRequest({
      request: makeRequest(),
      env: { ATLAS_APP_ID: appId },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('x-atlas-context-checked')).toBe('true');
    expect(fetchImpl.mock.calls[0][0].toString()).toBe(
      'https://api.atlas.dracoarts.com/v1/chat',
    );
    expect(fetchImpl.mock.calls[0][1].headers['idempotency-key']).toBe(key);
    expect(fetchImpl.mock.calls[0][1].headers.authorization).toBe(
      'Bearer firebase-id-token',
    );
  });

  it('denies cross-origin requests before contacting Atlas', async () => {
    const fetchImpl = jest.fn();
    global.fetch = fetchImpl;
    const response = await onRequest({
      request: makeRequest({ origin: 'https://other.example' }),
      env: { ATLAS_APP_ID: appId },
    });
    expect(response.status).toBe(403);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
