# Architecture audit — 2026-10-16

## Scope, method and baseline

The scope is the complete `apps/app`, not Studio or the Rust backend. Preserve AGPL notices, Nibleaf HTTP/auth contracts, the Base UI/CMS design system, editor drafts, deep links and published-reader SSR. Billing, quotas, pricing and public marketing remain excluded.

An AST inventory covers **341 TS/TSX modules and 1,789 import/re-export edges**, including tests, routes, schemas and server helpers. `evidence/baseline-inventory.json` records each module's imports, exports, declarations, effects and hook usage; the text summary identifies dependency hubs. This is comprehensive structural inspection, not a claim that every line received a manual security review. Critical flows were read end to end.

The verified stack is React 19/catalog, strict TypeScript 7, TanStack Router 1.170/Start 1.169, Query 5.104, Better Auth 1.7 client, RHF 7/Zod 4, Tailwind 4, public Base UI 1.9, primary `@cms/ui` and `@cms/editor`, Nitro 3, Vite-plus JS builder, Bun, Vitest/jsdom and Playwright Chromium. The repository's generic React-18/Router-7 description does not describe this copied app; replacing frameworks is not part of this refactor.

Pre-change checks executed before the interrupted turn: app types 0; production client/SSR/Nitro build 0; **387 unit tests / 61 files passed**; **8 browser cases passed**; formatting 0. The restored environment was reinstalled with the frozen lockfile. Full Biome was rerun into durable evidence: **163 pre-existing errors, 7 warnings** plus one formatting diagnostic on the newly generated audit inventory, principally **146 import-organization diagnostics**, plus numeric/style issues, two undeclared globals, cookie/inline-script policy findings and stale suppressions. See `evidence/baseline-lint.json`. The earlier port's narrow unused-code check was not a full lint pass. Compiler settings and tests will not be weakened.

No static-import SCC cycles were found in the initial inventory (generated framework route registration excluded). Expanded dynamic-edge analysis subsequently confirmed a Markdown facade → lazy rich renderer → facade cycle; the renderer engine is now separated from that selector. That does not imply good encapsulation: 84 modules consume a global all-capabilities API barrel.

## Capability map and workflow traces

| Capability | Current ownership | Representative flow |
| --- | --- | --- |
| Identity/invitations | auth routes, session function, auth-client, invitation helpers | route beforeLoad → server session → Better Auth refresh → RHF email/OTP → invite/app destination |
| Project selection/catalog | dashboard routes, app dialogs/sidebar, active-project store, queries/mutations | list query → selector/context → create dialog → project mutation → invalidation/navigation |
| Document authoring | 1,056-line editor route, editor components, global content APIs | URL page/branch → page queries → revision-aware RHF draft → debounce save → snapshot acknowledgement |
| Publication | app layout + two project dialogs + global queries/mutations | publish deep link → pending changes/redirect checks → publish mutation → tracked deployment polling → rollback |
| Configuration | project-settings sections + settings tabs + validators | project config → local form → endpoint-specific update → project/config invalidation |
| Access/membership | two members screens, project access boundary, reader-auth section/hooks | workspace/site role checks → invite/update/revoke or reader audiences/JWT |
| Analytics | routes, providers, analytics components + query subfolder | URL/range → scoped summary query → normalized counts/series → charts |
| Git/import/export | settings tabs, workflow panel, hooks | authorize/connect → queue/conflicts; import upload/URL; export schedule/run/download |
| Integrations/API credentials | settings tabs + integration hooks + schemas | config normalization → verify/activate/rotate → cache invalidation/secret display |
| Notifications/preferences | popover + preferences tab + global APIs | unread poll → inbox → mark read → both cache keys invalidated |
| Published reader | site routes, components/site, markdown renderers, server/functions + helpers | host/path negotiation → shell/page loader → canonical/redirect/locale/theme → sanitized Markdown/MDX → consent/search/events |
| Composition/platform | root/client/router/server, layouts/providers, i18n/UI adapters | per-request nonce → SSR/stream bootstrap → query restoration → locale/theme/feedback/navigation |

## Evidence-based findings

| Finding and evidence | Impact / proposed change | Risk and verification |
| --- | --- | --- |
| **Confirmed**: `hooks/api/index.ts` exposes all capabilities; 84 incoming imports; `mutations.ts` 708 lines, `queries.ts` 225+. | Global ownership/implicit dependencies and eager test/module loading. Split declarations into owning feature/entity APIs and remove the barrel. Preserve endpoint paths, keys and invalidation semantics. | High: request/cache contracts; types, all units, API error tests, editor/publish/browser flows. |
| **Confirmed**: editor route owns fetching, document revision/hydration/autosave, persistent panels, resizing, keyboard listeners, tree mutations and rendering. | Route is not a composition boundary. Extract an independently tested document lifecycle controller and keep route registration thin; distinguish UI persistence from server state. | Highest: stale saves, page switching, deep links, unmount flush; existing draft tests plus browser autosave. |
| **Confirmed**: `layouts/project.tsx` exports `PublishControl`, consumed by editor. | Feature depends upward on application composition. Publishing owns the control, orchestration and progress model. | Medium: deep-link opening and deployment handoff; pure status/selection tests and browser regressions. |
| **Confirmed**: `services/api.ts` is an all-endpoint object; client helpers cast untrusted errors into `ApiErrorBody`. | API/error boundary is not explicit and malformed errors can be misleading. Keep generic transport in shared; put wire adapters/contracts in a Nibleaf integration seam; parse error envelopes with Zod and preserve status/code. | Medium: do not invent response shapes or expose secrets; malformed JSON, errors, cancellation and multipart tests. |
| **Confirmed**: `use-payload-form` and `use-app-form` both use RHF, but names/comments imply a migration shim; former subscribes to the entire form. | Clarify two deliberate RHF presentation APIs under shared/forms; no second state framework. Whole-form subscription is appropriate for controlled payload editors but not a universal recommendation. | Medium: array operations, same-tick OTP values, dirty/reset/pending tests retained. |
| **Confirmed**: active-project provider copies selection validity through an effect and writes storage during derived reconciliation. | Derive the effective selected project; keep only user preference state and event-driven persistence. | Medium: empty/stale selection/storage-denied and SSR tests. |
| **Confirmed**: 730-line server mixes client IP trust, request auth scope, host/meta cache, Markdown negotiation, canonicalization and response security; process-global fetch wrapping at module initialization. | Give server composition and request/response middleware explicit owners. Preserve context isolation and publicly tested routing; do not casually replace security logic. | Highest: nonce, custom domains, HEAD/Markdown, visitor IP/cookies; server suite and reader SSR browser case. |
| **Confirmed**: app editor files re-export the entire `@cms/editor` entry from multiple names. | Obsolete compatibility graph and ambiguous ownership. Use the package's actual public exports directly; keep app-specific authoring UI local. | Low/medium: package unit coverage plus app MDX/roundtrip and build tests. |
| **Confirmed**: `contracts/validators/index.ts` 1,193 lines, DTO/keys files collect unrelated protocols; copied repository-template tree has no direct UI consumer. | Separate external wire-contract ownership from feature models, split schema domains, remove only graph-proven unreachable code. | High: configuration validation cannot change; compare exports, schema behavior and query keys. |
| **Architectural concern**: integration tab 754, Git tabs 695/651, MDX registry 741 and theme editor 759 lines. | Size alone is not a defect. Separate cohesive provider forms/state or component families when it creates a real boundary; retain genuinely different Git contracts. | Medium: no speculative unification; feature regression tests and documented retained complexity. |
| **Confirmed baseline quality debt**: full lint fails despite types/tests passing. | Fix mechanical imports/style separately; scrutinize security diagnostics rather than adding ignores or changing rule severities. | Lint/format with same root configuration; record residual pre-existing diagnostics if unresolved. |
| **Measured baseline concern**: heavy retained feature/vendor chunks; unit runner reports 16,467 module evaluations. | Eliminate broad feature barrels and unnecessary application imports; maintain lazy route boundaries. No arbitrary memoization or bundle-budget claims. | Compare measured build outputs/import graph; retain all locales/features. |

## Reuse/security judgments

UI primitives already live in the proper shared packages. Do not create new packages. App-local UI adapters, form controllers and generic transport are extraction candidates only after eliminating domain/configuration assumptions. Markdown/MDX renderer, editor workflow and custom-domain gateway are not generic utilities merely because multiple screens use them.

Frontend access gates are UX, never server authorization. Keep trusted cookie/header forwarding, per-request nonce scope, sanitizer allowlists and URL validation intact. Live Nibleaf mail/Git/AI/deployment services are not available in this sandbox; fixture tests do not certify them.
