# Task040 — Email/password authentication

Owner direction: 18 October 2026. Use ordinary email/password login instead of
email links for the default Email screen. This supersedes task036's email-link
UI direction; incoming links remain redeemable for existing requests.

Status: client implemented. Android Debug/Release, lint, 126 JVM tests and
initial iOS Debug/Release checks pass. Simulator signing corrected; final signed
iOS Debug/Release host and bundle checks also pass. Live iOS QA account creation and email/password sign-in pass.
The 18 October native Atlas question returned HTTP 403. On 19 October, after the
owner coordinated server configuration, an authenticated web retry using the
native request shape returned HTTP 200, a real answer and matching mandatory
policy receipts. Later on 19 October, real Atlas replies also passed in normal
Debug apps on both iOS/Android simulators. iOS reply and Firebase identity survive
relaunch; Android history is saved in SQLite, with restart coordination pending
while the owner tests manually. Physical/store acceptance remains open and Release
Atlas stays gated. See the task040 native evidence.

- Reuse the existing Email form and design tokens with explicit Sign in/Create
  account modes, masked password/confirmation and password recovery.
- Native Firebase signIn/createUser/reset APIs on Android and Apple. Login
  failure never silently creates an account or links another provider.
- Passwords never enter saved form state, shared snapshots, journal, preferences
  or diagnostics; exact password whitespace is preserved. Fields clear on route
  changes, backgrounding and success. SDK session is authoritative.
- Keep serialized requests, cancellation/timeouts, recoverable provider/network,
  credential, weak-password, collision, rate-limit and disabled-account errors.
- Preserve Google/Apple, the local journal and the Atlas privacy/UID/policy gates.

Verification: 126 JVM tests pass (three new auth/controller cases), including
explicit action/validation, no automatic signup, exact password forwarding, SDK
identity, recovery failures and journal preservation/non-persistence of secrets.
30 metadata/tooling tests pass. See docs/design/evidence/task040/README.md.

Native iOS normal Debug updated in place: Sign in/Create account use the existing
style, masked password AX state says only Entered, and switching modes clears
password inputs. The first login failed as expected before account creation.
Signup reached Firebase but the unsigned host failed to persist the session
(Keychain error 17995). Numeric-only Debug diagnostics identified the issue;
standard Xcode simulator signing fixed it. The verification command now preserves
simulator signing instead of CODE_SIGNING_ALLOWED=NO. Physical/store signing
remains a separate gate.

The owner explicitly repeated authorization to create the QA account. Creation
was submitted and the same password then signed in successfully in the signed
host; Account settings visibly showed Email · Firebase account. No password or
token value is in this evidence. The empty normal-mode journal gained only a
clearly named QA Dog profile, zero care logs, and an explicitly local demo Premium
setting for chat access. Existing preview journals and downloaded models were
preserved. Only cloud messages were allowed; profile/record sharing stayed off.

Test question: “Give me two short ideas for a calm indoor game with a dog.” The
composer cleared after the local commit and the real Firebase-authenticated Atlas
request returned HTTP 403. The app displayed its recoverable admission error and
kept the saved user message, with no fabricated answer. AtlasResponseProvider only
maps 403 to that message; the exact backend denial code remains unverified. The
existing console view showed no caller-required features, but was not confirmed
fresh and is not evidence of the current saved configuration. No server settings
were changed, no token extracted and no cloud journal context sent.

Final verification: `.verify-build/email-password-verification.log` records Android
Debug/Release, lint, 126 JVM tests, 30 metadata tests and the initial iOS hosts.
`.verify-build/email-password-signed-hosts-final.log` passes final-source signed
Debug/Release simulator builds and bundle checks. Final metadata also passes in
`.verify-build/email-password-metadata-final.log`. After reinstalling final Debug
in place and restarting, Account settings again showed the same Email · Firebase
account without re-entering a password, verifying SDK-owned session restoration.
