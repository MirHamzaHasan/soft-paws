# Soft Paws task006 · cat Safety and contacts

Status: implemented and simulator-verified · 21 October 2026. Individual native
visual approval and physical/assistive review remain open. Approved surfaces:
safety, symptoms, contacts, contact-form, region, nearby-vets, location-denied,
toxicity and safety-topics.

The nine cat layouts now use shared Compose and the real profile, SQLite draft,
device dial/URL and one-shot location boundaries. Saved contacts and caregiver
observation choices remain free, offline-readable and independent of AI, accounts,
Premium or location permission. The approved category marks, clear borders,
Bricolage/Inter pairing and flat action area are retained.

Both inherited veterinarian/emergency-contact slots remain intact. Independent
optional address/notes use backward-compatible profile JSON fields, preserving
general profile notes and other facts. The established emergency-editor draft
slot and captured revision remain compatible. Save removes the draft only after
commit. Confirmed clearing affects one contact, preserving the other slot and
Journal history. Failed/stale writes keep entries and the existing Back guard.
No SQLite schema or filename change is needed.

The observation checklist passes caregiver selections into a call summary;
it never scores urgency, diagnoses or creates a Journal event. Brief feline
urinary/lily/exposure guidance links primary sources. Region entry never invents
a universal/local vet number. Six supported countries retain verified animal
poison-service listings with purpose, source/date and fee/coverage caveats.
Unsupported regions keep the caregiver's own contacts available.

Maps stays Premium; manual place entry needs no permission. Punctuation and
non-English text survive the fallback. Location is one-shot, cancellable and
excluded from saved navigation, care records and AI context. Actual native denial
on both systems preserves the typed place and free contacts. The unrequested
permission state was restored after QA. No clinics, distances or hours are invented.

Exposure details and safety topics retain Premium, versioned per-cat weekly
consent, fresh identity and server-policy gates. Safety prompts now refer to cats.
Unconfigured AI is labelled unavailable; no live recheck or request was made.
There is no account/key configuration, real transaction, automatic upload or sync.

## Actual verification

- Android Debug/Release, lint, migrations, **168 JVM tests** and 30 tooling tests
  pass. Four new real-repository tests cover old JSON/drafts, disk reopen,
  independent contact notes, forced failure/rollback, stale revisions, preserving
  clear, region/URL handling and cat-specific bounded AI context/consent checks.
- Android full journeys pass at font scales 1.0 and 1.3, querying actual SQLite
  values, revisions and counts. They cover draft/keep/relaunch, save, clear
  cancellation, confirmed clear/restoration, call selections, region entry,
  manual fallback, exposure retention and all nine screens in both themes.
- iOS passes all four cases at normal and extra-extra-extra-large text. Read-only
  SQLite proof confirms contact notes, unchanged other profile/contact fields and
  all 20 Journal rows. Separate native permission-denial cases pass on both
  systems with the real prompt, retained place and free contacts.
- Current iOS Debug/Release hosts and bundle checks pass. UI-test-only Swift
  additions reused the unchanged verified Debug framework with hash guards;
  the final Release host used the normal integration build.
- All 18 board/Android/iOS pairs, larger-text sheets and native permission frames
  were inspected. Fresh Home frames confirm the existing continuous Rive idle.
  Both apps finish on Home with normal text/appearance/motion preferences.

See [native evidence](../docs/design/evidence/soft-paws-safety/README.md) for accepted
results/source hashes, helper/transport iterations, cancelled pre-refinement build
and physical/assistive/integration limits. Individual native visual approval and
the remaining global-state surfaces are separate open gates.

Mobbin MCP: [Grab Driver · Emergency Contacts](https://mobbin.com/screens/c2ad0973-1719-4ef4-a31f-bb2fed7ef6d1).
The inspected image informed direct saved name/number display and a separate add
contact action. No artwork or location-sharing behavior was copied. All nine
approved cat board destinations were inspected in both themes before building.

[Primary-source and implementation contract](../docs/product/soft-paws-safety.md)
records the 21 October feline guidance/service-number review. No real calls were
placed, and no normal journal, model, credential or other QA app was altered.

The inventory is **47 implemented-unverified / 42 pending**. This delivery does
not imply complete app parity, store readiness or approval of every native screen.
