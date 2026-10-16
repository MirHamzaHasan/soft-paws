# task025 — Light, flexible dog onboarding

Owner request: 16 October 2026. Status: board refinement implemented and checked;
awaiting owner design review. This refines task024. Native app code and integrations
are unchanged; prices remain undecided.

## Delivered behavior

The proposal defaults to Light, preserves explicit theme choices and adds eight
optional dog-detail/review screens, bringing it to 54 screens/states and 20 opening/
setup surfaces. It retains the BarkLog kit, Bricolage/Inter and Firm controls.

- Notification access is an animated on/off switch. Pending/dismissed/denied stays
  off; Allow enables it. Denial opens a labeled Settings preview. Reminder enablement
  is separate from the OS grant, and daily/task/medication preferences are separate.
  Camera and selected-photo actions remain per use.
- Priorities, routines, AI topics, personality, activities and food support multiple
  answers. Removable chips show exact selections. Breed search accepts arbitrary
  custom/Unicode entries and mixtures, with case-insensitive deduplication. Suggestions
  are starting points, not a complete breed registry.
- Optional age/birthday, sex/neuter, size/measured weight and units, sensitivities,
  known conditions, existing care instructions and notes join an editable summary.
  Unknown fields stay unknown; no health status is inferred.
- Details carry into Profile and plan review. A separate AI context consent controls
  profile/care-note use. Authored replies use actual selected facts and retain an
  immutable source snapshot. Removing profile context excludes it from later replies.
- Progress, segmented thumbs, switches, picked checks, selection chips and profile
  values animate. Reduced motion lands immediately. Review actions remain reachable
  at compact width and 130% text.

## Validation and scope

See [evidence](../docs/design/evidence/task025/README.md) and the
[live proposal instructions](../design/board/premium/README.md).
Final results: 216 screen/variant renders, seven journey groups, retained journal,
29 static destinations and seven reviewer links, 16 real-time motion frames,
immediate reduced-motion states, 94 computed contrast pairs and metadata checks.

All checks are browser-prototype checks, not native integration or physical-device
performance/accessibility approval. The evidence records final results and source
hashes; diagnostic attempts remain in ignored `.verify-build/task025/`.

The existing example journal survives editing and sign-out/in. No installed journal
was accessed. Native/reference fingerprints remain `34c44c1b…` / `00443170…`, with
166 parity entries, 123 product and zero matched. Firebase, native grants, billing
and AI services remain simulations. No native port or owner approval is claimed.

## Subsequent native authorization

The owner later authorized the task024–026 chapter in shared Compose.
[task027](task027-native-companion-board-and-main.md) records that port, real local
persistence, explicit demo login/replies and the no-simulator validation limit.
The board checks and native fingerprints above describe this task's earlier
board-only delivery and are retained as historical evidence.
