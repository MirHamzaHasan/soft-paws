# Soft Paws · product and engineering truth

Owner direction: 20 October 2026. Soft Paws is a separate cat-care app. BarkLog is
the inherited implementation foundation; its old approvals are not approvals of
new Soft Paws screens. Repository: <https://github.com/MirHamzaHasan/soft-paws>.

## Concept

1. **Angle:** keep the small details of a cat's day so their caregiver can find
   the exact observation later, including before a veterinary visit.
2. **Person:** a cat caregiver juggling meals, litter, play and care who wants to
   capture something quickly while their hands are busy.
3. **Promise:** after a week, the caregiver can review what they actually recorded
   for this cat, with dates, notes and traceable source records.
4. **Hero:** one original tabby, the “little shadow”, beside a dated journal record.
5. **Feature map:** **daily check-ins**, **dated journal**, **vet preparation** carry
   the promise. Profiles keep each cat's facts separate. Reminders keep chosen
   plans visible. Health records preserve prescribed instructions. Insights count
   observations. Safety puts saved contacts close. Photos, Memory Book and video
   keep chosen memories. Expenses preserve costs/currencies. Optional AI uses an
   explicit bounded weekly context. Accounts and Premium support optional extras.
6. **Not:** a diagnostic/prescribing service; a journal cloud backup/sync product;
   or a source of inferred sensor readings/health scores.
7. **Honest numbers:** the board is labelled example data. Its meal chart is
   `[2,3,2,2,3,2,2]`, summing to 16 observations over 14–20 October 2026. The example
   expenses are USD 28.40 + USD 15.35 = USD 43.75. Three 3-second illustrated video
   moments total 9 seconds. Weight is a saved measurement, never an inferred ideal.

## Cat adaptation

- Meals, water, litter, play/movement, sleep, behaviour, grooming, weight and notes
  replace dog-specific activity assumptions. Litter urine/stool observations stay
  explicit; an observed visit does not measure output or establish a diagnosis.
- Profiles cover name, optional photo, breed/mix, estimated age/birthday, sex,
  neuter status, measured weight, indoor/outdoor lifestyle and caregiver care notes.
- Another cat receives independent facts, draft, journal, AI consent and history.
  Final confirmation alone creates/selects the new profile in the later native slice.
- Cat safety content needs species-appropriate primary veterinary sources and
  review during implementation. Dog-specific toxicity or medication assumptions
  cannot be reused by text substitution.

## Access boundaries

Carry the current base's feature boundaries into the proposal: first cat's local
care, existing profiles/records, on-phone reports, raw CSV and direct saved
emergency contacts are free. Additional cat creation, AI, personalised safety,
map-based nearby search and PDF/print/sharing/MP4 outputs are Premium. Photo
editing/preview and on-phone Memory Book reading stay free.

The board displays the base's recurring USD proposals, $2.99/week, $6.99/month,
$39.99/year. Real store products, RevenueCat configuration and entitlements are
not set up for Soft Paws. Transactions remain unavailable. A design preview is
never a purchase entitlement. Training and pet-food scanning/recall monitoring
are unavailable future concepts, not active services or purchase benefits.

Local care needs no account or network. Email/password, Apple and Google are the
intended optional native authentication boundaries. Accounts do not promise
journal sync/backup. Cloud AI requires affirmative per-cat consent to the profile
and the past seven calendar days, fresh identity, bounded truthful records and
the existing server-policy/live-proof Release gate. No automatic whole-journal or
photo upload. The owner deferred live AI rechecks and real store configuration.

## Visual direction and review

The new board is `design/soft-paws/`, built with the installed Ungenerated engine
and skills. Research uses actual Mobbin MCP results; links and “what we took”
notes are on its Research view. Other apps' screenshots/artwork are not bundled.
The owner's later colour refinement selects warm cream, an apricot cat card,
teal actions and butter/lilac/mint/rose/sky/periwinkle care categories. The source
is `css/tokens.css` plus `js/color-roles.js`, generated into Compose. Keep clear
borders, Bricolage Grotesque display and Inter reading. No decorative gradients
or shadows. Light/dark tokens, ≥48 px action
targets, 130% text checks, explicit selected checks and reduced motion are required.

Original Rive file 2667919 is separate from the inherited spaniels/notebook puppy.
The SVG, motion source, exported runtime, editable backup and hashes are under
`design/soft-paws/assets/cat/`. Idle breathing/blinks, bounded Hello/Curious/Saved
reactions, transparent interaction and the same-art fallback are reviewable.
Native save reactions must follow a committed write. The owner's 21 October
correction requires the gentle Idle loop to continue after bounded reactions
while the cat is visible and foregrounded. Reduced motion still uses a still;
restore normal motion in the owned review preview after screenshot QA.

## Actual implementation status

The review board is a synthetic in-memory prototype, not a new journal backend.
Its account, AI, call, picker, location, sharing and payment controls do not invoke
real services. Reviewer Picks/Notes alone may persist in the ignored review store.

The native port now includes separate Soft Paws identities, safe unconfigured
services, preserving cat observation contracts/SQLite v5, shared cat setup,
Home, five-tab navigation, care hubs, dated Journal/record editing and scoped
deletion, prescribed plans/Given history, explicit medication reminders and
vaccination image/PDF records, the real dated care agenda and task form/detail,
plus the original native Rive cat. Native date/time controls retain manual entry
and cancellation semantics. Occurrence-specific completion/undo commits with
revision-guarded Journal history; removing a plan preserves recorded care.
Cat Insights, saved-unit weight history and reports now use recorded observations,
retained vet questions, explicit selected scope and real local CSV/native sharing.
PDF/print uses current entitlement guards.
The three expense screens now retain exact currencies, entered dates, historical
categories, local image/PDF receipts and drafts. Monthly report inclusion follows
the entered date across time-zone changes. Validation stays beside Save, and
confirmed removal captures the displayed revision.
The nine Safety screens now preserve both contact slots and independent notes,
carry caregiver selections into a free call summary and keep region/manual-place
fallbacks available without AI. Safety prompts use cat wording and retain the
unconfigured-service/consent guards. Android native journeys and 173 JVM tests
pass. Health/document, planning and Safety journeys cover both platforms and
larger text, including actual native location denial. Current Debug/Release builds
and paired screen evidence pass. The inventory is 55 implemented-unverified / 34 pending; individual native visual
approval remains open. The initial iOS
host compiled; its accessibility crash was corrected with the official iOS
renderer update and the repeated-navigation/save/relaunch tests now pass.
Full downstream native cat adaptation, paired screen parity, store preparation
and independent Firebase/service registrations remain pending. Do not reuse
BarkLog's private registrations or uninstall/clear existing device data as a
side effect of this port. The board's direction approval is already granted.

KMP, Compose, SQLDelight, AppContainer/ModuleRegistry separation and preserving
local writes remain the selected foundation. The existing database filename and
migrations stay preserved until a deliberate, tested Soft Paws storage/identity
decision. No blind global rename of persisted types/keys or service contracts.

See [the native delivery task](../../tasks/soft-paws-task002-native-port.md) for evidence
and remaining gates. Earlier BarkLog task files describe the base's history only.

## Native authorization · 20 October 2026

The owner explicitly approved the complete direction: “Approve the native port.”
See task002 and `tasks/soft-paws-native-parity.json` for actual delivery status.
The first storage slice adds cat observations and profile facts through preserving
schema v5. Both hosts use `com.draco.apps.soft.paws`; inherited Firebase client
registrations/callbacks are excluded. Atlas remains disabled in every build until
Soft Paws has its own approved admission and live proof. Own billing IDs/keys stay
deferred. Current native screen work is not a claim of completed visual parity.
