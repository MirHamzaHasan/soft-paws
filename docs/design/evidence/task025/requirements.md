# Request coverage

| Request | Implementation and proof |
| --- | --- |
| Default Light | `premium/index.html` and `config.js`; no system-Dark first flash; journey checks fresh dark-system Light and retained explicit Dark. |
| Notification switch and access | `screens/permissions.js`, shared `N.switch`; unchecked pending, Escape/denial, Settings return, allowed off/on with grant retained; iOS and Android journeys and switch motion frames. |
| More dog context | `screens/dog-details.js`; optional age, sex/neuter, size/weight, traits, activities, food/sensitivities and caregiver care notes. Full review and Profile reuse. Numeric validation/unit conversion checked. |
| Multiple choices | Priorities, routines, topics, traits, activities and food; exact count/removable chips, unknown-food exclusivity. All four priorities and all six topics tested together. |
| Universal/custom breed | Search suggestions plus any custom/Unicode breed, multiple mixes, case-insensitive dedupe. Three mixed entries including Urdu exercised in journey and profile source. |
| Use that context | Plan/profile review, separate profile AI consent and immutable per-answer source snapshot. Actual submitted facts used; removed context excluded. No network AI is implemented. |
| More onboarding animation | Shared progress/segmented thumb, switch spring, touch-origin bloom, check/chip arrivals, profile reveal. Sixteen real-time frames and immediate reduced-motion assertions. |
| Keep previous work | Original journal retention, existing account/free/Premium/chat flows, explicit undecided prices, unchanged native/reference fingerprints. |
