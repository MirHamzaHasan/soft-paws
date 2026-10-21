# Soft Paws · recorded expenses

The approved cat expense list, form and detail use the shared Compose kit. Their
source is `ExpenseFeatureScreens.kt`; `RecordedExpenses` groups actual local
records by the caregiver's entered date and exact category. Each currency has
its own integer minor-unit total. USD, JPY and three-decimal KWD/BHD retain their
precision; there is no conversion, inferred spending or account requirement.

New category choices are Food & treats, Litter, Vet & care and Other. Medication,
Grooming and Supplies remain available. Existing custom/legacy categories,
including Training, appear unchanged when saved or in a retained draft. The
inherited PKR default stays explicit. Changing currency changes the denomination
of the entered value; it does not calculate an exchange rate.

The form preserves the existing `expense-<record ID>` draft slots and field
keys, selected date, notes and receipt references. Native date selection retains
manual entry and cancellation. The optional platform file picker imports a
local image or PDF. Cancellation/access failure retains all entries. Missing
files leave the saved amount, date, category and notes readable; editing can
replace or remove the receipt. Open/share uses an explicit native handoff.
There is no automatic upload or external delivery.

Successful save navigation follows the committed SQLite write and clears only
the target detail view's stale UI state. Failed writes preserve the form/draft.
Editing preserves the captured revision; confirmed removal also uses the exact
revision shown when the confirmation opened. Repository ownership prevents
removal of a receipt still referenced by another saved record or draft.

The list's report action carries this cat, the entered month and Expenses content
into the existing report flow. Reports include all categories in that month,
stated when the list has a category filter. Reading and raw CSV remain free;
PDF/print keep the current entitlement boundary. No store configuration changed.
Reports filter expenses by their entered date too, so a time-zone change cannot
move a cost out of the month shown on the list. Foreign-cat items are excluded.
Validation/write failures remain visible beside the fixed save action, and a
failed removal can show its error inside the confirmation.

Validation and paired screen evidence belong to task008. Board values are
labelled examples; native captures show the owned synthetic review journal's
actual records. Normal journals, application identities, database filename,
schema and preserving migrations are unchanged.
