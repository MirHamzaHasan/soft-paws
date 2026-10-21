# Soft Paws · optional account and plans

The approved account and plan destinations use shared Compose with the cat kit,
the original Rive cat and the existing native authentication/purchases boundaries.
The first cat’s local journal works without an account or network. Accounts do
not sync or back up care records. No Soft Paws Firebase or store registration is
installed by this port, and no real account, reset email or transaction is claimed.

Apple, Google and email/password use the existing authentication controller.
Create account and password reset have independent routes and return paths;
legacy email-link callbacks remain compatible. Native availability comes from
the actual engine configuration rather than a plugin-enabled flag. An unavailable
engine rejects a request before credentials reach it. Errors appear beside the
action. Reset instructions appear only after a successful native reset request.

Email may survive a UI recreation. Password and confirmation are transient
Compose state, clear on background or route changes and never enter saveable
state, preferences, SQLite or journal drafts. Protected fields expose only
Empty/Entered state to accessibility. Existing request cancellation and provider
outcomes remain authoritative; local care stays available after a failure.

The paywall shows three full recurring charges, without a preselected plan.
Configured builds use real current store offers; unconfigured builds show the
approved USD proposals ($2.99/week, $6.99/month and $39.99/year) and a disabled
purchase action. No trial, renewal date or entitlement is assumed. The free exit
preserves first-run/additional-cat drafts and a contextual output’s return path.

Membership and restore read the current store entitlement. Store management
opens the platform’s subscription centre only when configured. Cancellation is
performed there; no local button fabricates a cancellation or refund. Explicit
Debug Premium preview is labelled separately, can be ended and is unavailable in
Release. First-cat care, existing records, on-phone reports, raw CSV and direct
saved veterinary contacts remain free.

Terms and Privacy open clearly labelled setup notes, retaining the base’s
functionality. They are not final legal documents. Training and pet-food
scanning/recall monitoring are static, unavailable future concepts, outside the
active Premium benefits. No scanner, training programme or monitoring service is
introduced.

The eight board destinations are `sign-in`, `email-sign-in`, `create-account`,
`password-reset`, `paywall`, `account-plan`, `manage-subscription` and
`future-features`. An auxiliary Restore destination keeps the existing boundary.
The isolated Debug fixture `soft-paws-account-v1` owns its SQLite file and
preference namespace, one synthetic cat, a saved observation and a retained draft.
It cannot authenticate or purchase. Native verification and visual evidence are
tracked in task011; provider/store success, physical devices, assistive review
and individual native visual approval require separate proof.
