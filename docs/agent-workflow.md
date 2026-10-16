# Agent workflow

Read [AGENTS.md](../AGENTS.md), [engineering instructions](engineering-instructions.md),
[product truth](agentic/product-truth.md) and [the delivery workflow](agentic/workflows.md).
The implementation skill is [.agents/skills/kmp-template](../.agents/skills/kmp-template/SKILL.md).

Use one task from [tasks/README.md](../tasks/README.md), inspect the actual
implementation, then deliver its success, offline, empty/loading, failure and
lifecycle behavior. Update task status and feature status from observed evidence.
Optional services never block the journal. New persistent formats need migrations.

Run python3 tools/verify.py; use --ios for both Xcode simulator configurations on
a Mac and --isolated if the IDE holds Android outputs. Device QA and signing are
separate. Report actual checks; a build does not prove performance.
