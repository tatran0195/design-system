# Target architecture and dependency contract

## Ownership

- `app`: bootstrap, router infrastructure, global providers, layouts and server request composition. Framework-required `client.tsx`, `router.tsx`, `server.ts` remain entry facades.
- `routes`: file-route registrations, search/loader/head wiring and feature-page composition; feature internals must never import route files.
- `entities/project`, `entities/content`: shared project selection/CRUD and document/language/branch identity, types, cache/query operations used by independent features. These are meaningful shared business concepts, not an entity directory for every DTO.
- `features`: auth, projects, editor, languages, publishing, analytics, project-settings, membership, reader-access, reader, account, notifications, git, integrations, imports, exports, api-keys. Each owns its screens, state, rules and endpoint-specific operations.
- `widgets/navigation`: only the composed app/project sidebar, account footer, site switcher and command navigation. It composes public APIs; features do not import this widget or application layouts.
- `integrations/nibleaf`: external wire models/schemas, protocol/key identities and endpoint adapter. It contains no feature UI, React state or imports upward into features.
- `shared`: generic CMS UI adapters, RHF presentation controllers, localization, formatting, transport/error primitives and test infrastructure; no business feature imports.
- `styles`: CMS semantic aliases, editor import and scoped published-document typography/theme contract.

## Dependency directions

`entries/routes/app → widgets/features → entities/integrations/shared → external packages`.

Entities may depend on integrations/shared, never features/app/routes/widgets. Integrations may depend on shared, never feature/entity UI. Shared may depend only on shared and external packages. Features may consume other features **only through declared public APIs**, with an acyclic feature graph. In particular editor composes project-settings/publishing/reader presentation; settings composes membership/access/integration/git/import/export/API-key/reader appearance; none depend back on editor/settings. Analytics reads project/content entities rather than projects-screen internals.

Each module has explicit `index.ts` (UI/workflow API) and, where needed, `api.ts`, `links.ts`, `appearance.ts` or `server.ts` data/pure/server-only entry points. These are registered in the architecture manifest. No star exports from feature public APIs; no self-import through its public barrel. Imports within an owner use relative or owner-local paths; consumers cannot reach its private implementation. Domain wire subpaths are explicit protocol entry points, not an all-application UI barrel.

## State and asynchronous rules

Query owns remote state; query identities/invalidation remain wire-compatible. URL owns deep-link/search state. RHF + Zod owns payloads. Component state owns local visibility/interaction; revision snapshots are deliberate authoring conflict-protection state, not a second query cache. Browser persistence is guarded, scoped, initialized hydration-safely, and written from explicit actions/subscriptions. No additional state library.

Keep native Base UI overlay/keyboard/focus ownership and shared layer tokens. Preserve query restoration during SSR, authenticated beforeLoad and finite session-refresh bridging. Reject stale asynchronous document acknowledgements and scope saves to their originating page. Cancellation is passed explicitly through transport/query integrations where supported; do not retrofit unverified backend streaming semantics.

## Validation, patterns and trade-offs

Feature public facades + automated graph fitness tests prevent accidental imports and cycles; a folder convention alone cannot. The Nibleaf adapter isolates unstable external contracts without inventing a generic universal service framework. Pure publish/editor models permit deterministic race/status tests; cohesive hooks own workflow lifecycles, not every one-line calculation. Compound RHF field controls remain useful for nested arrays; controlled payload forms remain useful for document/config editors. Both use RHF, not competing state architectures.

Large declarative MDX/catalog/view families may remain together when cohesive. Extraction into packages is a later ownership/versioning decision, not a goal of this refactor. Root compiler/lint rules remain unchanged. No billing/marketing or new authentication/backend integration.
