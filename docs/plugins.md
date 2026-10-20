# Integrations in the BarkLog foundation

template/plugins.json and generated services/TemplatePlugins.kt retain the
base's configuration interface. Haptics, notifications and owner-authorized Firebase auth are enabled. Analytics, ads and purchases stay
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


Task034 adds local photo-film encoding: Media3 Transformer/effect 1.11.1
(Apache-2.0, official AndroidX) and Apple's system AVFoundation. The shared
`HighlightRenderer` boundary is wired by AppContainer; its controller closes via
ModuleRegistry. No network service, license key, FFmpeg, commercial editor,
analytics, auth or purchase provider is introduced. Prices remain undecided.


Android native UI journeys use AndroidX UI Automator 2.3.0 (Apache 2.0) as an androidTest-only dependency. It is absent from the application APK and has no runtime service or account. [Official release notes](https://developer.android.com/jetpack/androidx/releases/test-uiautomator).


## 18 October — task036 real authentication

The owner authorized native Firebase Authentication and selected
`com.draco.apps.bark.log` on both platforms. The auth manifest entry is now enabled
because new native adapters actually exist; historical removed-provider notes
above describe the earlier foundation. `AppContainer` wires `NativeAuthentication`,
with listeners owned by ModuleRegistry. Auth initialization failure is isolated
from local journal startup. Only Firebase Auth/Core and provider dependencies are
installed; analytics, ads, purchases, Atlas and journal sync remain disabled.
See [Firebase setup and boundaries](product/firebase-authentication.md).

## 18 October — task037 optional AI

Llamatik 1.10.1 supplies shared Android/iOS native text and vision adapters. Ktor
3.3.1 uses Android/Darwin engines; Okio 3.16.2 stores and hashes optional pinned
GGUF downloads. Runtime and model notices ship in Compose resources. Atlas has
a separate authenticated Debug text client; Release remains disabled pending
approved server configuration and live proof. No provider key, image upload,
analytics or billing was added. See [local AI/Atlas](product/local-ai-and-atlas.md).
