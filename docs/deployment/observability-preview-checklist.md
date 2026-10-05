# Observability QA

GameAnalytics is the preferred optional native analytics path for v1.0.0. Create separate Android and iOS games and enter each game's key/secret pair in the ignored build environment. Its Collection API credentials are bundled client values. [Environment management](env-management.md) lists the fields. Mixpanel and Sentry remain optional and can be left blank.

## GameAnalytics live check

Use a native QA build with network access and the correct platform game. GameAnalytics' [Collection API setup](https://docs.gameanalytics.com/event-tracking-and-integrations/sdks-and-collection-api/api/setup/) says Live Events normally appear within seconds after collection.

| Caregiver action | Expected design event |
| --- | --- |
| Launch and onboard | `BarkLog:app_opened`, `BarkLog:onboarding_completed` |
| Save a walk from Home | `BarkLog:quick_log_saved:walk` |
| Open a known tab | `BarkLog:screen_viewed:<screen>` |
| Complete PDF or CSV export | `BarkLog:export_completed:pdf` or `BarkLog:export_completed:csv` |

- [ ] Android events appear in the Android game and iOS events in the iOS game.
- [ ] Session start and end events appear; repeated launch increments session number.
- [ ] Event payload contains no dog ID, care note, symptom text, prompt, answer, CSV/PDF content, or export filename.
- [ ] Offline care actions remain available. The bounded queue can send analytics later when online.
- [ ] A bad or missing analytics key never blocks logging, safety, or export.

If Mixpanel or Sentry is enabled, verify the relevant dashboard separately and apply the same payload privacy check. Record evidence in [preflight-local.md](../release/preflight-local.md).
