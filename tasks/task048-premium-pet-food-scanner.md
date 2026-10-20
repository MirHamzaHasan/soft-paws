# task048 · Premium pet-food scanner and pantry recalls

Owner direction · 20 October 2026: add a future Premium feature that scans cat or
dog food, explains the label in plain English and warns about recalls affecting
saved pantry items. The owner described the concept as Yuka for a pet's bowl.

Status: planned. The task047 paywall shows an explicitly unavailable “Coming
soon · Premium” card. No scanner, pantry persistence, photo upload, recall service,
background monitor or notification has been implemented or enabled.

## Intended complete slice

- Premium access uses the existing verified RevenueCat boundary; a local preview
  is never a purchase entitlement. Server-side work must enforce the same access.
- Scan a barcode and/or a chosen label photo for cat or dog food. Ask which species
  the food is for; this does not add cat journal profiles implicitly. Keep camera,
  image choice and any cloud analysis consent explicit and contextual.
- Confirm the product, readable label text, region and any batch/lot or best-before
  details. Allow correction; low-confidence OCR is not a verified ingredient list.
- Explain the label in plain English with the source text and uncertainty visible.
  Do not invent a safety score, diagnose a pet, prescribe a diet or infer that a
  named ingredient alone makes a food harmful.
- Let the user explicitly save an item to a local pantry, with its product identity,
  species, region and available batch identifiers. Changes/removal are recoverable.
- Recall matching requires authoritative source coverage by region, source links,
  publication/check timestamps and product/batch matching. Distinguish confirmed
  matches, possible matches and incomplete coverage. Never equate “no match” with
  “safe” or “no recall.” Duplicate notifications must be deduplicated.
- Alerts are opt-in. Denied permission does not block reading a recall or saving a
  scan. Offline/stale data and background delivery limits remain visible. Monitoring
  must not be advertised as active before the actual service is validated.
- Cover loading, cancellation, unreadable/unknown labels, wrong species, unknown
  region, stale/unavailable sources, no matching data and subscription changes.
  Define retained/readable pantry records before any entitlement-expiry behavior.

## Before native work

Design the scanner → explanation → pantry → recall review flow on the board, then
review it under the existing new-screen gate. Select and validate actual label/
barcode data, recall sources and supported regions before promising coverage.
Decide local versus explicitly consented cloud processing, retention and any ongoing
service costs. No new hosted service or paid data provider is activated by this
roadmap entry. Later SQLite changes require preserving migrations and existing data.

Task047 remains the active paywall/plan visual pass. This roadmap entry adds no
functional scanner or new native runtime dependency to that pass.
