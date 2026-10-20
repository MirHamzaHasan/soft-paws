# Premium, RevenueCat and Safety · task046

Owner direction: 20 October 2026. Local implementation verified on Android/iOS; owner defers external billing configuration and live AI recheck.

## Product boundary

The approved reference prices are **USD $2.99/week, $6.99/month and $39.99/year**.
All three full recurring prices are visible before selection. Configured stores
supply localized prices; no conversion, introductory offer or trial is invented.

Premium covers creating an additional dog, new AI replies, AI toxicity education,
dog-specific AI safety topics, nearby-vet Maps search and the existing Premium
PDF/video outputs. The first dog, existing dogs and records, local logging,
reading old conversations, mobile reports, CSV, saved emergency contacts and
“What are you seeing?” remain available without Premium. “Train your dog” is
clearly **Coming soon**, not a currently delivered subscription benefit.

Dog creation is checked before setup, at commit, and by the shared repository
wrapper. Access expiration does not delete/hide existing dogs or prevent reading
or recording their care. A retry of an already committed creation remains
idempotent after access ends. Stored Debug preview flags have no effect in Release.

## RevenueCat configuration deferred by owner

The owner selected RevenueCat and explicitly deferred supplying IDs/configuration.
Official native SDKs are behind `NativePurchasesEngine`; dog/care/location/AI data
are absent from its interface. There is no SDK configuration/network request when
the public key or entitlement identifier is blank. Purchases/restore are disabled
with an honest setup-pending state. There is no fabricated store success.

Pinned SDKs: Android 10.28.1, Apple 5.96.0 (both released 16 October 2026).
SDK sources/licenses: [Android](https://github.com/RevenueCat/purchases-android),
[Apple](https://github.com/RevenueCat/purchases-ios). Both use the MIT license.
The Apple binary SPM mirror is `https://github.com/RevenueCat/purchases-ios-spm`.

Later setup, no secrets in chat/source:

1. Create weekly, monthly and annual subscriptions in the relevant stores, using
   the approved prices. Add them to RevenueCat and attach the intended entitlement.
2. Put all three packages in the offering with the standard **weekly**, **monthly**
   and **annual** package types. Store product IDs stay in RevenueCat; the app maps
   package types rather than guessing product IDs.
3. Android: in ignored `local.properties` or Gradle properties, set
   `barklog.revenuecat.androidPublicKey`, `barklog.revenuecat.entitlementId` and
   optionally `barklog.revenuecat.offeringId`. An explicit missing offering never
   falls back to a different offering. A blank offering uses RevenueCat's current.
4. iOS: set target build settings `BARKLOG_REVENUECAT_PUBLIC_KEY`,
   `BARKLOG_REVENUECAT_ENTITLEMENT_ID`, and optional `BARKLOG_REVENUECAT_OFFERING_ID`.
   They populate the existing Info.plist keys. Only platform **public SDK keys**
   belong here. Secret API keys, store credentials and webhooks remain server-side.
5. When connecting the App Store, enable the target's In-App Purchase capability
   with the owner's Apple team/provisioning and complete the Paid Apps Agreement,
   banking and tax setup. These are external store/signing steps deferred with
   catalog configuration; no Apple account setting is changed here. See the
   [official Apple-platform installation steps](https://www.revenuecat.com/docs/getting-started/installation/ios).
   Verify sandbox/Test Store purchase, cancellation, pending payment, restore,
   expiration, grace periods, account changes and store management on signed
   devices. Check actual store pricing/terms before production. SDK entitlement
   state is authoritative; cancellation does not end already paid access early.
6. Before enabling Release online AI, the backend must enforce the corresponding
   paid access/usage policy, in addition to existing Firebase and context receipts.
   A client boolean is not server authorization. This task does not create server
   credentials, webhooks or external store/RevenueCat configuration.

The SDK receives store/billing metadata and an opaque Firebase UID when signed in;
no email/name customer attributes are set. Signed-out billing uses the SDK's
anonymous identity. Account changes clear admitted access immediately; request callbacks also capture
the SDK user and identity revision and discard results after a switch. Callbacks
for a different expected identity cannot grant it. Foreground refresh and SDK
customer listeners update access. RevenueCat owns receipts/cache; no entitlement
is serialized as a journal document or preference. Logging never waits on billing.

Primary integration references: [configuration](https://www.revenuecat.com/docs/getting-started/configuring-sdk),
[products](https://www.revenuecat.com/docs/getting-started/displaying-products),
[customer state/cache](https://www.revenuecat.com/docs/customers/customer-info).

## Dog-specific Safety AI

Toxicity and safety explanations use the same actual response provider and exact
server feature `barklog.ask-barklog-ai` as chat. They require Premium, Firebase
identity, explicit version-1 online profile/seven-day consent, server policy
receipts and the existing Release enablement gate. No new feature ID is invented.

A constrained educational purpose allows an actual AI response rather than
passing through the normal conversation's static urgent-message shortcut. Normal
urgent chat keeps that shortcut. The request includes only this dog's bounded
profile/week, no other dog, older logs, photos, contacts, location or chat history.

Answers cannot assess an exposure, supply safe/lethal amounts, diagnose, prescribe,
recommend home treatment or reassure users to wait. Shared and Safety-specific
answer checks withhold failures. The professional-call action appears before any
paywall, consent, sign-in, loading or error state. Unknown products never mean safe.
Answers are ephemeral; a changed dog, identity or consent discards the result.
The screen cancels on exit/background and supports cancellation/retry.

Design fixtures are explicitly labelled previews and do not call the backend.
A fixture success is not live AI proof. The latest known server diagnostic before
this task was `CONTEXT_FEATURE_UNKNOWN`; live proof must be recorded separately. The owner explicitly deferred another
live recheck on 20 October; it is not a completion requirement for the local slice.

## Animal emergency directory

Bundled defaults are separate from caregiver-saved clinic contacts; they never
overwrite those contacts. Sources checked **20 October 2026**:

| Country | Service and phone | Primary source |
| --- | --- | --- |
| United States | ASPCA Poison Control · +1 888 426 4435 | [ASPCA](https://www.aspca.org/pet-care/aspca-poison-control) |
| Canada | Animal Poisons Helpline · +1 917 722 5958 (international service) | [Provider country list](https://www.animalpoisons.com.au/) |
| United Kingdom | Animal PoisonLine · +44 1202 509000 | [Provider](https://www.animalpoisonline.co.uk/) |
| Australia | Animal Poisons Helpline · 1300 869 738 (domestic) | [Provider](https://www.animalpoisons.com.au/) |
| New Zealand | Animal Poisons Helpline · 0800 869 738 (domestic) | [Provider](https://www.animalpoisons.com.au/) |
| Singapore | Animal Poisons Helpline · +65 3106 4216 | [Provider](https://www.animalpoisons.com.au/) |

These specialize in **animal poisoning**, not all veterinary emergencies. The app
shows coverage/fee notes, source links and verification date. Human emergency
numbers are never represented as veterinary services. Other countries get an
honest no-verified-default state and saved local clinic contacts. Availability,
fees and domestic dialling can change; source checks require recurring upkeep.

## Optional area and worldwide Maps handoff

The device-region country is a suggestion, not confirmed physical location.
Manual country selection persists only that UI preference. Optional “Use my area”
requests location once after a tap: Android coarse permission, iOS When In Use.
No launch/background requests or tracking. Denial, disabled services, timeout and
cancellation retain manual country/city entry and free emergency calls.
Coordinates are rounded to roughly kilometre scale and held only in screen memory.
Native geocoding may use the OS geocoding service to identify a country; location
is never journal data, AI context or RevenueCat customer information.

Nearby-vet search uses Google's [universal Maps URLs](https://developers.google.com/maps/documentation/urls/get-started),
which require no API key. The user explicitly opens an external search for clinics
near a typed city or approximate coordinates, selects a clinic, verifies hours,
and uses its call option. Maps receives only that query/location. No paid Places
API, clinic database or guessed phone number is introduced. This supports Maps'
international availability; completeness, actual nearest/open clinic, connectivity
and call options are not guaranteed. Saved emergency calls stay free/offline from AI.
