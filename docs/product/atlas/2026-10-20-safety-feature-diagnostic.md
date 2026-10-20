# Safety AI admission · 20 October 2026

Two explicitly opted-in Android native requests used a fresh Firebase token and
**synthetic context only**, without reading or uploading a journal. Both reached
the server and returned **HTTP 422 · CONTEXT_FEATURE_UNKNOWN**. Neither produced
an accepted AI answer. This supersedes any inference that live Safety AI is proven.

- Endpoint: `https://atlas.dracoarts.com/v1/chat`
- Header `X-Atlas-App-Id`: `caaf9c52-60f3-4fe2-b71a-3b59d065089a`
- `metadata.contextRequired`: `true`
- `metadata.contextFeature`: `barklog.ask-barklog-ai`
- `metadata.feature`: `barklog.ask-barklog-ai`
- Context feature and feature agree. Both come from `AtlasClient.FEATURE`.
- Purposes: constrained toxicity education and dog-safety education. Purpose
  controls prompt construction; it does not invent a new server feature ID.
- Request IDs: `c5be0a04-34ce-4374-a254-cc0e162d472b` and
  `18c05b85-a0fc-4c2b-99c4-776fa66340b2`.
- Context receipt headers were absent. No server request ID was exposed in the
  parsed response. Tokens/UIDs/passwords/request bodies are not in evidence.

The backend must authorize this exact feature under the application, or supply
its actual authorized ID for a reviewed client correction. Do not disable context
checking or substitute a guessed feature. Release online AI remains gated.

[Sanitized evidence](../../design/evidence/task046/live-ai-synthetic-2026-10-20.json).

The owner subsequently requested moving on and deferring the live recheck. No
further retries are required for task046; this diagnostic remains factual history,
not a claim that AI never worked or a request to change credentials/policy.
