# Soft Paws task011 · optional account and plan screens

21 October 2026. Status: implemented; native simulator journeys/builds pass. Individual native
visual, physical/assistive and live provider/store acceptance remain open.

Port the approved `sign-in`, `email-sign-in`, `create-account`, `password-reset`,
`paywall`, `account-plan`, `manage-subscription` and `future-features` screens.
Keep the original Rive cat, joyful generated kit and approved board layouts.
Use shared Compose and existing native authentication/purchases boundaries.
No service setup, real account, password reset email, transaction or AI request
is authorised. A sign-in screen is not an account wall for local care.

Email/password remains the owner-selected path. Passwords and confirmation stay
transient, clear on background/route changes and never enter saved UI state,
SQLite or preferences. Preserve email-link compatibility. Distinct create/reset
routes must return correctly and retain a usable local-journal exit. Place actual
validation/SDK failures beside the action; never claim an unavailable reset sent.

Show full recurring weekly/monthly/yearly charges and the honest unconfigured
state. Current store offers/access remain authoritative; Debug preview is separate
and absent in Release. Restore/manage cannot fabricate entitlements, cancellation
or renewal dates. Existing cats, drafts, records and free outputs stay available.
Training and food scanning/recalls remain explicitly unavailable concepts.

Mobbin was inspected through the connected app after the direct MCP endpoint
returned a transient OAuth discovery 522. [Moonly](https://mobbin.com/screens/b2a7f4f6-e03e-4875-97ec-79c299a244c7)
keeps recurring charges beside plan choices; [GoPro Quik](https://mobbin.com/screens/ba660508-b08d-4fc5-80d2-88761e240455)
separates password recovery from the short sign-in form. Also inspected Lifesum
and H&M. Borrow mechanics only, not their artwork, promotions or reviews. The
board's eight screens were captured in both themes before native edits under
ignored `.verify-build/soft-paws/account/board/`.

Verify real unavailable-service and local-data preservation boundaries, legacy/new
routing, price selection/free exit, no fake restore/subscription, explicit Debug
preview/end-preview, transient passwords/background, validation/failure and native
light/dark/larger-text screenshots. Keep physical/assistive/store/provider success
and individual native visual approval separate from simulator proof.

Initial native captures exposed a legacy Back pill and an over-small sign-in cat
on taller phones. This pass now uses the approved 48dp circle and selects the
compact cat size by physical viewport/text scale, independent of error-footer
height. Native availability also reads actual SDK configuration, rather than
assuming an enabled integration has keys. Initial Android interaction failures
were locator failures: labels and inputs are separate, and a selected radio
choice remains checkable even when it has no Click accessibility action. These
initial captures/results are not final acceptance evidence.

The port also retains the base's Terms/Privacy setup-note dialogs, Restore access
from the membership page and direct store cancellation when an entitlement is
verified. The new board's future-ideas page keeps planned scanner/training claims
out of the active Premium benefits. Setup notes are not final legal documents.


## Completed native verification

All 182 JVM tests and 30 tooling checks pass, together with Android Debug/Release,
lint/migrations and current iOS Debug/Release hosts/bundles. The normal Android
suite's screen and access cases pass; its protected-password case passes in a
separate run with identical production sources. All three cases also pass at a
cold 130% text launch. iOS passes all five normal cases and four larger-text cases.
Both themes and all eight destinations have paired captures and inspected native
sheets. The original Rive cat remains interactive, with a checked 48-point target.

The Android test now follows Compose's actual accessibility hierarchy: the label
is a child of the protected editable node. It checks only Empty/Entered and waits
for the same Activity to reach stopped state before resuming. An arbitrary
700ms Home delay can resume before the lifecycle transition under build load.
Neither protected values nor generated input is printed by these assertions.
The iOS runtime exposes the protected input as a TextView with Empty/Entered.
Earlier locator/timing failures are excluded from accepted behavior claims.

Native checks cover real unavailable Apple/Google/email/reset outcomes, invalid
email/mismatch, route/background clearing, every full recurring price, disabled
purchase/restore, no assumed subscription, Terms/Privacy setup notes, explicit
Debug preview/end-preview and free local-care exits. Three pre-existing journals
per platform pass integrity and retain every table hash. Android font scale ends
at 1.0, iOS at large, and the owned apps return to Home with normal cat motion.
No real credentials, reset email, purchase, subscription cancellation, upload or
live AI request is involved. See [account evidence](../docs/design/evidence/soft-paws-account/README.md)
and [product behavior](../docs/product/soft-paws-account-and-plans.md).

Only these eight destinations move to implemented-unverified: **68 implemented-unverified / 21 pending**. This is implementation/runtime proof, not individual
native visual approval or a completed full-app port.
