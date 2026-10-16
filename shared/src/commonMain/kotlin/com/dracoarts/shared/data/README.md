# Local care data

SQLDelight 2.1.0 generates BarkLogDatabase from Journal.sq. Schema v4 owns the local
caregiver, dogs, care events, typed care items, retained drafts, cleanup queue, companion local documents and
format metadata. Profile/details/context JSON preserves optional observations.
Migrations 1.sqm, 2.sqm and 3.sqm preserve v1/v2/v3 journals. IDs are UUIDs; times are UTC epoch
milliseconds. The checked-in databases/1.db snapshot and migration verification
must be retained when adding numbered, non-destructive migrations.

SqlDelightJournalRepository opens/validates SQLite on a background dispatcher.
A mutex serializes reads, writes and close. Transactions contain no suspending
operations. Only committed writes update dogs or invalidate event Flows; failures
and cancellation before commit roll back. No write is automatically retried.

The required LocalDataModule owns initialization/cleanup through ModuleRegistry.
Startup rejects unfamiliar versions/formats, integrity failures or broken foreign
keys and closes acquired resources. Retry never deletes or resets a database.

The new filename is barklog_kmp_v1.db. Android uses its no-backup directory; iOS
uses Application Support/BarkLogJournal with the directory excluded from backup.
Both drivers enforce foreign keys. Old WatermelonDB files are never opened or
modified. There is no cloud backup, sync or automatic legacy import.

Preferences are for UI settings only. Never save a journal in SharedPreferences,
NSUserDefaults or an in-memory placeholder. Preferences cover selected dog, appearance, coach dismissal and Home shortcuts.
A missing/stale selected_dog_id falls back to the first persisted dog. All retained
care drafts live in SQLite. Transactional draft consumption queues unused photos;
cleanup checks every saved/draft reference before deleting a private file.
Reminder cancellations and file deletions survive restart through device_cleanup.

LocalDocumentRepository uses the same SQLite connection and mutation mutex for
setup drafts, demo identity and dog-scoped conversation JSON. Dog deletion removes
its documents before deleting the FK target. Setup documents also retain selected
photo references. These documents are real local data; the response and sign-in
providers are explicitly demos. Nothing is synchronized to an external service.
