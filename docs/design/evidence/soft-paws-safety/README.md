# Soft Paws Safety · 21 October 2026

The nine approved Safety destinations now run in shared Compose: Safety,
observations for a call, saved contacts, contact editing, region listings,
nearby search, manual location fallback, exposure details and safety topics.
The existing joyful kit supplies cream/teal, rose urgency cards and stable
butter/lilac/sky/rose/mint observation marks. No new Rive art or runtime changed.

The contact form retains both established profile slots, adding independent
optional address/notes. Saving and explicitly clearing one contact preserve the
other contact, general profile notes, other facts and Journal history. Retained
legacy drafts keep their original slot and captured revision. Failed/stale saves
keep the draft; the existing Back guard offers Keep or Discard before reopening.
There is no SQLite schema or filename change.

The checklist carries caregiver choices into a call summary without a Journal
write or severity score. Exposure notes remain screen state until an explicit AI
action. Premium, per-cat versioned weekly consent, current identity and service
policy gates remain in place. Unconfigured AI stays unavailable; no live request
was made. Maps receives only an explicitly selected search place. Coordinates
never enter saved navigation, Journal data or AI context.

## Actual checks

[checks.json](checks.json) records the accepted results: two full Android
journeys at font scales 1.0/1.3, a separate real Android permission-denial case,
four iOS cases at normal text and extra-extra-extra-large, and a separate real
iOS permission-denial case. Both systems displayed their native prompt. Denial
preserved the typed place and free contacts; the original unrequested permission
state was restored. The [Android](android-location-result.json) and
[iOS](ios-location-result.json) summaries accompany the prompt/fallback frames.

Native journeys exercise draft/keep/relaunch, real contact save, clear
cancellation, confirmed clear and restoration, observation choices, unsupported
and verified country entry, a place containing punctuation/non-English text,
exposure-note retention and both themes. Android assertions query the real SQLite
profile/revision/counts. The read-only [iOS preservation proof](ios-preservation-proof.json)
confirms the other contact, profile facts/general notes and all 20 Journal rows
remain intact after the UI journeys.

All **168 JVM tests** pass, including four new tests for legacy JSON/drafts, disk
reopen, independent contact notes, forced transaction failure, stale writes,
region/URL handling and bounded cat-specific AI requests with changing consent.
Android Debug/Release, lint, migrations and 30 tooling tests pass. Current iOS
Debug/Release hosts and bundle identity, runtime plist and font checks pass.
[Shipping source hashes](shipping-source-hashes.json) match all 254 frozen
production files. Swift-only UI-test additions reused the verified Debug framework
through the existing Xcode switch, with production and framework hashes checked
before/after; the final Release host used the normal integration build.

## Visual comparison

The 18 paired sheets compare the nine destinations in light/dark against the
approved board. Native data comes from the separate `soft-paws-day-v1` QA journal;
QA contact names/numbers are synthetic. The form adds a contact-kind selector to
preserve both existing slots. The region view implements real supported-country
listings, and Maps/AI actions retain actual access/service guards. Example data,
text wrapping and viewport heights differ. Android is 390×844 logical pixels;
iOS is 375×667. Longer content scrolls above fixed actions, including at larger
text. These are composition/runtime comparisons, not exact pixel parity or
individual native visual approval.

All pairs, both platforms' larger-text sheets and native permission frames were
inspected. Screenshot review restored the coloured observation marks and removed
extra list headings. The [fresh Home pixel comparison](home-cat-motion-check.json)
confirms ongoing cat motion after the greeting; crops exclude clocks and other
controls. This is not a frame-rate measurement. Both apps finish on Home with
normal text, saved Light appearance and normal motion; OS Reduce Motion is respected.

## Iterations and limits

Early new-test fixtures used an obsolete quick-log path and non-JSON draft text;
they were corrected to current repository contracts. Android larger-text helpers
initially scrolled away from the country field and confused the header Back with
the footer's Back to saved contacts; the accepted run uses exact header lookup.
An ad-hoc permission probe met a startup accessibility-root failure. The maintained
instrumentation case waits for actual controls, locates the editable parent and
uses the native IME boundary. Earlier failures are not counted as passes.

The owned Android guest also stopped answering ADB. A targeted transport reconnect
restored commands without reboot, uninstall or data clearing. Its cause is not
established as an app crash. The pre-refinement optimized iOS build was cancelled
when production UI changed; only the final successful build is delivery proof.

The [source/implementation contract](../../../product/soft-paws-safety.md) records
primary veterinary and service-number checks. Physical/minimum-OS devices,
VoiceOver/TalkBack, real phone/Maps handoff availability and individual native
visual approval remain open. No real call, purchase, service registration,
account change, upload, journal reset or AI retry was performed. Existing iOS
ICU deployment-version/AVFoundation warnings are not a minimum-device guarantee.
