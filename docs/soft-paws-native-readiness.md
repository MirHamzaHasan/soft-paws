# Soft Paws · native adaptation audit

**21 October implementation update:** the preserving cat contracts, independent
identities, kit/core and dated Journal/record/edit/delete flow are implemented.
The profile observer now retains a freshly confirmed selection while its list is
delayed and recovers when the selected profile disappears. Final Android
Debug/Release/lint/migrations/153 JVM checks and native standard/130% journeys pass.
The current-source iOS core and larger-text Journal journeys, Debug/Release
simulator builds and both bundle checks also pass. Paired
light/dark and larger-text captures are in
[the Journal evidence](design/evidence/soft-paws-journal/README.md).
Task002 and the cat parity inventory separate implementation, runtime evidence and
individual visual approval; the original read-only audit below remains history.

20 October 2026. Read-only inspection of the inherited native source after the
cat board was authored. This is an implementation map, not native delivery or
design approval. The owner subsequently approved the full native port on
20 October 2026; implementation is tracked in task002.

The full target remains the cat app with the existing function range, both native
hosts, the new shared screens and original Rive companion. The board's 89 product
surfaces cannot be ported by replacing the product name and mascot alone.

## Historical gaps and required changes · 20 October audit

All Kotlin paths below are relative to
`shared/src/commonMain/kotlin/com/dracoarts/shared/` unless stated otherwise.

| Area | Current source evidence | Required cat-native outcome |
| --- | --- | --- |
| App identity | `androidApp/build.gradle.kts` uses `com.draco.apps.bark.log`; both iOS host configurations use that identifier and display name BarkLog | Independent Soft Paws app identities, display names and platform resources. Preserve existing installed BarkLog journals; do not overwrite or uninstall them. |
| Service isolation | Android applies Google Services; ignored client registrations belong to the base. iOS uses `BarkFirebaseAuth.swift`. Billing properties/plist keys have the BarkLog prefix | Soft Paws needs its own registrations and billing identifiers. Unconfigured adapters must remain unavailable and local care must work. Do not silently reuse the base's credentials, callbacks, entitlement IDs or policy receipts. |
| Care taxonomy | `domain/model/CareEventType.kt` has `poop`, `pee`, `meal`, `walk`, medication/symptom/mood/behavior/grooming/weight/training/task. Home's quick actions are Poop, Pee, Meal, Walk | Implement the reviewed Meal, Water, Litter, Play, Sleep, Mood/Behaviour, Grooming, Weight and Note inputs with explicit data contracts. Keep legacy event meanings intact. A walk record must not become a play record through relabelling. |
| SQLite constraint | `shared/src/commonMain/sqldelight/com/dracoarts/shared/data/local/Journal.sq` restricts `care_events.type` to the old keys with a CHECK constraint | New keys need a preserving migration, not just enum entries. Retain UUIDs, profile foreign keys, timestamps, details/context JSON, revisions, ordering/indexes and attachment ownership. Test migrations from every supported version using actual SQLite. |
| Structured observations | `domain/model/CareDetails.kt` has separate Poop/Pee and Walk, without structured Water, Litter, Play, Sleep or Note details | Add cat contracts deliberately. Litter must distinguish observed urine/stool and unknown/unmeasured amounts. Preserve old serialized discriminators and old raw exports. Do not infer output, intake, illness or a normal baseline. |
| Profile facts | `domain/model/DogContext.kt` validates stage against Puppy, Adult, Senior, Not sure; it has no indoor/outdoor lifestyle field. `Dog.kt` owns profile validation and contact details | Support the reviewed kitten/adult/mature/senior/unknown setup and optional indoor/outdoor lifestyle without reclassifying saved legacy facts. Keep unknown facts unknown; add compatible defaults for newly optional JSON fields. Preserve caregiver notes, dates, units and contact validation. |
| Independent setup | `presentation/companion/CompanionModels.kt` stores `CompanionDraft`, `addingDog` and `editingDogId` alongside the context; the existing onboarding has dog breed suggestions and walk practice | Keep a separate additional-cat draft, start its facts independently and create/select only on final confirmation. Replace dog suggestions and practice with cat-specific copy/contracts. No inherited AI consent/history or repeated account/plan setup. |
| Navigation | `presentation/navigation/AppState.kt` has four tabs: Home, Timeline, Insights, Profile, plus typed feature stacks and dirty-form guards | Implement Today, Journal, Care, Memories, You as reviewed. Map Insights and the other existing features into the new shell while retaining Back guards, process restoration, selected-tab consistency and the persistent dock transition. Do not remove features merely because their entry points move. |
| Timeline/report/counts | `data/local/SqlDelightJournalRepository.kt` converts SQL count keys through `CareEventType.fromKey`; `domain/model/JournalReport.kt` formats each existing detail subtype | Extend count/filter/range/detail/report/CSV/PDF code for new cat events. Preserve exact database-derived counts, local-day grouping, raw values and provenance. The weekly AI context must recognise new keys without dropping observations. |
| Safety | `domain/model/SafetyReference.kt` contains explicitly dog-targeted wording and dog-specific source URLs. `presentation/companion/AtlasResponseProvider.kt`'s safety contract refers to the selected dog | Do not expose that canine reference table as cat guidance. Cat clinical/toxicity content needs species-appropriate primary sources and its own review during the implementation slice. Keep free direct contact access, manual region/place and denial/offline handling. |
| AI identity and policy | `presentation/companion/GroundedDogPrompt.kt` says CURRENT DOG IDENTITY. `services/ai/AtlasClient.kt` uses feature ID `barklog.ask-barklog-ai` and BarkLog policy/error text | Cat species/owner/profile context must be explicit throughout the active request pipeline. A client-side product rename does not create a valid server admission/policy contract. Preserve fresh identity, versioned per-cat weekly consent, byte bounds and Release live-proof gating. No live retry is authorised. |
| Premium boundaries | `domain/model/Premium.kt`, `domain/repository/PremiumDogJournalRepository.kt`, `presentation/companion/PremiumAccess.kt` and output gates implement the current access boundary | Adapt names and entry points while retaining first-cat care, existing records, on-phone reports, raw CSV and direct contacts for free. Additional cats and optional outputs/services remain gated. No local preview may become a real entitlement or be available in Release. |
| Training and future services | The navigation model still contains Training/Program/Session and TrainDog features from earlier base work | New cat entry points stay Premium / Coming soon and unavailable. Do not imply an active cat-training programme or scanning/recall monitoring service. Preserve any historical records rather than deleting them as part of a visual change. |
| Original Rive integration | Android's `RiveDogSurface.android.kt` and `iosApp/iosApp/BarkMascot.swift` select between hard-coded spaniel and notebook resources, artboards and controllers with a notebook Boolean | Add a deliberate asset/renderer contract for file 2667919: `Soft Paws Cat`, `Cat Companion`, view model `Care`, hello/curious/saved/rest triggers. A `.riv` file swap alone cannot satisfy those hard-coded contracts. Use the matching transparent still, bounded reactions, lifecycle cleanup and post-commit save cue. |
| Native evidence | `tools/check_foundation.py` asserts BarkLog's current identities; `tools/check_native_parity.py` checks the inherited board and does not prove the new board matches | Introduce Soft Paws-specific identity/parity evidence when implementation starts. Keep assertions meaningful instead of weakening checks to get a green result. Pair every approved cat screen/state with real Android/iOS captures and interaction proof. |

## Preserving the foundation

The SQLite filename is currently `barklog_kmp_v1.db` in
`data/local/JournalDriverFactory.kt`. The SQL format marker is `barklog-kmp` and
the schema still uses `dogs` / `dog_id`. These are persisted compatibility details,
not user-facing strings. Keep them stable unless a deliberate migration is
implemented and verified; the new app container can be separate from BarkLog
without renaming a journal file or editing old migrations.

Shared presentation stays Compose Multiplatform; the SwiftUI host remains a
host. Keep AppContainer wiring, ModuleRegistry cleanup, local writes before
feedback, retained stable request IDs, optimistic revisions and attachment
reference counting. Photos and highlight rendering remain native/local adapters.

## Approved implementation sequence

1. Establish independent app identity and safe unconfigured service behaviour.
   Compile both hosts without installing over existing app containers.
2. Add cat domain/profile contracts and the preserving SQLite migration. Prove
   empty, populated legacy, draft, failed-write and retry paths with real storage.
3. Port the approved kit, navigation, setup and Home, including native Rive.
   Verify the first save end to end on both platforms before widening the port.
4. Complete all remaining reviewed journal, health, safety, memories, AI/account
   and global states, reusing the foundation's real repositories/adapters.
5. Update the actual feature status and paired native parity inventory together.
   Test offline/denial/cancellation, larger text, both themes and reduced motion.
   Keep signing/device, species-specific safety review, service admission and
   real store configuration as explicit gates where not yet proven.

No native source, identity, schema, service configuration, saved journal or
device installation was changed by this audit. It does not authorise a live AI
request, transaction or upload of personal records. The subsequent explicit
owner approval authorizes the native UI port.
