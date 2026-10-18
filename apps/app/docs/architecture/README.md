# Application architecture

The app is a feature-oriented modular monolith inside the existing CMS workspace, not a new framework or package split.

1. [Audit and baseline evidence](01-audit.md)
2. [Target ownership and dependency rules](02-target-and-rules.md)
3. [Migration roadmap and status](03-roadmap.md)
4. [Reuse/extraction catalog](04-reuse-catalog.md)
5. [Contributor architecture guide](05-contributor-guide.md)
6. [Current explicit module APIs](06-module-catalog.md)
7. [Pattern decisions and trade-offs](07-decisions.md)
8. [Verification, definition-of-done evaluation and remaining limits](08-verification.md)

`architecture.json` is executable policy. `evidence/` contains baseline/current graphs, per-source migration ledger, removed artifacts/dependency reasoning, accessibility reports and execution summaries. Start with the contributor guide before adding a feature or shared abstraction. The app-local AGENTS.md applies the same rules to AI-assisted changes.
