# task024 — Premium AI, account and detailed onboarding board

Owner request: later 16 October 2026. Status: board proposal complete and checked;
awaiting owner design review. Native auth, billing, AI services and permission integration are not
part of this task. Prices remain undecided by the owner's explicit reply.

## Requested outcome

Return to the Ungenerated board and design a richer first session, required
Firebase-ready sign-in, optional native permission asks during setup, a permanent
Home AI entry, a conversation interface and a persuasive free/Premium choice.
Research the flow and the revenue model rather than assuming more screens produce
profit. A free journal remains available after sign-in; AI features are paid.

## Delivered surfaces

`design/board/premium/index.html` extends the existing board in five new rows,
with 46 screens/states and five replay sequences. The original exact-board target
is not modified. Original Bricolage/Inter, BarkLog colours, flat grounds, borders,
Firm feel and reduced motion carry through.

- Opening, name/photo, life stage, breed, experience, priorities, routine, AI topic,
  reminder timing, optional access, practice and grounded AI example.
- Required Apple/Google/email-link sign-in after value. Provider cancellation,
  first-sign-in offline, invalid/expired email link and resend states.
- Answers become a plan; free/Premium and proposed dated trial layouts; both
  unresolved billing periods visible, purchasing disabled; restore/retry.
- Free/Premium/empty Home, fixed chat entry, explicit message/record permission,
  dated context, streaming/stop/regenerate, sources, threads/new/delete, no records,
  offline/error/retry, allowance state, weekly recap, vet-question and caption flows.
- Account/Profile reuse of answers, plan status, optional cancellation question,
  native subscription handoff, ended access with read-only conversations, sign-out
  and account deletion distinct from local journal deletion and billing.
- Research view with primary sources and private selected Mobbin references;
  concept, actual flow observations, free/paid boundary, unit-economics formula,
  experiment plan and unresolved implementation decisions.

## Proof and limits

See [the proposal README](../design/board/premium/README.md) and
[evidence](../docs/design/evidence/task024/README.md). Reusable QA tools cover
screens in light/dark, compact 130% text, reduced motion, live journeys and selected
real-time movement frames. Current final results are recorded in the evidence file.

Final checks: 184 screen/variant renders, zero runtime/layout/target/icon findings;
seven journey groups; retained journal through setup editing/sign-out/sign-in;
32 static destinations, seven standalone review links, no external requests and
sheet focus/Escape; 17 real-time frames and five reduced-motion plan values;
88 computed contrast pairs and repository metadata checks. These are board-only checks.

All accounts, messages, billing states, permissions and AI responses are local
examples. No Firebase account, subscription, native grant or network AI exists
because of this task. No production journal is touched. Prices, allowance,
provider/retention terms, store setup, account ownership policy, legal review and
native implementation remain separate. No profit, frame-rate, physical-device
accessibility or app-store approval claim is made.

The existing native source fingerprint remains
`34c44c1b2d0eea4673e97ea083a18b767f7ca28dc98c12c4d000829d1e161909`.
Task022 remains 166 entries / 123 product / zero matched. This task does not convert
the new board screens into Compose or rebaseline the older parity evidence.

## Subsequent native authorization

The owner later authorized the task024–026 chapter in shared Compose.
[task027](task027-native-companion-board-and-main.md) records that port, real local
persistence, explicit demo login/replies and the no-simulator validation limit.
The board checks and native fingerprints above describe this task's earlier
board-only delivery and are retained as historical evidence.
