# Current native feature-authorization rejection · 19 October 2026

The normal Android Debug app signed into the owned Firebase QA account sent
“How can you help me related to my dog?” after affirmative consent to the new
profile and seven-day scope. The server returned **422 / CONTEXT_FEATURE_UNKNOWN**:
“The requested context feature is not authorized by this application”. This is
not accepted generation. Earlier task040 successful replies are historical proof.

| Field | Actual value |
| --- | --- |
| Endpoint | `https://atlas.dracoarts.com/v1/chat` |
| `X-Atlas-App-Id` | `caaf9c52-60f3-4fe2-b71a-3b59d065089a` |
| Client platform | `google-play` |
| `metadata.contextRequired` | `true` |
| `metadata.contextFeature` | `barklog.ask-barklog-ai` |
| `metadata.feature` | `barklog.ask-barklog-ai` |
| Context/feature conflict | None; both use the same constant |

`shared/src/commonMain/kotlin/com/dracoarts/shared/services/ai/AtlasClient.kt` assigns `FEATURE`, builds the metadata
and uses `KtorAtlasTransport.APP_ID`. `AtlasResponseProvider` builds messages;
there is no intermediary proxy in this native path. These identifiers were not
changed by the weekly-card or sound work. Credentials remain inside Firebase
and the memory-only native request; none are in this report.

An explicit opt-in SDK diagnostic repeated the actual production provider path:
3799 request bytes, three owned synthetic care records, 422 with the same code.
Client request/idempotency key: `d5e99782-7321-4ae4-b4e0-aafb1894a970`.
The response body contained only `error`; no server request ID or policy receipts
were returned. An HTTP request reaching the server is not a successful AI reply.

The backend needs to authorize the exact feature above for the Bark Log application
above and verify its active policy/configuration. The new scope is explicitly
consented current-dog profile plus bounded notes/counts from seven local calendar
days; no photos, other dogs or whole-journal upload. Keep the existing clinical
exclusions and context checks. Do not invent a replacement feature ID, disable
checks, enable Release or broaden scope to work around this rejection.

`AtlasWeeklyDiagnosticTest` is opt-in (`liveAtlas=1`) and uses fresh native SDK
identity. It stores only sanitized status/metadata/error diagnostics. The app now
explains this response as an online setup problem, retaining the saved question.


A subsequent message-only native SDK probe also returned 422 with the same code:
2783 bytes, client/idempotency key `0256278d-117a-41c7-96ae-4a51c21e192c`,
with both feature fields still `barklog.ask-barklog-ai` and context checking true.
It sent no profile, record excerpts or weekly object. This isolates the current
feature-authorization rejection from the new weekly payload. See the sanitized
[weekly result](../../design/evidence/task041/native-2026-10-19/weekly-server-rejection.json)
and [minimal result](../../design/evidence/task041/native-2026-10-19/minimal-server-rejection.json).
The local feature draft now describes the owner-authorized weekly scope; it has
not been installed on the server by this work.
