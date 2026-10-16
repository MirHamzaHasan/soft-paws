# Exact board → native parity backlog

Owner decision: 2026-10-16. The current [localhost board](http://localhost:4278/) is the target, including Bricolage Grotesque display and Inter reading. The existing native feature foundation is **not** exact visual parity.

[Parent task](../task022-exact-board-native-parity.md) · [Contract](CONTRACT.md) · [Machine-readable coverage](manifest.json) · [Pinned baseline](board-baseline.json) · [Audit](../../docs/design/native-parity-audit.md)

166 registered entries: **123 product screens/states/handoffs**, 15 Kit cards, 7 motion cards, 18 flows and 3 historical references. All are accounted for; **0 matched**. Research is supporting evidence, not an app screen. A state need not have a separate route, but must have its own exact composition and evidence. Historical comparisons and system mockups are not extra fake production routes.

[Open the versioned board/native comparison pack](../../docs/design/evidence/task022/review/index.html). Capture availability and label checks are diagnostic evidence; every individual acceptance gate remains in force.

## Shared gates and delivery order

- [NP-G01 · Pin current board + Bricolage/Inter type + computed parts](gates/G01-kit-and-type.md) — in-progress
- [NP-G02 · Matched owned QA data/clock and full board-ID Debug replay](gates/G02-fixtures-and-replay.md) — in-progress
- [NP-G03 · Board-equivalent shared motion and paired capture evidence](gates/G03-motion-and-qa.md) — in-progress
- [NP-G04 · Full coverage, setup visibility and safe contextual state mapping](gates/G04-coverage-and-states.md) — in-progress

Finish shared gates, then Home first, optional onboarding/setup, all nine editors/notes, Timeline/records, profiles, health/calendar, insights/Safety/export, training/photos/expenses/Memory Book, global states and complete flows. Close one screen's vertical slice at a time. Do not batch-approve families. The existing setup section is now visible; its product entries retain individual review gates.

## Screen-by-screen work

### BarkLog kit · design 05

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [kit-mobbin-direction](kit/kit-mobbin-direction.md) · [board](http://localhost:4278/#only-kit-mobbin-direction) | Shared Compose kit / Debug review | open | open |
| [kit-visual-direction](kit/kit-visual-direction.md) · [board](http://localhost:4278/#only-kit-visual-direction) | Shared Compose kit / Debug review | open | open |
| [kit-type](kit/kit-type.md) · [board](http://localhost:4278/#only-kit-type) | Shared Compose kit / Debug review | open | open |
| [kit-controls](kit/kit-controls.md) · [board](http://localhost:4278/#only-kit-controls) | Shared Compose kit / Debug review | open | open |
| [feel-firm](kit/feel-firm.md) · [board](http://localhost:4278/#only-feel-firm) | Shared Compose kit / Debug review | open | open |
| [feel-bubbly](kit/feel-bubbly.md) · [board](http://localhost:4278/#only-feel-bubbly) | Shared Compose kit / Debug review | open | open |
| [feel-lively](kit/feel-lively.md) · [board](http://localhost:4278/#only-feel-lively) | Shared Compose kit / Debug review | open | open |
| [kit-future-parts](kit/kit-future-parts.md) · [board](http://localhost:4278/#only-kit-future-parts) | Shared Compose kit / Debug review | open | open |
| [kit-data-viz](kit/kit-data-viz.md) · [board](http://localhost:4278/#only-kit-data-viz) | Shared Compose kit / Debug review | open | open |
| [kit-colour-map](kit/kit-colour-map.md) · [board](http://localhost:4278/#only-kit-colour-map) | Shared Compose kit / Debug review | open | open |
| [kit-system-handoffs](kit/kit-system-handoffs.md) · [board](http://localhost:4278/#only-kit-system-handoffs) | Shared Compose kit / Debug review | open | open |
| [kit-day-line](kit/kit-day-line.md) · [board](http://localhost:4278/#only-kit-day-line) | Shared Compose kit / Debug review | open | open |
| [land-firm](kit/land-firm.md) · [board](http://localhost:4278/#only-land-firm) | Shared Compose kit / Debug review | open | open |
| [land-bubbly](kit/land-bubbly.md) · [board](http://localhost:4278/#only-land-bubbly) | Shared Compose kit / Debug review | open | open |
| [land-lively](kit/land-lively.md) · [board](http://localhost:4278/#only-land-lively) | Shared Compose kit / Debug review | open | open |

### Opening & guided first run

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-onboarding](flows/seq-onboarding.md) · [board](http://localhost:4278/#only-seq-onboarding) | Sequence: opening-value → dog-setup → onboarding-route → onboarding-identity → onboarding-breed → onboarding-age → onboarding-shortcuts → onboarding-practice → onboarding-notes → onboarding-timeline → onboarding-storage → onboarding-ready → home-coach | open | open |
| [opening-value](screens/opening-value.md) · [board](http://localhost:4278/#only-opening-value) | Onboarding.step0 | in-progress | in-progress |
| [home-coach](screens/home-coach.md) · [board](http://localhost:4278/#only-home-coach) | Route.Home | in-progress | in-progress |
| [onboarding-route](screens/onboarding-route.md) · [board](http://localhost:4278/#only-onboarding-route) | Onboarding.step2 | in-progress | in-progress |
| [onboarding-identity](screens/onboarding-identity.md) · [board](http://localhost:4278/#only-onboarding-identity) | Onboarding.step3 | in-progress | in-progress |
| [onboarding-breed](screens/onboarding-breed.md) · [board](http://localhost:4278/#only-onboarding-breed) | Onboarding.step4 | in-progress | in-progress |
| [onboarding-age](screens/onboarding-age.md) · [board](http://localhost:4278/#only-onboarding-age) | Onboarding.step5 | in-progress | in-progress |
| [onboarding-shortcuts](screens/onboarding-shortcuts.md) · [board](http://localhost:4278/#only-onboarding-shortcuts) | Onboarding.step6 | in-progress | in-progress |
| [onboarding-practice](screens/onboarding-practice.md) · [board](http://localhost:4278/#only-onboarding-practice) | Onboarding.step7 | in-progress | in-progress |
| [onboarding-notes](screens/onboarding-notes.md) · [board](http://localhost:4278/#only-onboarding-notes) | Onboarding.step8 | in-progress | in-progress |
| [onboarding-timeline](screens/onboarding-timeline.md) · [board](http://localhost:4278/#only-onboarding-timeline) | Onboarding.step9 | in-progress | in-progress |
| [onboarding-storage](screens/onboarding-storage.md) · [board](http://localhost:4278/#only-onboarding-storage) | Onboarding.step10 | in-progress | in-progress |
| [onboarding-ready](screens/onboarding-ready.md) · [board](http://localhost:4278/#only-onboarding-ready) | Onboarding.step11 | in-progress | in-progress |

### Home · a day with your dog

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-home](flows/seq-home.md) · [board](http://localhost:4278/#only-seq-home) | Sequence: home-before → home | open | open |
| [home-before](references/home-before.md) · [board](http://localhost:4278/#only-home-before) | Reference only | open | open |
| [home](screens/home.md) · [board](http://localhost:4278/#only-home) | Route.Home | in-progress | in-progress |

### Create a log · observations & notes

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-forms](flows/seq-forms.md) · [board](http://localhost:4278/#only-seq-forms) | Sequence: log-chooser → form-walk → form-notes-example → record-detail | open | open |
| [log-chooser](screens/log-chooser.md) · [board](http://localhost:4278/#only-log-chooser) | Feature.Chooser | in-progress | in-progress |
| [form-poop](screens/form-poop.md) · [board](http://localhost:4278/#only-form-poop) | JournalPage.New | in-progress | in-progress |
| [form-pee](screens/form-pee.md) · [board](http://localhost:4278/#only-form-pee) | JournalPage.New | in-progress | in-progress |
| [form-meal](screens/form-meal.md) · [board](http://localhost:4278/#only-form-meal) | JournalPage.New | in-progress | in-progress |
| [form-walk](screens/form-walk.md) · [board](http://localhost:4278/#only-form-walk) | JournalPage.New | in-progress | in-progress |
| [form-symptom](screens/form-symptom.md) · [board](http://localhost:4278/#only-form-symptom) | JournalPage.New | in-progress | in-progress |
| [form-mood](screens/form-mood.md) · [board](http://localhost:4278/#only-form-mood) | JournalPage.New | in-progress | in-progress |
| [form-behavior](screens/form-behavior.md) · [board](http://localhost:4278/#only-form-behavior) | JournalPage.New | in-progress | in-progress |
| [form-grooming](screens/form-grooming.md) · [board](http://localhost:4278/#only-form-grooming) | JournalPage.New | in-progress | in-progress |
| [form-weight](screens/form-weight.md) · [board](http://localhost:4278/#only-form-weight) | JournalPage.New | in-progress | in-progress |
| [form-notes-example](screens/form-notes-example.md) · [board](http://localhost:4278/#only-form-notes-example) | JournalPage.New | in-progress | in-progress |

### Timeline · approved + scope

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-timeline](flows/seq-timeline.md) · [board](http://localhost:4278/#only-seq-timeline) | Sequence: timeline → timeline-filters → timeline-local-events → timeline-pagination | open | open |
| [timeline](screens/timeline.md) · [board](http://localhost:4278/#only-timeline) | Route.Timeline | in-progress | in-progress |
| [timeline-filters](screens/timeline-filters.md) · [board](http://localhost:4278/#only-timeline-filters) | Route.Timeline | in-progress | in-progress |
| [timeline-local-events](screens/timeline-local-events.md) · [board](http://localhost:4278/#only-timeline-local-events) | Route.Timeline | in-progress | in-progress |
| [timeline-pagination](screens/timeline-pagination.md) · [board](http://localhost:4278/#only-timeline-pagination) | Route.Timeline | in-progress | in-progress |

### Record lifecycle

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-records](flows/seq-records.md) · [board](http://localhost:4278/#only-seq-records) | Sequence: record-detail → record-edit | open | open |
| [record-detail](screens/record-detail.md) · [board](http://localhost:4278/#only-record-detail) | JournalPage.Detail | in-progress | in-progress |
| [delete-confirmation](screens/delete-confirmation.md) · [board](http://localhost:4278/#only-delete-confirmation) | JournalPage.Detail | in-progress | in-progress |
| [record-edit](screens/record-edit.md) · [board](http://localhost:4278/#only-record-edit) | JournalPage.Edit | in-progress | in-progress |

### Profile & early Insights · approved

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-profile](flows/seq-profile.md) · [board](http://localhost:4278/#only-seq-profile) | Sequence: profile → insights | open | open |
| [profile](references/profile.md) · [board](http://localhost:4278/#only-profile) | Reference only | open | open |
| [insights](references/insights.md) · [board](http://localhost:4278/#only-insights) | Reference only | open | open |

### Profiles & settings

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-profiles](flows/seq-profiles.md) · [board](http://localhost:4278/#only-seq-profiles) | Sequence: profile-hub → dog-switcher → profile-settings | open | open |
| [profile-hub](screens/profile-hub.md) · [board](http://localhost:4278/#only-profile-hub) | Route.Profile | in-progress | in-progress |
| [dog-switcher](screens/dog-switcher.md) · [board](http://localhost:4278/#only-dog-switcher) | Feature.DogSwitcher | in-progress | in-progress |
| [dog-add](screens/dog-add.md) · [board](http://localhost:4278/#only-dog-add) | Feature.DogAdd | in-progress | in-progress |
| [dog-edit](screens/dog-edit.md) · [board](http://localhost:4278/#only-dog-edit) | Feature.DogEdit | in-progress | in-progress |
| [profile-settings](screens/profile-settings.md) · [board](http://localhost:4278/#only-profile-settings) | Feature.Settings | in-progress | in-progress |
| [delete-dog](screens/delete-dog.md) · [board](http://localhost:4278/#only-delete-dog) | Feature.DeleteDog | in-progress | in-progress |
| [delete-all-data](screens/delete-all-data.md) · [board](http://localhost:4278/#only-delete-all-data) | Feature.DeleteAll | in-progress | in-progress |

### Medication & vaccination

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-medications](flows/seq-medications.md) · [board](http://localhost:4278/#only-seq-medications) | Sequence: health-records → medication-list → medication-detail → medication-given | open | open |
| [health-records](screens/health-records.md) · [board](http://localhost:4278/#only-health-records) | Feature.Health | in-progress | in-progress |
| [medication-list](screens/medication-list.md) · [board](http://localhost:4278/#only-medication-list) | Feature.Medications | in-progress | in-progress |
| [medication-plan](screens/medication-plan.md) · [board](http://localhost:4278/#only-medication-plan) | Feature.MedicationForm | in-progress | in-progress |
| [medication-plan-edit](screens/medication-plan-edit.md) · [board](http://localhost:4278/#only-medication-plan-edit) | Feature.MedicationForm | in-progress | in-progress |
| [medication-detail](screens/medication-detail.md) · [board](http://localhost:4278/#only-medication-detail) | Feature.MedicationDetail | in-progress | in-progress |
| [medication-given](screens/medication-given.md) · [board](http://localhost:4278/#only-medication-given) | Feature.MedicationGiven | in-progress | in-progress |
| [medication-archive](screens/medication-archive.md) · [board](http://localhost:4278/#only-medication-archive) | Feature.MedicationArchive | in-progress | in-progress |
| [vaccination-list](screens/vaccination-list.md) · [board](http://localhost:4278/#only-vaccination-list) | Feature.Vaccinations | in-progress | in-progress |
| [vaccination-form](screens/vaccination-form.md) · [board](http://localhost:4278/#only-vaccination-form) | Feature.VaccinationForm | in-progress | in-progress |
| [medication-empty](screens/medication-empty.md) · [board](http://localhost:4278/#only-medication-empty) | Feature.Medications | in-progress | in-progress |
| [medication-save-error](screens/medication-save-error.md) · [board](http://localhost:4278/#only-medication-save-error) | Feature.MedicationDetail | in-progress | open |

### Care calendar & reminders

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-calendar](flows/seq-calendar.md) · [board](http://localhost:4278/#only-seq-calendar) | Sequence: care-calendar → care-task-detail → care-task-form → reminder-opt-in | open | open |
| [care-calendar](screens/care-calendar.md) · [board](http://localhost:4278/#only-care-calendar) | Feature.Calendar | in-progress | in-progress |
| [care-task-detail](screens/care-task-detail.md) · [board](http://localhost:4278/#only-care-task-detail) | Feature.TaskDetail | in-progress | in-progress |
| [care-task-form](screens/care-task-form.md) · [board](http://localhost:4278/#only-care-task-form) | Feature.TaskForm | in-progress | in-progress |
| [reminder-opt-in](screens/reminder-opt-in.md) · [board](http://localhost:4278/#only-reminder-opt-in) | Feature.ReminderOptIn | in-progress | in-progress |
| [reminder-denied](screens/reminder-denied.md) · [board](http://localhost:4278/#only-reminder-denied) | Feature.ReminderOptIn | in-progress | in-progress |
| [reminder-failure](screens/reminder-failure.md) · [board](http://localhost:4278/#only-reminder-failure) | Feature.ReminderOptIn | in-progress | in-progress |
| [care-task-overdue](screens/care-task-overdue.md) · [board](http://localhost:4278/#only-care-task-overdue) | Feature.TaskDetail | in-progress | in-progress |
| [care-task-complete](screens/care-task-complete.md) · [board](http://localhost:4278/#only-care-task-complete) | Feature.TaskDetail | in-progress | in-progress |
| [reminder-scheduled](screens/reminder-scheduled.md) · [board](http://localhost:4278/#only-reminder-scheduled) | Feature.ReminderOptIn | in-progress | in-progress |
| [care-task-delete](screens/care-task-delete.md) · [board](http://localhost:4278/#only-care-task-delete) | Feature.TaskDetail | in-progress | in-progress |

### Insights & trends

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-insights](flows/seq-insights.md) · [board](http://localhost:4278/#only-seq-insights) | Sequence: insights-overview → trends-month → report-preview | open | open |
| [insights-overview](screens/insights-overview.md) · [board](http://localhost:4278/#only-insights-overview) | Route.Insights | in-progress | in-progress |
| [trends-month](screens/trends-month.md) · [board](http://localhost:4278/#only-trends-month) | Feature.Monthly | in-progress | in-progress |
| [trends-sparse](screens/trends-sparse.md) · [board](http://localhost:4278/#only-trends-sparse) | Feature.Monthly | in-progress | in-progress |
| [trends-empty](screens/trends-empty.md) · [board](http://localhost:4278/#only-trends-empty) | Feature.Monthly | in-progress | open |

### Offline Safety Center

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-safety](flows/seq-safety.md) · [board](http://localhost:4278/#only-seq-safety) | Sequence: safety-home → emergency-card → toxicity-search → triage | open | open |
| [safety-home](screens/safety-home.md) · [board](http://localhost:4278/#only-safety-home) | Feature.Safety | in-progress | in-progress |
| [emergency-card](screens/emergency-card.md) · [board](http://localhost:4278/#only-emergency-card) | Feature.Emergency | in-progress | in-progress |
| [emergency-contact](screens/emergency-contact.md) · [board](http://localhost:4278/#only-emergency-contact) | Feature.EmergencyEdit | in-progress | in-progress |
| [toxicity-search](screens/toxicity-search.md) · [board](http://localhost:4278/#only-toxicity-search) | Feature.Toxicity | in-progress | in-progress |
| [toxicity-result](screens/toxicity-result.md) · [board](http://localhost:4278/#only-toxicity-result) | Feature.Toxicity | in-progress | in-progress |
| [toxicity-unknown](screens/toxicity-unknown.md) · [board](http://localhost:4278/#only-toxicity-unknown) | Feature.Toxicity | in-progress | in-progress |
| [first-aid](screens/first-aid.md) · [board](http://localhost:4278/#only-first-aid) | Feature.FirstAid | in-progress | in-progress |
| [triage](screens/triage.md) · [board](http://localhost:4278/#only-triage) | Feature.Triage | in-progress | in-progress |

### Vet preparation & exports

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-exports](flows/seq-exports.md) · [board](http://localhost:4278/#only-seq-exports) | Sequence: vet-prep → report-preview → export-format → export-progress → export-complete → share-handoff | open | open |
| [vet-prep](screens/vet-prep.md) · [board](http://localhost:4278/#only-vet-prep) | Feature.Report | in-progress | in-progress |
| [report-preview](screens/report-preview.md) · [board](http://localhost:4278/#only-report-preview) | Feature.ReportPreview | in-progress | in-progress |
| [export-format](screens/export-format.md) · [board](http://localhost:4278/#only-export-format) | Feature.ReportPreview | in-progress | in-progress |
| [export-progress](screens/export-progress.md) · [board](http://localhost:4278/#only-export-progress) | Feature.Export | in-progress | in-progress |
| [export-failure](screens/export-failure.md) · [board](http://localhost:4278/#only-export-failure) | Feature.Export | in-progress | in-progress |
| [export-complete](screens/export-complete.md) · [board](http://localhost:4278/#only-export-complete) | Feature.Export | in-progress | in-progress |
| [share-handoff](screens/share-handoff.md) · [board](http://localhost:4278/#only-share-handoff) | Feature.Export | in-progress | in-progress |

### Training

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-training](flows/seq-training.md) · [board](http://localhost:4278/#only-seq-training) | Sequence: training-catalog → training-program → training-session → training-summary | open | open |
| [training-catalog](screens/training-catalog.md) · [board](http://localhost:4278/#only-training-catalog) | Feature.Training | in-progress | in-progress |
| [training-program](screens/training-program.md) · [board](http://localhost:4278/#only-training-program) | Feature.Program | in-progress | in-progress |
| [training-session](screens/training-session.md) · [board](http://localhost:4278/#only-training-session) | Feature.Session | in-progress | in-progress |
| [training-summary](screens/training-summary.md) · [board](http://localhost:4278/#only-training-summary) | Feature.TrainingSummary | in-progress | in-progress |
| [training-empty](screens/training-empty.md) · [board](http://localhost:4278/#only-training-empty) | Feature.Training | in-progress | open |
| [training-error](screens/training-error.md) · [board](http://localhost:4278/#only-training-error) | Feature.Training | in-progress | open |
| [training-progress](screens/training-progress.md) · [board](http://localhost:4278/#only-training-progress) | Feature.TrainingProgress | in-progress | in-progress |

### Photo journal & baselines

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-photos](flows/seq-photos.md) · [board](http://localhost:4278/#only-seq-photos) | Sequence: photo-journal → photo-picker → photo-form → photo-detail → photo-baselines | open | open |
| [photo-journal](screens/photo-journal.md) · [board](http://localhost:4278/#only-photo-journal) | Feature.Photos | in-progress | in-progress |
| [photo-picker](screens/photo-picker.md) · [board](http://localhost:4278/#only-photo-picker) | Feature.PhotoForm | in-progress | in-progress |
| [photo-form](screens/photo-form.md) · [board](http://localhost:4278/#only-photo-form) | Feature.PhotoForm | in-progress | in-progress |
| [photo-detail](screens/photo-detail.md) · [board](http://localhost:4278/#only-photo-detail) | Feature.PhotoDetail | in-progress | in-progress |
| [photo-baselines](screens/photo-baselines.md) · [board](http://localhost:4278/#only-photo-baselines) | Feature.Baselines | in-progress | in-progress |
| [photo-missing](screens/photo-missing.md) · [board](http://localhost:4278/#only-photo-missing) | Feature.PhotoDetail | in-progress | in-progress |
| [photo-unavailable](screens/photo-unavailable.md) · [board](http://localhost:4278/#only-photo-unavailable) | Feature.PhotoForm | in-progress | in-progress |
| [photo-permission-denied](screens/photo-permission-denied.md) · [board](http://localhost:4278/#only-photo-permission-denied) | Feature.PhotoForm | in-progress | in-progress |

### Expenses

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-expenses](flows/seq-expenses.md) · [board](http://localhost:4278/#only-seq-expenses) | Sequence: expenses-list → expense-form → expense-detail | open | open |
| [expenses-list](screens/expenses-list.md) · [board](http://localhost:4278/#only-expenses-list) | Feature.Expenses | in-progress | in-progress |
| [expense-form](screens/expense-form.md) · [board](http://localhost:4278/#only-expense-form) | Feature.ExpenseForm | in-progress | in-progress |
| [expense-detail](screens/expense-detail.md) · [board](http://localhost:4278/#only-expense-detail) | Feature.ExpenseDetail | in-progress | in-progress |
| [expense-delete](screens/expense-delete.md) · [board](http://localhost:4278/#only-expense-delete) | Feature.ExpenseDetail | in-progress | in-progress |
| [expense-error](screens/expense-error.md) · [board](http://localhost:4278/#only-expense-error) | Feature.ExpenseForm | in-progress | in-progress |
| [expense-empty](screens/expense-empty.md) · [board](http://localhost:4278/#only-expense-empty) | Feature.Expenses | in-progress | in-progress |
| [expense-receipt](screens/expense-receipt.md) · [board](http://localhost:4278/#only-expense-receipt) | Feature.ExpenseForm | in-progress | in-progress |

### Memory Book

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-memory](flows/seq-memory.md) · [board](http://localhost:4278/#only-seq-memory) | Sequence: memory-book → memory-highlight → memory-share | open | open |
| [memory-book](screens/memory-book.md) · [board](http://localhost:4278/#only-memory-book) | Feature.Memory | in-progress | in-progress |
| [memory-highlight](screens/memory-highlight.md) · [board](http://localhost:4278/#only-memory-highlight) | Feature.MemoryHighlight | in-progress | in-progress |
| [memory-sparse](screens/memory-sparse.md) · [board](http://localhost:4278/#only-memory-sparse) | Feature.Memory | in-progress | in-progress |
| [memory-photo-missing](screens/memory-photo-missing.md) · [board](http://localhost:4278/#only-memory-photo-missing) | Feature.MemoryHighlight | in-progress | in-progress |
| [memory-share](screens/memory-share.md) · [board](http://localhost:4278/#only-memory-share) | Feature.MemoryShare | in-progress | in-progress |
| [memory-collection](screens/memory-collection.md) · [board](http://localhost:4278/#only-memory-collection) | Feature.MemoryCollection | in-progress | in-progress |
| [memory-caption](screens/memory-caption.md) · [board](http://localhost:4278/#only-memory-caption) | Feature.MemoryCaption | in-progress | in-progress |
| [memory-empty](screens/memory-empty.md) · [board](http://localhost:4278/#only-memory-empty) | Feature.Memory | in-progress | in-progress |

### Global states

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-states](flows/seq-states.md) · [board](http://localhost:4278/#only-seq-states) | Sequence: startup-loading → home-empty → save-error → offline-ready → reduced-motion-state | open | open |
| [startup-loading](screens/startup-loading.md) · [board](http://localhost:4278/#only-startup-loading) | Startup.Loading | in-progress | open |
| [startup-retry](screens/startup-retry.md) · [board](http://localhost:4278/#only-startup-retry) | Startup.Failed | in-progress | open |
| [no-dog](screens/no-dog.md) · [board](http://localhost:4278/#only-no-dog) | Startup.NoDog | in-progress | open |
| [home-empty](screens/home-empty.md) · [board](http://localhost:4278/#only-home-empty) | Route.Home | in-progress | open |
| [home-loading](screens/home-loading.md) · [board](http://localhost:4278/#only-home-loading) | Route.Home | in-progress | open |
| [timeline-filtered-empty](screens/timeline-filtered-empty.md) · [board](http://localhost:4278/#only-timeline-filtered-empty) | Route.Timeline | in-progress | open |
| [save-error](screens/save-error.md) · [board](http://localhost:4278/#only-save-error) | JournalPage.New | in-progress | open |
| [saving-state](screens/saving-state.md) · [board](http://localhost:4278/#only-saving-state) | JournalPage.New | in-progress | open |
| [retained-draft](screens/retained-draft.md) · [board](http://localhost:4278/#only-retained-draft) | JournalPage.New | in-progress | open |
| [journal-error](screens/journal-error.md) · [board](http://localhost:4278/#only-journal-error) | JournalState.readFailed | in-progress | open |
| [offline-ready](screens/offline-ready.md) · [board](http://localhost:4278/#only-offline-ready) | Route.Home | in-progress | open |
| [stale-record](screens/stale-record.md) · [board](http://localhost:4278/#only-stale-record) | JournalPage.Edit | in-progress | open |
| [permission-denied](screens/permission-denied.md) · [board](http://localhost:4278/#only-permission-denied) | Feature.ReminderOptIn | in-progress | open |
| [reduced-motion-state](screens/reduced-motion-state.md) · [board](http://localhost:4278/#only-reduced-motion-state) | Route.Home | in-progress | open |

### Name-only setup

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [seq-setup](flows/seq-setup.md) · [board](http://localhost:4278/#only-seq-setup) | Sequence: dog-setup → home | open | open |
| [dog-setup](screens/dog-setup.md) · [board](http://localhost:4278/#only-dog-setup) | Onboarding.step1 | in-progress | in-progress |

### Motion & continuity

| Task / exact board card | Kind | Native target | Status |
| --- | --- | --- | --- |
| [motion-press](motion/motion-press.md) · [board](http://localhost:4278/#only-motion-press) | Shared Compose kit / Debug review | open | open |
| [transition-setup-home](motion/transition-setup-home.md) · [board](http://localhost:4278/#only-transition-setup-home) | Shared Compose kit / Debug review | open | open |
| [transition-medication-given](motion/transition-medication-given.md) · [board](http://localhost:4278/#only-transition-medication-given) | Shared Compose kit / Debug review | open | open |
| [transition-calendar-edit](motion/transition-calendar-edit.md) · [board](http://localhost:4278/#only-transition-calendar-edit) | Shared Compose kit / Debug review | open | open |
| [transition-trend-report](motion/transition-trend-report.md) · [board](http://localhost:4278/#only-transition-trend-report) | Shared Compose kit / Debug review | open | open |
| [transition-photo-memory](motion/transition-photo-memory.md) · [board](http://localhost:4278/#only-transition-photo-memory) | Shared Compose kit / Debug review | open | open |
| [transition-notes-timeline](motion/transition-notes-timeline.md) · [board](http://localhost:4278/#only-transition-notes-timeline) | Shared Compose kit / Debug review | open | open |

## Recheck coverage

Start the existing server with `node design/board/tools/serve.mjs 4278`, then:

```sh
node --experimental-websocket tools/board_inventory.mjs http://127.0.0.1:4278/ .verify-build/parity-audit/live-board.json
python3 tools/check_native_parity.py --live .verify-build/parity-audit/live-board.json
python3 tools/verify.py --metadata-only
```

The checker catches missing/duplicate entries/tasks, deleted source paths, drift in pinned board assets, broken sequence references and completion claims without per-platform evidence. A changed board requires an explicit reviewed baseline update; never rebaseline merely to make a native diff pass. Picks/Notes remain untouched.
