# Contributor architecture guide

## Add a capability

1. Inspect `architecture.json`, existing public APIs and the evidence inventory. Prefer an existing owner when the capability already exists.
2. A new independent workflow goes in `src/features/<capability>`, with only directories that contain real code. Register its intentional, acyclic feature dependencies in `architecture.json`.
3. Put framework registration/search/loader/head wiring in `src/routes`. Its component imports `@/features/<name>/pages`; the feature page uses `getRouteApi(routeId)`, not an import of the route file. App providers are composed by the route/app layer, not imported into features.
4. Put shared project/content/workspace query identity, types and operations in their entities only when independent features really share that domain concept. Do not create an entity for each component or type.

## Expose a public API

Use explicit named exports. `index.ts` exposes supported UI/workflows; `api.ts` exposes supported data operations; `model.ts` exposes entity types. `pages.ts`, `server.ts`, `links.ts` and `appearance.ts` exist only where actual composition requires a separate loading/server/pure boundary. Consumer code cannot reach another owner's `components`, `model`, `pages/` or `api/` implementation files.

Do not add `export *` to public feature/entity APIs. Do not import an owner's UI barrel from that owner's implementation: import the private sibling directly. A component may consume its own data API; it must not pull in its own page/composition entry. Cross-feature dependencies must be deliberate and registered. Do not put coordination into a hidden global store.

## Decide shared versus local

A shared module must be feature-independent and have a stable, reusable contract. Start local. Promote it only when multiple independent consumers need the same responsibility or it is a deliberate design-system contract. Similar JSX alone is not sufficient. Keep endpoint rules, permission decisions, document revision logic and provider configuration local to their actual owner. Reuse existing `@cms/ui` and `@cms/editor`; do not recreate shims that re-export an entire package under many filenames.

`widgets/navigation` is a real business composition (project/site/account navigation), not a second generic UI library. `shared/ui` contains presentation/interaction contracts and public Base UI/CMS adapters. The Markdown renderer stays reader-owned because its site/locale/sanitizer assumptions are meaningful.

## State, forms and effects

- Query owns server state. Pass the supplied query AbortSignal through supported HTTP GETs; do not abort persistence mutations indiscriminately.
- URL owns search/page/version/branch deep links. Preserve back/forward navigation.
- RHF + Zod owns payloads: use the controlled payload or compound field presentation that fits the form. They are both RHF, not competing state frameworks. Keep validation rules in owning schemas/operations, not duplicated JSX checks.
- Local state owns ephemeral UI. Browser preferences use the guarded storage hook; never store server caches there. The active project is derived from current query data plus the user's selection preference; invalid preferences no longer cause a hidden storage write during data refresh.
- The authoring controller owns revision hydration, pinned-page autosave, acknowledgement and preview flush. UI panels/tree selection must not overwrite it. Retain stale-result/page-switch/unmount tests before changing that lifecycle.
- Effects need a genuine external lifecycle (DOM listeners/storage/subscriptions/debounced persistence). Do not synchronize individual form values or copy derivable state in effects.

## HTTP, errors and backend contracts

Endpoint-specific operations belong in the feature/entity API. Generic HTTP is `shared/api/http.ts`; the Nibleaf adapter supplies deployment origin and the exact `x-nibleaf-locale`/cookie policy. Wire schemas are split under `integrations/nibleaf/contracts/validators`; import the specific domain, not an all-application barrel. Keep encoded params, repeated query values, FormData boundaries and cache key/invalidation semantics intact.

Do not call raw fetch from UI components. Normalize failed error envelopes through `ApiResponseError`. Generic success DTO annotations still assume the backend wire contract; validate untrusted payloads with the owning schema where appropriate instead of hiding shape mismatches with `any` or broad assertions. Runtime decode coverage is not universal, and frontend permission gates are not server authorization.

## SSR, security and accessibility

Keep per-request nonce initialization before serializer/bootstrap setup, query restoration during streamed hydration, and finite session refresh/navigation guards. The server explicitly installs its request-scoped fetch adapter; public machine-document headers must never inherit reader credentials. Do not remove it without a verified replacement for every server transport/SDK consumer.

Never weaken CSP or sanitize allowlists to make a test pass. The locale cookie's narrowly documented lint exception preserves the upstream synchronous protocol with guarded storage/in-memory fallback; do not copy that exception to unrelated cookies. Root lint/compiler configuration is unchanged.

Use native Base UI ownership for overlays/keyboard/focus, semantic labels, visible focus and shared layer tokens. Respect reduced motion. Run accessibility checks on changed workflows; do not treat automatic axe checks as a complete audit.

## Required checks

From the monorepo root (Node 24+, Bun):

```sh
bun run --cwd apps/app check:architecture --report
bun run --cwd apps/app lint
bun run --cwd apps/app format:check
bun run --cwd apps/app typecheck
bun run --cwd apps/app test
bun run --cwd apps/app build
bun run --cwd apps/app test:browser
```

Architecture negative tests prove that forbidden imports/cycles/duplicate exports are rejected. Register real non-imported framework/tool entries rather than disabling reachability checks. Browser checks refuse an API without the explicit fixture marker. Real mail/Git/storage/AI/deployment workflows require the actual backend.

After an authorized source relocation/update, maintain `upstream-manifest.json` targets without changing pinned source hashes, then run `audit --refresh --check-studio` and read-only `audit --check-studio`. Preserve AGPL notices and the no-billing/no-marketing scope. Never format/reset unrelated Studio or shared-package work.
