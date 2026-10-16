# Integrations in the BarkLog foundation

template/plugins.json and generated services/TemplatePlugins.kt retain the
base's configuration interface. Haptics and notifications are enabled. Auth, analytics, ads and purchases stay
disabled. Notifications are scheduled only after explicit task opt-in.

```sh
python3 tools/plugins.py list
python3 tools/plugins.py sync
python3 tools/plugins.py check
```

AppManagers currently exposes only preferences and haptics. Ads, purchases,
Firebase credentials and PostHog providers/SDKs were removed, not merely toggled.
Enabling those old manifest entries does not implement a service, and foundation
checks reject enabling account/telemetry/paid integrations accidentally.

Native DeviceServices adapters handle private photo copies, share/print and opt-in
reminders. Android requests POST_NOTIFICATIONS in context and uses inexact alarms;
boot/time changes reconcile local tasks. iOS uses UNUserNotificationCenter with
upcoming one-shot occurrences refreshed when the app opens. No exact-alarm,
location or broad photo-library permission is needed. Task027 adds optional camera
capture: Android uses the system camera app and a scoped FileProvider URI; iOS
requests camera access only when Take photo is tapped. Physical delivery,
reboot and notification-tap QA remain release gates.

Custom modules may use python3 tools/plugins.py new <id>. Generated scaffolds are
disabled and have no product provider. Implement behavior and tests, declare
module dependencies, sync registration and rebuild both hosts before claiming
support. AppContainer owns dependency wiring; ModuleRegistry owns lifecycle.
The database module uses reserved local-data and is always required.

No new hosted analytics, paid integration or purchase flow is authorized by the
framework rebuild. Optional future Firebase/Atlas identity is task014 and cannot
own or sync the care journal.

Task027 installs local demo sign-in and response providers, as explicitly requested
by the owner. There are no Firebase, online AI or billing credentials/SDKs. The
auth/purchase plugin entries stay disabled. Demo sessions and conversations use
SQLite; a future real provider must replace these boundaries with explicit
service configuration and privacy decisions. No automatic journal upload exists.
