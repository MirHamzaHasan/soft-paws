# Local native builds

BarkLog stores care records only on the device. There is no care-record account or cloud backup. Export CSV or PDF before uninstalling or clearing app data; either action deletes unexported care records. RevenueCat purchases, Mixpanel analytics, and Sentry crash reports are separate services and need their public client keys for release testing. Optional Firebase sign-in for Atlas AI is available only in configured non-production builds; paid AI stays disabled in production until Atlas verifies purchase entitlement.

## Prepare

1. Install Node, Corepack/pnpm, JDK 17 or newer, Android Studio with the Android SDK, and (for iOS) Xcode on a Mac.
2. Run `corepack pnpm install` and `corepack pnpm release:check-local`.
3. Create `.env.development` and `.env.production` from `env.example`. Set `EXPO_PUBLIC_APP_ENV=development` or `production` respectively. These files may contain only `EXPO_PUBLIC_*` client values; never put signing passwords or provider secrets in them.
4. Run `corepack pnpm prebuild` to generate ignored `android/` and `ios/` projects. Use `corepack pnpm build:android:debug` for a development install.

On Windows, a deep workspace path can exceed CMake's object path limit during native compilation. If CMake reports object paths over 250 characters or `ninja: manifest 'build.ninja' still dirty`, create a local, ignored `.npmrc` with `virtual-store-dir=D:/p/barklog` (choose a short, project-specific path on your machine) and `virtual-store-dir-max-length=32`, then run `corepack pnpm install --force` before rebuilding. The postinstall script links project packages into that store for Metro and TypeScript, and Metro watches the external store automatically. This changes only local dependency layout; `.npmrc` and the external virtual store are not committed.

## Android signing and release

Create a private upload keystore once. Store it outside the repository or as an ignored `.jks`/`.keystore` file, back it up securely, and retain its alias and passwords. For example, `keytool -genkeypair -v -storetype PKCS12 -keystore barklog-upload.jks -alias barklog-upload -keyalg RSA -keysize 3072 -validity 10000` prompts for the private values. Do not commit the keystore or put passwords in any Expo env file.

Set these four environment variables in the build shell: `BARKLOG_ANDROID_KEYSTORE_FILE`, `BARKLOG_ANDROID_KEYSTORE_PASSWORD`, `BARKLOG_ANDROID_KEY_ALIAS`, and `BARKLOG_ANDROID_KEY_PASSWORD`. On Windows, set `ANDROID_HOME` to the Android SDK directory if it is not installed at the standard `%LOCALAPPDATA%\Android\Sdk` path. Then run `corepack pnpm build:android:release`. The script runs clean Android prebuild, inserts signing settings into the generated Gradle file, and builds both `bundleRelease` and `assembleRelease`. Find the signed AAB in `android/app/build/outputs/bundle/release/` and APK in `android/app/build/outputs/apk/release/`. Android projects are generated and ignored, so the signing patch is reapplied on every build.

Install the APK with `adb install -r android/app/build/outputs/apk/release/app-release.apk` on a connected test device. A Play Store submission uses the AAB and the app's permanent upload key. A disposable test key can validate the script, but must not be used for a production update lineage.

## iOS on a Mac

Run `corepack pnpm prebuild`, then configure a development team, signing certificate, and provisioning profile for `com.dracoarts.barklog` in Xcode. Run `corepack pnpm build:ios:release` for a local Release build; use Xcode Archive for the store IPA and manual App Store Connect upload. iOS release builds cannot run on Windows.

## Versions and device QA

Before each store release, increase `expo.version` and the platform build integers `expo.ios.buildNumber` and `expo.android.versionCode` in `app.json`. Native builds now read these local values; no remote version source updates them. Re-run prebuild after changing app config.

On a fresh install with airplane mode enabled, verify dog onboarding, walk, meal, symptom, and medication logging, timeline display, free PDF export, Safety Center, toxicity lookup, first aid, and the emergency card. Restart and verify records persist. Use Settings > Delete all data on this device and verify onboarding returns and records are gone. Test RevenueCat purchases separately online with sandbox accounts. Record device and artifact evidence in the release preflight checklist.
