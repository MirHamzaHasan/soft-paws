# task046 · Premium plans, dog safety and nearby vets

Owner direction · 20 October 2026. Status: implemented and locally verified; external configuration/live recheck deferred by owner.

This request supersedes earlier undecided prices and free additional-dog rules.
RevenueCat is the selected billing provider. The owner will supply its keys,
entitlement/offering and store product configuration later; configuration-free
builds must never claim a real purchase or grant a store entitlement.

## Required outcome and evidence

| Requirement | Evidence required |
| --- | --- |
| Adding another dog requires Premium | Entry and final-commit enforcement; first dog free; existing profiles and unfinished drafts preserved; native journey |
| AI requires Premium | Controller/provider admission uses current access, no preview bypass in Release, old conversations readable |
| All three approved USD plans | $2.99/week, $6.99/month, $39.99/year visible before selection; real configured store prices take precedence |
| RevenueCat ready for later IDs | Native purchase/restore/customer updates and shared entitlement boundary; safe unconfigured/offline/cancel/error states; setup instructions |
| Toxicity lookup answers from AI | Real provider request with dog-scoped context/consent; labelled preview fixture; loading/retry/error/cancel; immediate free call access |
| Safety topics use personalized AI | Named dog and allowed profile/week; no diagnosis/doses or invented phone numbers; no static answer masquerading as AI |
| Train your dog | Premium entry, visibly Coming soon; no sale claim that training is already delivered |
| What are you seeing? stays free | Observations lead directly to saved emergency/vet contacts, including poisoning; no AI/paywall delay |
| Verified emergency numbers | Bundled region-specific animal services with primary source/date/fee/coverage; preserve caregiver contacts; no human emergency number presented as a vet |
| Determine region with permission | Country suggestion distinguished from actual location; optional on-demand native location; manual country/city and denial/offline fallback |
| Worldwide nearest-vet option | Free-to-integrate map handoff behind Premium; location or typed place; select a clinic and call in Maps; no invented nearest/open/phone claims |
| Preserve existing app | Same journal/schema, IDs and approved tokens/components; normal journals/prefs preserved; Android/iOS builds, targeted tests and visual/native evidence |

The first dog's local logging, existing dogs/data, on-screen reports, CSV,
emergency contacts and urgent-call access remain free. Additional-dog and AI
access follow the new Premium policy. Store transactions remain unavailable
until the owner's later RevenueCat/store setup; preview access is explicit and
Debug-only. No journal sync or care/location upload to RevenueCat is introduced.

The complete feature remains in scope across turns. UI work reuses the approved
board's menus, cards, chat and paywall; new states are mirrored on the board and
checked in both themes. Physical/store and missing external configuration are
reported separately from implemented, locally verified behavior.

## Current evidence

Implementation now includes native RevenueCat adapters, shared entitlement and
creation gates, all three plan rows, constrained dog/week Safety AI, Coming soon
training, free triage-to-call routing, six-country animal poison presets, optional
one-shot native area lookup and the Premium manual/area Maps search.

146 JVM tests, Android Debug/Release/lint/migrations, both Debug native SDK builds,
Android Light/Dark journey and iOS Light/Dark pricing/emergency journey passed.
Signed-store/physical and individual visual-review limits are recorded in [evidence](../docs/design/evidence/task046/README.md).

**Live diagnostic, subsequently deferred by owner:** two live Android Safety requests on 20 October returned
HTTP422 `CONTEXT_FEATURE_UNKNOWN` for the existing `barklog.ask-barklog-ai` feature.
No accepted live answer is claimed from these calls. The owner explicitly asked
to move on and recheck later; all context checks remain enabled. See the
[sanitized diagnostic](../docs/product/atlas/2026-10-20-safety-feature-diagnostic.md).
RevenueCat configuration/store transactions are intentionally deferred by owner,
not represented as active purchasing.

### Owner follow-up · 20 October 2026

The owner explicitly deferred the live AI recheck: “move on we will check it
later”. Do not keep retrying or treat the current backend admission diagnostic as
an unresolved requirement for this local Premium/Safety slice. Keep the evidence
honest and preserve the separate Release server-policy/live-proof gate. RevenueCat
configuration and real store transactions also remain intentionally deferred.

## Delivery verification

- `python3 tools/verify.py --metadata-only`: 30 tooling tests and metadata pass.
- `python3 tools/verify.py --ios`: Android Debug/Release, lint, 146 JVM tests,
  SQLDelight migrations and signed iOS Debug/Release simulator hosts pass.
- Android native journey: Light/Dark pricing/additional-dog gate, free poisoning
  routing/animal-service number, Coming soon training, paid toxicity/topic preview
  and nearby-vet form pass. iOS: corresponding Light/Dark free/gate journey and
  Premium consent/answer-preview/manual-city entry/ending Debug preview pass.
- 36 settled board captures and six functional board journeys pass.
- Both normal journals' dogs, care events/items and documents match their initial
  row hashes after testing, update-in-place installation and normal relaunch.
- Updated Debug apps are left open in normal mode on both owned QA simulators.
  No journal reset/uninstall, service phone call or store transaction was performed.

The SDK/configuration seam and all requested local gates/screens are delivered.
RevenueCat keys/catalog/signing/store acceptance, the deferred live AI recheck,
actual OS location fix/denial on devices, external clinic availability/calling,
assistive/physical review and task022's individual visual approvals are separate
remaining release gates; none is represented as tested or completed here.
