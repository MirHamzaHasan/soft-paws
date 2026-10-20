# task040 — Email/password authentication checks

18 October 2026. Owner replaced default passwordless login with email/password.

- Android Debug/Release, lint and 126 JVM tests pass, including explicit login vs
  signup, validation before SDK calls, exact password whitespace, SDK-only identity,
  reset failure/retry and non-persistence of passwords in SQLite documents.
- Metadata/tooling: 30 tests pass. Initial and final signed iOS Debug/Release host/bundle checks pass.
- Normal Debug app updated in place on BarkLog Exact Board QA 20261016 (iOS 18.5).
  No design fixture was used, no journal was cleared, and local inference stayed off.
- Visually inspected default Sign in, masked input, recoverable wrong-credentials
  error and Create account/confirmation. Inputs/buttons fit the light phone view,
  use existing tokens/type/borders and named controls. Password AX state says only
  Entered; it does not copy plaintext into stateDescription. Mode switching cleared
  both password inputs. [Create account](ios-email-create-account-light.png).
- Initial QA login was rejected, then authorized signup reached Firebase but
  failed to persist the session in the unsigned host: numeric Auth code 17995
  (Keychain). Standard Xcode simulator signing supplied its own app identity and
  fixed persistence. No unsafe storage workaround or shared Keychain group was added.
- Real email/password sign-in then succeeded. Account settings showed the QA email
  and Email · Firebase account. Test setup added only a clearly named QA Dog in the
  previously empty normal journal, no care logs, and local demo Premium access.
- Cloud message consent was enabled for the requested test. Profile and record
  consent remained off; the chat context chip showed No context. The generic
  indoor-game question cleared the composer after commit and reached Atlas.
- Atlas returned HTTP 403, with a recoverable error and preserved question. No
  answer generation or server admission success is claimed. Exact server denial
  reason is unknown. [Actual result](ios-atlas-forbidden-light.png).
- Earlier email-link send was accepted after provider enablement; delivery and
  redemption were not tested before the password-flow direction changed.
- Server settings were not changed; no Firebase token was extracted or logged.
  Signed/physical devices, Android runtime, dark/large-text, VoiceOver/TalkBack,
  recovery/deletion runtime and successful Atlas generation remain open.
  Release Atlas stays disabled. Debug diagnostics contain numeric error codes only.

Final Debug was installed in place again and the app restarted. Account settings
restored Email · Firebase account without password entry, confirming the native
SDK session survives restart. [Restored session](ios-firebase-session-restored-light.png).
All build/test logs are in ignored `.verify-build/email-password-*.log`; no live
credentials are recorded in this evidence. Full platform validation passed before
the Swift-only diagnostic/error-copy follow-up; both final Swift hosts and the
metadata checks were rerun successfully afterward.

## Authenticated web follow-up · 19 October

A loopback diagnostic used the existing Firebase project, the current native
system prompt, required feature `barklog.ask-barklog-ai`, empty selected context
and the same Atlas request shape. The owner signed in directly on the local
page; passwords/tokens stayed in memory. No native build or journal access was
needed. Earlier requests returned HTTP 409 `CONTEXT_POLICY_REQUIRED`, then HTTP
422 `CONTEXT_FEATURE_UNKNOWN` while the owner edited the server policy.

Initial requests with the owner's question, “How can you help me related to my
dog?”, returned HTTP 422 `CONTEXT_FEATURE_UNKNOWN`. The sanitized
[request trace](atlas-request-trace-2026-10-19.json) confirmed both clients sent
the same app ID and feature; the null diagnostic feature was a missing response
receipt, not omitted request metadata. The owner coordinated the server repair.

**Successful retry at 08:10 UTC on 19 October:** the owner explicitly supplied an
existing QA account for this test. Hidden terminal input signed in through the
loopback diagnostic, with no credential written to source/results/logs. Firebase
returned 200 and the actual Atlas request returned **HTTP 200**, with
`X-Atlas-Context-Checked: true`, matching feature `barklog.ask-barklog-ai`, and
daily checking budget `1000000` microusd. The real 80-word answer covered general
care, routines and organizing observations without invented personal facts.
Transport response/receipt checks pass; a static check against the current native
answer length/prohibited-pattern rules also passes.

See [sanitized successful evidence](atlas-web-2026-10-19.json), request ID
`47f40596-3d9f-4cc5-9d88-4b68364f9838`. Only the synthetic question and empty
selected context were sent; no profile, records, photos or prior history.
This proves authenticated web generation for that request, not native-device
success or Release approval. No app build was needed, and the diagnostic changed
no server settings. Release Atlas remains disabled pending native proof/approval.

## Native mobile follow-up · 19 October

The owner then requested mobile acceptance. Normal native Debug apps now display
real Atlas replies on both owned simulators; SQLite confirms source `atlas`.
iOS XCTest verifies the committed composer clears and the reply/native Firebase
identity survive relaunch. Android's real native password sign-in and two saved
Atlas replies are verified; automation stopped when the owner began manual testing.
Android restart coordination remains open. One synthetic QA dog was added to its
previously empty normal journal; both journals still have zero care events/items.
See [native evidence and real frames](native-2026-10-19/README.md).
Physical/store signing, other auth providers, broader policy testing and Release
activation remain separate. No production behavior, billing or local-model flow
was enabled by this acceptance.
