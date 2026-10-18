# Reusable dashboard kit

Import the extracted dashboard families from **`@cms/dashboard`**. The existing `@cms/docs-kit` documentation entry remains separate and unchanged by this extraction.

The implementation lives in `src`. It is adapted from Medusa dashboard **2.21.2**, pinned to [`43d729055f73256ce7b3f56d196b1f4e901c011f`](https://github.com/medusajs/medusa/tree/43d729055f73256ce7b3f56d196b1f4e901c011f/packages/admin/dashboard/src/components), not a moving copy of `develop`. This is a reusable API, **not** a drop-in Medusa admin application.

## Architecture

- **`@cms/ui` stays primary.** Buttons, tables, sidebars, dialogs, tokens, progress and segmented controls reuse the primary package. Shared primitives and the search action list use Base UI; there are no Radix imports/dependencies in UI/dashboard packages or Radix packages in the resolved workspace lockfile. There is no second primitive library.
- **Host-owned services.** SDK calls, application stores, extension registries, route loaders, auth sessions and business mutations are replaced by props, callbacks, generic view models and adapters.
- **Dedicated entry.** Dashboard symbols are not re-exported through the documentation root. No Medusa SDK, React Router, TanStack Router, i18next or application provider is required by this entry.
- **Explicit persistence.** Views and layout preferences are in-memory unless an adapter is supplied. There is no implicit localStorage or remote write.
- **Presentation guards only.** Authentication and permission components display host decisions; they are not security boundaries or an RBAC engine. Enforce authorization on the server.

## Layering and sticky headers

Dashboard surfaces use the shared `@cms/ui` layer policy, included by `@cms/ui/theme.css`. Desktop sidebar (20) and mobile navigation (40) sit below modal backdrops/content (49/50); confirmations, menus, tooltips and nested surfaces follow their owning dialog. Bulk-grid headers stay sticky at the shared header layer (10), inside an isolated scrolling root so pinned/selected/editing cells cannot escape over navigation or dialogs. Search, comboboxes and drag ghosts use the same policy; no dashboard-specific z-index scale is required. See `packages/ui/LAYERS.md` for customization and custom portal integration.

## Families included

| Family | Reusable surface |
| --- | --- |
| Common | Sections, action menus, summaries, upload/preview, form composition, JSON viewer, sortable lists/trees, avatars, links, skeletons and generic entity presentations |
| Authentication | `ProtectedRoute` / `AuthenticationBoundary`, explicit permission and route guards, access-denied presentation |
| Data grid | RHF cells, typed column helpers, selection, command history, quoted rectangular TSV, keyboard editing, visibility, error navigation and virtualization |
| Data table | Primary CMS manual table composition and generic date/entity column helpers |
| Filtering | Host-controlled `FilterGroup`, `OrderBy`, debounced `Query` |
| Forms | Address/email field groups, metadata editor and schemas with host callbacks |
| Inputs | Combobox, country/province, chips, handles, quantities and percentages |
| Layout | Main/settings/public layouts, responsive dashboard shell, page layouts, navigation, notifications and user-menu view models |
| Layout composer | Section definitions, widget entries, composition and layout preferences |
| Localization | Translator/interpolation/plurals, scoped locale/direction and localized pagination |
| Modals | Controlled route-drawer/focus-modal equivalents, provider state and dirty-form close guards |
| Search | Cancellable search-source adapters and local/static command palette |
| Table presentations | Configurable loader table, saved-view controls and prefixed customer/order/product/promotion cells |
| Utilities | Error/loading boundaries, keybound forms, visibility helpers and related hooks |

All **341 upstream component files** have a disposition in [`src/upstream-manifest.json`](src/upstream-manifest.json): 316 adapted implementations/barrels, 2 adapted tests, 21 consolidated targets and 2 excluded enterprise files. Consolidation deliberately replaces legacy table internals rather than introducing another table implementation.

## Styling

Use the existing CMS Tailwind v4 theme and scan the package build. Adjust `@source` paths to the consuming stylesheet's location:

```css
@import "tailwindcss";
@import "@cms/ui/theme.css";
@source "../node_modules/@cms/ui/dist/**/*.{mjs,js}";
@source "../node_modules/@cms/dashboard/dist/**/*.js";
```

In consuming applications, configure Tailwind to scan the emitted `@cms/ui` and `@cms/dashboard` package files. If the app already imports the CMS theme, do not add a separate theme system. The former preset is merged into `@cms/ui`; there is no separate preset package. TypeScript token helpers are available from `@cms/ui/tokens`. Dark mode follows the existing CMS theme selectors; set the document's theme and direction consistently with your provider. JSON/code content intentionally stays LTR.

## Provider and routing

```tsx
import { DashboardProvider, ProtectedRoute } from '@cms/dashboard';

<DashboardProvider
  locale="en-US"
  direction="ltr"
  router={{
    location: { pathname: '/documents', search: '' },
    navigate: (href, options) => hostRouter.navigate(href, options),
  }}
  authorize={(permissions, mode) =>
    mode === 'all'
      ? permissions.every(permission => session.permissions.includes(permission))
      : permissions.some(permission => session.permissions.includes(permission))
  }
>
  <ProtectedRoute status={session.status} fallback={<SignIn />}>
    <YourDashboard />
  </ProtectedRoute>
</DashboardProvider>
```

`hostRouter`, `session`, `SignIn` and `YourDashboard` above belong to the consuming application. Pass a reactive `router.location` when it changes. `renderLink` optionally adapts a framework link while preserving anchor props and refs. Without a router, links are ordinary anchors; programmatic navigation falls back to the browser. No route objects or navigation blockers are fabricated.

`messages` provides dictionary overrides; `translate` can bridge an existing host translation service. Keep those configuration objects stable. Set `direction` explicitly for deterministic SSR and scoped RTL. The provider supplies primary CMS direction and tooltip context, not application state.

## Loader-backed table

```tsx
import { createDataTableColumnHelper } from '@cms/ui';
import { ConfigurableDataTable, type TableDataAdapter } from '@cms/dashboard';

type Document = { id: string; title: string };
const column = createDataTableColumnHelper<Document>();
const documents: TableDataAdapter<Document> = {
  key: 'documents',
  getRowId: row => row.id,
  columns: [column.accessor('title', { header: 'Title', enableSorting: true })],
  async load(state, { signal }) {
    const query = new URLSearchParams({
      q: state.search,
      offset: String(state.pagination.pageIndex * state.pagination.pageSize),
      limit: String(state.pagination.pageSize),
    });
    if (state.sorting) query.set('order', `${state.sorting.desc ? '-' : ''}${state.sorting.id}`);
    const response = await fetch(`/api/documents?${query}`, { signal });
    if (!response.ok) throw new Error('Unable to load documents');
    return response.json() as Promise<{ data: Document[]; count: number }>;
  },
};

<ConfigurableDataTable adapter={documents} heading="Documents" headingLevel="h2" />;
```

The server must implement filtering/sorting/pagination and validate allowed field names. `count` is the total matching row count, not the current page length. Requests are aborted/replaced when serialized table state or `adapter.key` changes; late responses cannot replace newer ones. Keep the adapter stable, and change its key when switching data sources or externally invalidating its loader. Merely replacing a loader closure under the same key is not a refetch signal. `renderError(error, retry)` customizes failures.

Use `DataTable` directly for already-loaded, already-paginated rows. `DashboardDataTable` is an alias. Its state can be controlled through `state`/`onStateChange`, initialized through `initialState`, or managed with `useDashboardTableState`. Row controls keep their native interactions; explicit links in cells remain preferable when opening rows should expose ordinary browser link affordances.

## Editable grid

```tsx
import { useForm } from 'react-hook-form';
import { DataGrid, createDataGridHelper } from '@cms/dashboard';

type Fields = { rows: { title: string; units: number }[] };
type RecordRow = { id: string };
const helper = createDataGridHelper<RecordRow, Fields>();
const columns = [
  helper.column({
    id: 'title', header: 'Title', type: 'text',
    field: ({ row }) => `rows.${row.index}.title`,
    cell: context => <DataGrid.TextCell context={context} />,
  }),
  helper.column({
    id: 'units', header: 'Units', type: 'number',
    field: ({ row }) => `rows.${row.index}.units`,
    cell: context => <DataGrid.NumberCell context={context} />,
  }),
];
function BulkEditor() {
  const form = useForm<Fields>({ defaultValues: { rows: [{ title: 'Introduction', units: 1 }] } });
  return <DataGrid data={[{ id: 'intro' }]} columns={columns} state={form} multiColumnSelection />;
}
```

Use flat column definitions with stable IDs and stable data/column arrays. Form field paths must stay aligned with the host's row ordering. The grid does not fetch, submit, persist, sort or reorder application data. Saving and validating changes is the host's responsibility. Give its containing layout a bounded height for virtualization; the complete example uses a 360px region.

Enter/typing starts editing; Escape restores the input snapshot; arrows/Tab navigate outside edit mode; Ctrl/Cmd+Z and Shift+Ctrl/Cmd+Z operate grid command history. Clipboard commands are scoped to the focused grid. Quoted TSV preserves tabs/newlines; rectangular writes convert each destination type atomically. Drag fill stays vertical even with rectangular selection enabled. Hidden rows/columns retain stable matrix coordinates and are mapped to visible virtualizer indexes. `disableInteractions` disables cells as well as command processing. Native input undo while editing remains native behavior.

## Search, forms, persistence and uploads

- `Search` accepts `sources` with `{ id, label, search(query, { signal, limit }) }`, plus static commands and controlled visibility. The host returns portable results and decides navigation/actions. Honor the supplied signal where possible; stale results are ignored even when a source does not.
- `Form` composes RHF `FormProvider`/`Controller` and CMS controls. Direct declarative custom control, label and hint IDs are associated during SSR. For opaque custom child wrappers, provide `Form.Item controlId` and explicit description IDs as needed. `KeyboundForm` calls a real form submit for Ctrl/Cmd+Enter and respects composition/prevented events.
- `useSavedViews({ key, adapter, initialViews })` and `useLayoutPreference(key, adapter, initial)` expose load/write/error state. Use stable adapter objects. Keys should include tenant/user/resource scope. Writes are serialized within the active adapter/scope; old-scope completions do not update the new UI. Already-started/queued writes complete for their original key; a host requiring cancellation or cross-instance concurrency control must implement that in its adapter. Disable mutation controls during initial loading if the application requires merging an initial remote list with concurrent edits.
- `SaveViewDropdown` awaits host callbacks and keeps confirmation in-tree; rejected writes show a retryable error and invoke optional `onError`. `SaveViewDialog` and `ViewPills` compose the higher-level view workflow.
- `FileUpload` validates MIME/extensions/size and returns accepted/rejected files. Generated previews include explicit URL/revoke ownership. With `revokeOnUnmount={false}`, ownership transfers to the host. Uploading bytes and reconciling business records are not built in.
- `InfiniteList` / `useInfiniteList` use TanStack Query and require the host's `QueryClientProvider`. Ordinary controls, tables, search and auth/layout shells do not require one. React Hook Form is required only for form/grid families. Do not install duplicate React/RHF instances in the consuming app.

## Playground and checks

## Package checks

```sh
bun run --cwd packages/dashboard build
bun run --cwd packages/dashboard typecheck
bun run --cwd packages/dashboard test:dashboard
bun run --cwd packages/dashboard audit:dashboard
# Optional: also verify all pinned upstream source hashes against a local checkout:
bun run --cwd packages/dashboard audit:dashboard --source /path/to/medusa
```

The historical demo and browser-test results are recorded in [DASHBOARD-VALIDATION.md](DASHBOARD-VALIDATION.md); their fixture files are not included in this checkout. Current package verification consists of the library build, source typecheck, unit tests and provenance/isolation audit.

See [migration notes](DASHBOARD-MIGRATION.md), [validation scope](DASHBOARD-VALIDATION.md), [NOTICE](NOTICE.md) and the source manifest before updating the upstream pin. The extraction's MIT provenance does **not** relicense `@cms/ui` or its separately noticed dependencies.
