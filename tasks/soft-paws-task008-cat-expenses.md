# Soft Paws task008 · recorded cat-care expenses

21 October 2026. Status: implemented; native behavior, builds and paired evidence
pass. Individual native visual approval and physical/assistive coverage remain open.

The approved `expenses`, `expense-form` and `expense-detail` destinations now use
shared Compose and the approved joyful cat kit, circular Back and fixed actions.
The native port preserves exact currency/minor units, arbitrary entered dates,
legacy/custom categories, notes, local image/PDF receipt references, retained
drafts, revision guards, confirmed removal and shared attachment ownership.
Basic expenses and raw CSV stay free. There is no currency conversion or upload.

Actual Mobbin MCP research inspected Brex's expense list:
https://mobbin.com/screens/1bec3e82-7d91-4969-afcf-5cbfb8402845
Take visible currency and entered-date grouping; the approved cat board remains
the visual source. Its USD 28.40 + 15.35 = 43.75 is labelled example data. Native
screens use actual saved costs and separate currency totals. All three board
surfaces were captured/inspected in both themes before native implementation.

New category choices are Food & treats, Litter, Vet & care and Other. Additional
and exact historical/custom values remain available. The inherited PKR default
and `expense-<ID>` draft slots/keys remain unchanged. Amounts retain each currency's
precision; changing denomination does not convert them. The currency suffix uses
the board's muted Inter 500 label beside the Bricolage amount.

Monthly report entry carries this cat, the selected month and Expenses content.
Report inclusion now follows the entered expense date, so a time-zone change does
not disagree with the list. A database test deliberately supplies disagreeing
timestamps and foreign-cat items. Validation/write errors stay beside Save;
removal captures the displayed revision and can show a failed delete in its
confirmation. Successful navigation follows the committed local write.

Receipt selection/cancellation/access failure, missing files and adapter
exceptions retain the draft or saved metadata. Real native journeys import an
owned PDF, retain/reopen it, edit/save, open/dismiss sharing, recover from a forced
SQLite write failure and verify cancelled/confirmed removal. Android temporarily
moves only its newly imported QA file to verify missing-file metadata/references,
then restores it. Receipt denial uses a labelled one-shot Debug adapter fault;
it is not represented as an observed OS denial.

All **173 JVM tests**, Android Debug/Release/lint/migrations and **30 tooling
checks** pass. The full Android journey passes in **143.779 s** at font 1.0 and
**141.345 s** at cold-start font 1.3. iOS passes **three normal and two larger-text
cases**, including a minimum-height/full-bounds check for the entire note input.
Current Debug/Release simulator hosts and both bundle checks pass. The final
optimized Release framework completed in **8m 56s**. Final source hashes and
accepted paired normal/larger-text captures were checked:
[expense evidence](../docs/design/evidence/soft-paws-expenses/README.md).

Only the separate `soft-paws-day-v1` review journal and owned QA files are used.
Normal journals, existing app identities, schema/migrations and service/store
configuration remain unchanged. Both native text settings are restored; Android
live font-change behavior remains unverified from task007. Physical-device,
assistive, minimum-OS and individual native visual review remain separate gates.
The inventory is **55 implemented-unverified / 34 pending**; the full cat port
remains active. Task009's photo/Memory Book research and board review are prepared.
