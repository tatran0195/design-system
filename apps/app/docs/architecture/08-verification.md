# Refactor verification and final evaluation

Date: **2026-10-16**. Scope: `apps/app` and its dependency lock metadata. Existing Studio/shared-package source was not refactored. Nibleaf backend/API/auth, AGPL notices, Base UI/CMS controls, no-billing/no-marketing policy retained.

## Actual executed checks

| Command / check | Observed result |
| --- | --- |
| `bun run --cwd apps/app typecheck` | Passed; existing strict TS configuration, no compiler relaxation |
| `bun run --cwd apps/app lint` | Passed with the unchanged root Biome configuration |
| `bun run --cwd apps/app format:check` | Passed |
| `bun run --cwd apps/app test` | **416 passed / 67 files** (baseline 387 / 61) |
| `bun run --cwd apps/app build` | Passed; client + Start SSR + Nitro `.output/server/index.mjs` |
| `bun run --cwd apps/app check:architecture --report` | **440 source modules, 1,470 local dependency edges, 0 violations**, 0 unreachable registered-source modules |
| `CMS_REUSE_DESIGN_PREVIEW=true bun run --cwd apps/app test:browser` | **8 Chromium journeys passed** through the ordinary HTTP/auth interfaces against marked in-memory fixtures |
| `bun run --cwd apps/app test:a11y` | **0 axe violations on four routes**; one dashboard SVG/gradient contrast check remains automated-incomplete/manual-review |
| `bun install --frozen-lockfile` | Passed; no lock changes |
| App provenance + Studio starting hashes | Read-only audit run after refreshing adapted-file targets/hashes; see final audit evidence |

Evidence is in `evidence/`: initial AST inventory and lint diagnostics, complete ownership/migration ledger, schema ownership, removed modules/dependencies, current module graph, accessibility initial/final reports, and command summaries. Do not interpret a compilation pass as production certification.

## Baseline versus after

- Baseline types/build/387 units/8 browser journeys already passed; preserved functionality was the starting point, not invented after the refactor.
- Full initial lint: **163 existing errors + 7 warnings**, plus one audit-artifact formatting diagnostic. Final lint/format pass. Most errors were import organization, but real code/style/security findings were inspected too. Root rule severities, compiler settings and test exclusions were not relaxed.
- Global all-capabilities API barrel: **84 incoming source imports → removed**. Endpoint-specific hooks now live in actual feature/entity APIs; callers consume declared interfaces.
- **21 route view implementations extracted**; registrations retain their file-route/search/loader/head contracts. Feature pages no longer import routes/app composition.
- A 1,193-line schema namespace became **21 domain partitions** with the same validation expressions. The unused root barrel was removed.
- **14 package-wide editor re-export shims removed**; core consumers use the actual `@cms/editor` public API.
- Publishing control moved out of the app layout. Review/preflight/progress rules are pure and independently tested.
- Authoring's revision/hydration/autosave/preview lifecycle is a cohesive **104-line controller**, separate from panel/tree UI. Browser autosave and existing draft/roundtrip contracts pass.
- Four editor UI preferences now use a guarded primitive storage adapter instead of repeated effect copies. The active project is derived from the query list plus explicit user preference.
- The 741-line MDX registry became a small registry facade with coherent private families (largest family 163 lines). The facade/lazy-rich-renderer dynamic cycle is eliminated through a shared renderer engine.
- Global source-cycle claim is precise: the first inventory checked static imports only. Expanded checking caught the dynamic Markdown cycle; ownership checks also revealed editor/settings and integration/settings capability cycles, resolved through language-workflow and analytics-preference ownership.
- **27 graph-proven unreachable modules / 4,185 lines removed**, plus two unwired copied build-analysis/budget scripts. No tests were deleted to obtain a pass. Removed paths/reasons are recorded.
- The duplicate published-theme CSS tail was confirmed byte-equivalent to its imported stylesheet and consolidated into one owner.
- **25 unused direct runtime dependency declarations removed**. Parser and axe tooling already present in the workspace are explicitly declared for app architecture/a11y commands; no runtime framework/state library/package split was introduced.
- Thirty supported GET query operations now forward Query's AbortSignal. Mutation payloads/cache identities/invalidation remain intact; transport tests cover locale, cookies, encoding, repeated query values, multipart and signal behavior.
- Five default-theme contrast nodes and semantic landmark/navigation defects detected by the initial **post-migration** axe scan were corrected. This was not a measured pre-refactor axe baseline; corresponding markup/style was inherited. Final four-route scan is clean apart from a manual-review item.

## Tests added or adapted

Added publishing workflow rules, malformed HTTP error normalization, server request-context credential isolation/cleanup, primitive preference storage/functional setters, active-project selection, architecture negative cases and AbortSignal forwarding. The architecture tests reject private paths, upward shared/composition dependencies, cycles, duplicate/star exports and unregistered owners.

Existing tests were relocated with their owners. Sites-route mocks were updated to the public `getRouteApi` page boundary; the multi-select test waits for its asynchronous native popup; compound-array test fixtures now have stable row IDs instead of index keys. Assertions/workflows were retained, not disabled. The eight browser journeys cover clean hydration/CSP, command keyboard navigation, typography, modal focus/layers, autosave, dark/Arabic persistence, reader rendering, mobile sidebar/overflow, internal signup and email/OTP completion.

## Remaining debt and limits (not hidden)

1. The editor page still contains a substantial **921-line view/composition** (formerly a 1,056-line route); tree/sidebar rendering can be decomposed further if real teams need separate ownership. The critical document lifecycle and preference policies are already separated. Splitting it into dozens of prop-forwarding fragments was deliberately avoided.
2. Git's legacy configuration and workflow interfaces remain distinct because their request models/workflows differ; theme/provider configuration editors remain large but feature-owned. They were reviewed, not automatically unified by visual similarity.
3. Generic success DTO annotations still trust the wire contract. Error envelopes and existing public/content/URL/schema boundaries are validated; this is **not universal runtime response validation**.
4. Server fetch interception is now visibly installed, request-scoped and cleanup-aware, but still process-wide for legacy SDK consumers. Replacing every consumer with explicit server HTTP ports is a future integration change. Unit tests verify isolation and no credential propagation to external/public-machine targets, not a full infrastructure security audit.
5. The synchronous Paraglide locale cookie has one narrow, documented lint exception to preserve protocol compatibility and denied-storage fallback. No broad lint/TS suppressions were added to hide migration problems; seven stale suppressions were removed.
6. Retained icon/editor/Scalar/Mermaid/locale material still produces large-chunk advisories. Structural ownership improvements are measured; **no arbitrary bundle-speed/size budget or re-render speedup is claimed**. Obsolete unwired budget scripts were removed rather than represented as passing.
7. Axe cannot automatically settle the dashboard SVG tick/gradient/avatar contrast check; it is recorded under `manualReview` in the final report. Keyboard/focus/reduced-motion/default-theme automation is evidence, not a guarantee for every custom theme, screen reader or device.
8. Real Nibleaf mail, OAuth/provider, Git, AI, storage and deployment services were **not exercised without credentials/configuration**. Fixture checks cannot certify those integrations or backend authorization. No production-readiness/security guarantee is made solely from frontend results.

## Definition-of-done evaluation

- [x] All source modules/capabilities inventoried; explicit owners and public APIs documented.
- [x] Dependency directions, owner registration, public paths, runtime/capability cycles, missing imports and unreachable modules enforced and negatively tested.
- [x] No upward business imports from shared/integrations/entities; no feature imports composition; no two legacy/new source roots.
- [x] Critical publishing/authoring/server/MDX responsibilities refactored; large retained compositions explicitly reviewed.
- [x] State, validation, HTTP/error/cache/cancellation conventions documented and tested without new frameworks.
- [x] Extraction candidates have dependencies, contracts, assumptions and priorities; no premature packages created.
- [x] Types/lint/format/units/build/browser/a11y/architecture outcomes inspected and recorded.
- [x] Remaining risks and unverified live integrations are explicitly disclosed rather than marked production-ready.
