# Framework reset: 2026-10-14

## Owner request

Rebuild BarkLog using MirHamzaHasan/draco-kotlin-base, remove the React Native
project and old task list, and establish a new project with enough context for
gradual feature delivery. This reset does not promise feature parity in one task.

## Source and preservation

- Base repository: https://github.com/MirHamzaHasan/draco-kotlin-base
- Base commit: de1b575911bc514fde95ffba74aca33b0beea0f2 (main, fetched 2026-10-14).
- One-time base identity tool set BarkLog name and the existing Android/iOS IDs.
- Original BarkLog Git history and origin remain in this repository.
- Current RN source, docs, tasks, generated projects, dependencies, .env and
  uncommitted changes were moved to the recoverable sibling directory
  ../barklog-react-native-backup-2026-10-14.urITL9.
- A copy of the prior .git metadata is in that backup's git-metadata directory.
  Nothing was pushed, reset, committed or deleted from installed device storage.

The backup contains local configuration. Keep it private; do not commit it.
Recover individual files by copying from that directory, rather than restoring
old setup instructions into the active KMP project.

## Decisions

Retain product identity, free/local policy, caregiver workflows, visual tokens
and bundled Inter fonts. Replace all runtime/build architecture. Replace the old
placeholder launcher artwork with the five-oval BarkLog mark on both platforms.
Care persistence direction: SQLDelight + device SQLite, introduced in task002.
Keep base host strategy, lifecycle, haptic/preference adapters and plugin tooling.
Remove its generic sample data/screens and unwanted network/ad/billing integrations.

## Installed journals

KMP does not read the old WatermelonDB schema. Keeping app IDs preserves the
update lineage, not data compatibility. A new database must use a distinct filename
and never erase unknown legacy files. Task015 addresses inventory, exported
records, mapping/import feasibility and explicit rollback expectations before
shipping updates to prior users. Until that gate passes, use fresh simulator/test
installations, and export valuable old journals with the old app first.

No old feature is marked implemented solely because it worked in React Native.

On 2026-10-16 the owner requested removal of the sibling backups. The four
identified BarkLog backup directories were moved to macOS Trash; the active KMP
project and its Git history remain. Do not rely on those old sibling paths.
