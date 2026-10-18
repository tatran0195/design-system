# Incremental refactoring roadmap

| Unit | Scope / intended outcome | Dependencies | Risk / acceptance | Status |
| --- | --- | --- | --- | --- |
| A Baseline | Complete AST/flow inventory, commands and lint evidence | none | Preserve source/Studio starting hashes | Audited; types/build/387 units/8 browsers pass; full lint debt recorded |
| B Contract | Ownership/public-entry/dependency rules, contributor constraints | A | No invented layers/packages | Documented before source migration |
| C Publishing pilot | Own query/mutation/progress, control and dialogs; extract status/selection/review model | B | Medium: unchanged publish payload/deep-link/poll/rollback; focused tests/types | Completed; types, focused/full units, architecture and final browser/build gates passed |
| D Shared foundations | Generic UI/forms/i18n; Nibleaf wire seam; project/content entity data | C | High: preserve all paths, schemas, key identities and multipart/locale/cookie behavior | Completed; types, focused/full units, architecture and final browser/build gates passed |
| E Features | Migrate all inventoried capabilities and split global API declarations; explicit public consumers | D | High: no omitted files, star barrels, cross-feature internals or cycles | Completed; types, focused/full units, architecture and final browser/build gates passed |
| F Routes/editor/server | Thin registrations; cohesive authoring/server responsibility extraction | E | Highest: draft races, URL, nonce, custom domains and reader SSR | Completed; types, focused/full units, architecture and final browser/build gates passed |
| G Consolidation | Remove unreachable/re-export shims and old roots; lint/import cleanup, architecture checker + negative tests | E/F | No two parallel architectures or suppressions | Completed; types, focused/full units, architecture and final browser/build gates passed |
| H Verification | Types, unchanged lint rules, format, all units, production environments, browser/a11y, provenance/Studio | G | Actual outcomes only; live-service limits disclosed | Completed; types, focused/full units, architecture and final browser/build gates passed |

Every unit must update status only after its relevant validation. Preserve genuine Git legacy-config and workflow protocols separately; do not merge solely because both say Git. Do not delete source/tests by filename-extension heuristics. A migration constraint must be explicitly recorded rather than hidden behind a compatibility export.
