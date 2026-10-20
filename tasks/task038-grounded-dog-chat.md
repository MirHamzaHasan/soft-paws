# Task038 — grounded dog chat and recent-care readings

Owner request: 18 October 2026. Give local AI the current dog's saved profile and
explicit owner relationship, retrieve relevant journal logs, answer the current
question first, and show readable recent readings. This authorizes implementation
of local retrieval/grounding; the new graphical chat card remains subject to the
existing board-review gate before native UI. No new model download, hosted index,
cloud sharing, diagnosis or treatment is authorized.

Status: Paused at the owner's explicit request on 18 October 2026. The owner
approved the proposed recent-care card, then stopped local LLM/RAG work and selected
Atlas-only chat. The board and preliminary retrieval code remain for a later pass;
no native graphical card was implemented. Initial compile/existing JVM tests pass,
but new retrieval date/keyword/quality acceptance was not completed. Do not claim
this feature delivered or resume it without an owner request. Task039 takes priority.

- Preserve task037's committed composer clearing and native streaming SHA-256.
- Local SQLite type/date/lexical retrieval, bounded excerpts, exact counts.
- Saved dog identity and relationship to the current owner, no invented owner name.
- Standalone questions omit unrelated previous questions/generated answers.
- Exact journal lookups are labelled Saved journal facts; general/complex answers
  still use the real local model.
- Recent-care aggregate/source snapshot persisted with the answer for an honest
  graphical card, never generated numeric/health scores.
- Atlas retains independent explicit context and Release admission gate.
- Test actual SQLite retrieval, timezone/date scope, old named notes, count limits,
  dog isolation, stale history/privacy, persisted snapshots and real model quality.
- Review board light/dark, empty, general answer, large text and reduced motion;
  obtain owner review before the new native graphical component.

Preview: http://localhost:4278/premium/index.html?reducedMotion=true#play-next-chat-grounded
