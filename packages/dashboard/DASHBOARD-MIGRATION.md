# Migrating Medusa dashboard components

This entry preserves reusable behavior, not Medusa application props or private import paths. Import only from `@cms/dashboard` and use `@cms/ui` for overlapping primitives. The existing documentation entry at `@cms/docs-kit` is unchanged by this extraction.

## Replacement map

| Upstream dependency or behavior | Portable replacement |
| --- | --- |
| `@medusajs/ui`, app-specific primitive copies | Existing primary `@cms/ui` components and CMS tokens |
| Medusa SDK/HTTP types | Structural view models in `types/records.ts` or generic application-owned types |
| Resource hooks, mutations, counts | Loader/search/persistence adapters or explicit props/callbacks |
| `react-router-dom`, route loaders and outlet context | `DashboardProvider.router`, controlled layout children and modal provider state |
| Route-derived auth/session | Explicit `ProtectedRoute status` and host-owned sign-in UI |
| Registered permissions/RBAC evaluation | Host `authorize(permissions, mode)`; server-side authorization remains mandatory |
| Enterprise required-permissions-section | Excluded, not imitated or copied |
| i18next singleton | Provider `messages` / `translate`, local interpolation/plural support |
| Dashboard extension/plugin registry | Explicit layout/section/widget definitions and render entries |
| Application search/store | `SearchSource` adapters, commands and controlled search visibility |
| Automatic saved views/preferences | In-memory defaults; explicitly supplied persistence adapters |
| Route query parameters | Controlled table/filter state; host URL synchronization if desired |
| Medusa avatar/user/notification lookups | Supplied user/entity/notification view models |

## Tables

The old `components/table/data-table` implementation and its date/number/select/filter/pagination internals are consolidated into the primary CMS DataTable composition. They are not duplicated or exposed as a parallel legacy compound table API.

- Use `DataTable` / `DashboardDataTable` for already-loaded manual data.
- Use `ConfigurableDataTable` plus `TableDataAdapter<T>` for host loading.
- Use `useDashboardTableState`, `Query`, `OrderBy`, `FilterGroup` and primary CMS filter helpers for custom controls.
- `_DataTable` is a compatibility alias of the modern table, **not** the upstream component with its old props.
- Sorting/filtering/pagination are manual: the host loader must implement the requested state. Do not assume client row-model behavior.
- Provide total matching `count` and stable row IDs. Column definitions/helpers use the primary CMS table types, not a separately installed TanStack version.
- `adapter.key` is the loader identity/refetch boundary. Include a scope/version when switching datasets; do not rely on an inline closure identity to refetch.
- Both upstream SaveViewDropdown locations now point to one shared control; callbacks may return promises and errors are contained.

The manifest records every consolidated source path and its actual replacement target, including shared targets for removed legacy implementation files.

## Grid and form ownership

Use `createDataGridHelper<TData, TFields>()`, flat/stable column definitions and RHF form state. The host owns validation, server updates, data ordering and field paths. Do not import the private table facade or configure an independent table engine for the grid.

Grid coordinates are stable matrix coordinates, not visible virtualizer indexes. Advanced navigation hooks receive both flat and visible row/column collections. Hiding data does not renumber field paths. Host-controlled hidden rows cannot be revealed by the grid; reveal them in the host before trying to edit them.

Clipboard data is plain quoted TSV with per-target conversion; invalid mixed-column writes fail atomically. Grid commands do not consume keys/clipboard events owned by unrelated controls. Browser-native undo while editing an input remains native rather than being treated as grid command history.

`Form.Control` retains explicit ARIA attributes and custom IDs. Directly declared label/control/hint nodes are associated in server markup. If an opaque component supplies those descendants, pass `Form.Item controlId` and explicit ARIA description IDs rather than relying on upward effects during SSR.

## Context, themes and modals

`DashboardProvider` supplies translation, locale, explicit text direction and CMS tooltip context. It does not instantiate a router, SDK, QueryClient, auth store or extension registry. The primary direction provider supplies a single Base UI direction scope to existing CMS components and the ported additions. Shared controls, menus, popovers, dialogs and search/shortcut modals now reuse the Base UI-backed CMS compositions. The search action list uses public Base UI Autocomplete instead of the Radix-backed command renderer. Radix imports/dependencies and their former transitive lockfile subtree have been removed. See `packages/ui/BASE-UI.md` for compatibility and dependency regression checks.

Route drawers/focus modals are controlled overlays with explicit close state/guards, not router blockers. A consuming application must connect its own navigation protection. Saved-view confirmation is declarative and stays under the caller's React providers. Put CMS theme selectors/tokens on the document-level portal scope, as with other primary UI dialogs; React context alone does not move CSS variables across a DOM portal.

## Domain presentations

Customer/order/product/promotion helpers now consume structural records. Colliding table-cell names have explicit prefixes such as `CustomerAccountCell`, `OrderCountryCell` and `ProductStatusCell`. Render money using a supplied currency and the documented amount conventions of the selected helper; do not infer a backend pricing model from a presentation component.

Application-specific business workflows, SSO/session handling, extension loading, API errors/retries beyond the loader contract, server policies and billing rules remain with the consuming application. No Medusa API endpoints are invented.

## Persistence and lifecycle

Adapter identity and keys define a scope. Memoize adapter objects. The hooks serialize writes for that scope, guard stale UI completions and abort pending reads on scope changes/unmount. Old writes cannot be undone merely by unmounting; implement cancellable/idempotent server operations or cross-instance queues in the host when required.

Remote initialization does not overwrite newer local edits. It is not a remote conflict-resolution/merge engine. Disable mutation controls while initially loading if the host requires that stronger guarantee. Errors are exposed; callers must catch rejected explicit write promises or use the provided error-handling controls.

File previews have explicit URL ownership. Follow `revokeOnUnmount` / `revoke` rather than retaining an already-revoked URL after an uploader unmounts.

## Updating upstream

1. Read Medusa's root/dashboard license and enterprise exceptions at the new revision.
2. Inventory every component path and hash before copying anything.
3. Review changes family by family; do not restore application imports or excluded enterprise implementations.
4. Update target/support hashes and dispositions in `src/upstream-manifest.json`; a changed hash is a review requirement, not permission to blindly regenerate.
5. Run source/dependency/root-isolation audit, typechecks, package builds, unit regressions and the production playground browser suite.
6. Preserve `licenses/medusa-MIT.txt` and update NOTICE accurately. Do not replace the separate Nibleaf/AGPL notices in UI/editor packages.
