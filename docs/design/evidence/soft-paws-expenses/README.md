# Soft Paws · recorded cat-care expenses · 21 October 2026

The three approved destinations now use shared Compose, the generated cat kit,
Bricolage/Inter, named colour marks, circular Back and fixed actions. Actual local
records supply every amount, entered date, category, note and receipt. Currencies
have separate integer totals; no exchange rate or combined-currency total exists.
The inherited PKR default remains explicit. Exact legacy/custom categories and
retained draft slots/keys remain supported.

Paired comparisons were inspected in both themes:

- List: [light](paired-light-expenses.jpg), [dark](paired-dark-expenses.jpg).
- Form: [light](paired-light-expense-form.jpg), [dark](paired-dark-expense-form.jpg).
- Detail: [light](paired-light-expense-detail.jpg), [dark](paired-dark-expense-detail.jpg).

The board is labelled example data (USD 43.75). Native screenshots show actual
saved synthetic QA records, including repeated test entries and mixed currencies.
Android and the smaller iPhone SE have different viewports and retained records;
these comparisons establish composition and runtime behavior, not exact pixel
parity or individual owner approval. Longer forms and lists scroll above their
fixed actions. Extra native date, currency, category and notes controls preserve
the existing app's functionality beyond the simplified prototype.

Android's final normal-size journey passes in **143.779 seconds**. It uses the
real file picker, cancels once, imports an owned PDF, retains/reopens its draft,
changes currency/date, forces a real SQLite insert failure and retries, edits and
reopens the saved expense, opens/dismisses native sharing, checks separate
currency totals/report scope and checks cancelled/confirmed removal. Invalid
amounts retain their exact text and show validation beside the fixed save action.
Temporarily
moving only the newly imported owned QA file proves missing-file recovery keeps
the saved metadata/reference. The file is restored afterward. A one-shot Debug
adapter denial proves retained draft behavior; it is not an observed OS denial.

The same full Android journey passes in **141.345 seconds** at cold-start font scale **1.3**. The app is
stopped before setting/restoring font size, which ends at **1.0**. This does not
prove live font-change behavior, which remains open from task007. Larger-text
sheets: [light](android-large-light-sheet.jpg), [dark](android-large-dark-sheet.jpg).

iOS passes **three current-source cases**: native PDF import/cancellation, retained
draft, save/edit/reopen/share and delete cancellation; six light/dark screen
captures; and receipt-access-failure draft retention. Two selected cases also
pass at extra-extra-extra-large text. Supplemental captures assert the whole
multiline note input is at least 90 points tall and above the fixed action,
rather than accepting clipped accessibility bounds or only its label. The
original normal text size, **large**, is restored. Sheets:
[light](ios-large-light-sheet.jpg), [dark](ios-large-dark-sheet.jpg).

**173 JVM tests**, Android Debug/Release/lint/migrations, generated-token and all
**30 tooling checks** pass. New actual-SQLite tests cover entered-month/cat/category
isolation, USD/JPY/KWD precision, legacy categories, file reopen, failed-write
rollback/draft retention, stale deletion and shared receipt ownership. The report
test deliberately disagrees with stored timestamps and changes time zone; the
entered-month expense set and totals still match the list. Current
Debug/Release iOS host and bundle checks pass. The final optimized Release
framework completed in **8 minutes 56 seconds**, followed by the signed simulator
host and resource/identity checks. All accepted captures use the final source.

The first Android scroll attempt looked above the receipt row and failed before
selection; its helper was corrected. An initial JVM draft fixture used invalid
JSON and was corrected. Neither failed attempt is counted as a passing check.
The later note-input visibility refinement changes the test harness only; source
hashes and the built Debug framework are checked before/after supplemental runs.

Only `soft-paws-day-v1`, its separate SQLite file and owned QA files are used.
No normal journal, existing app identity, schema, migration, service registration
or store configuration changes. No live AI call or actual external file delivery
was performed. Basic expenses/report reading/raw CSV stay free; PDF keeps the
current entitlement guard. Source hashes and check summaries accompany this note.
Physical-device, assistive-technology, minimum-OS behavior and individual native
visual approval remain separate gates. Existing iOS ICU minimum-link and
AVFoundation warnings are unchanged.
