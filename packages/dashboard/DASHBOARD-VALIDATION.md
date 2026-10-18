# Dashboard extraction validation

## Package Separation - 2026-10-17

The dashboard now lives in `packages/dashboard` and exports `@cms/dashboard`.
The results below record the original extraction, not a fresh validation of the
current worktree. After separation, all 106 dashboard tests pass and the standalone
JavaScript/declaration build succeeds. The original source typecheck reported
three errors in the sortable-tree utilities; those typing errors were fixed on
2026-10-17, and the current package typecheck passes. The audit still reports 176
pre-existing target/support hash mismatches; recorded upstream hashes have not
been regenerated to conceal that drift.

The preview and Playwright fixture files referenced by the historical results
are not present in the current checkout. The browser scenarios below document
coverage from the earlier validation environment; they are not runnable here.
Use the current package checks in `DASHBOARD.md` for reproducible verification.

The docs utilities now use an independent Node test configuration rather than
the root React DOM setup. Their 26 tests, including package-boundary regressions,
pass, and docs-types and docs-utils typecheck and build successfully.

Validated **2026-10-16**, against Medusa revision `43d729055f73256ce7b3f56d196b1f4e901c011f` (dashboard 2.21.2).

## Final results

| Check | Result |
| --- | --- |
| `@cms/ui` typecheck and ESM/declaration build | Passed |
| `@cms/docs-kit` typecheck and both entry builds | Passed |
| `@cms/editor` typecheck and ESM/declaration build | Passed |
| Playground public-package-declaration typecheck | Passed |
| Playground production build | Passed |
| Merged UI token entry: Node import, isolated declarations and browser/CSS build | Passed |
| Dashboard unit/integration tests | **106 passed**, 13 files |
| Primary UI unit regressions | **128 passed**, 31 files |
| Editor unit regressions | **96 passed**, 9 files |
| Dashboard Chromium interaction/accessibility suite | **35 passed** |
| Source/dependency/root-isolation audit | Passed, no errors |
| Upstream checkout revision and file hashes | Passed |
| Export file paths / dashboard client directive / documentation declaration isolation | Passed |

Shared UI/dashboard primitives now use Base UI 1.9.0 (the lockfile resolution). The search palette uses public Base UI Autocomplete inside the existing CMS FocusModal instead of the Radix-backed command renderer. UI/dashboard Radix imports and dependency declarations are gone, and the resolved workspace lockfile contains neither `cmdk` nor any Radix packages. See `packages/ui/BASE-UI.md` for the adapter contracts.

The former preset workspace has been merged into `@cms/ui`. The migrated stylesheet and five token-data modules are byte-identical to their pre-merge versions. The separately built `@cms/ui/tokens` entry loads with React/Base UI imports prohibited, and its emitted declarations typecheck with no React, DOM or Node type definitions. The original preset merger retained the production CSS/JavaScript hashes. The subsequent control-alignment correction intentionally adds a shared component text rule and a second playground page; the original token CSS and data hashes remain unchanged.

Checks ran serially with bounded compiler resources in this workspace. The production playground uses built library/UI entries, not private source aliases for the dashboard API. The public demo check therefore exercises emitted declarations as well as source compilation.

## Unit coverage

Representative coverage includes:

- Form control/label/hint/error associations, custom IDs and initial server markup.
- SSR import/render without browser globals, deterministic media-query state and empty grids.
- Controlled/default combobox/chip behavior, composition, disabled controls, uploads and preview URL ownership.
- Observer/media-query/ref/debounce lifecycle handling and scoped keyboard shortcuts.
- Cancellable search, stale responses, explicit router/auth/permission adapters and original-record table callbacks.
- Saved-view/layout write serialization, failure recovery, scope transitions, stale reads and unmount cleanup.
- In-tree asynchronous saved-view confirmation and rejected callbacks.
- JSON clipboard permission rejection/unavailability without losing the copy control.
- Command history capacity, undo/redo branching, quoted TSV, per-column atomic conversion, rectangular clipboard operations, vertical fill/undo and visible-vs-flat virtualizer indexes.
- Quantity-price shortcut ownership, outside focus, composition and repeated keys.
- Structural models, numeric/date helpers, metadata parsing and sortable tree projection behavior.
- Localized, keyboard-operable settings groups under an RTL provider.
- Twenty-four Base UI adapter regressions for refs/Slot/asChild, cancellable activation/dismissal, mixed checkbox states, native control semantics, menu/radio loop and orientation, initial select labels, manual tabs, accordion value shapes/names, nonmodal drawers and tooltip descriptions.
- Eight single-line control regressions preserve keycap props/refs and sizing overrides, align both native input/dropdown sizes and currency fields, keep multiline fields outside the rule, and verify stylesheet import order. Dashboard combobox coverage includes both single and chip display modes.
- Six token/preset merger regressions retain the public API, snapshot the original token/CSS bytes, preserve local CSS/layer wiring, reject external token-module imports and retired workspace dependencies, and verify package exports/Tailwind/CSS side effects.
- Four migration-boundary checks require direct Base UI dependencies in UI/dashboard, reject retired Radix/command imports and dependencies, verify their absence from the resolved lockfile, and reject private Base UI implementation imports.
- Eight Base UI search regressions cover auto-highlight and looping navigation, disabled-action activation prevention, keyboard/pointer actions, host keyword matching without vendor re-filtering, duplicate IDs across groups, pending/rejected selection and retry, one-Escape/query reset, loading/empty/error/expanded limits and shared RTL.
- Eight shared-layer regressions: semantic tokens, context across portals, nested surfaces, explicit style/ref preservation, undefined/CSS-wide style overrides, detached imperative prompts and Base UI state-dependent style callbacks.

Tests are not exhaustive coverage of every exported presentation cell or every host/backend integration.

## Browser coverage

`tests/dashboard/dashboard.spec.ts`, with `playwright.dashboard.config.ts`, validates:

1. Loader pagination, real sorting, debounced filtering, and saved-view restore.
2. Ctrl/Cmd+K palette operation and keyboard result selection.
3. Dirty drawer cancellation, discard confirmation and host form submission.
4. Grid Enter/edit/navigation/undo, unrelated-control focus ownership and row virtualization.
5. Rectangular typed paste, undo/redo/delete, atomic invalid-data rejection and disabled inputs.
6. 390px/320px shell fit, unclipped next-page control, mobile navigation dismissal and focus restoration.
7. Desktop dark/RTL direction and logical pinning/navigation.
8. Settled light/dark axe checks using `wcag2a`, `wcag2aa`, `wcag21aa` tags.
9. Native checked column-menu items, visibility changes and an open-menu axe check.
10. Mobile RTL horizontal scrolling with the first grid column pinned at logical start.
11. Separate keyboard-operable column reorder handles and keyboard row activation. The test waits for native sensor activation/layout frames before moving, and its dedicated rerun passed three consecutive times.

`tests/dashboard/layers.spec.ts` adds **9** browser cases covering:

- Sticky bulk-grid headers after editing, range selection, vertical/horizontal scrolling and pinning, in light LTR and dark RTL; computed positioning and pointer hit-testing verify that cells cannot paint over the header.
- Desktop sidebar/background popups below modal backdrops, with dirty confirmation above the blocked drawer.
- Native select, Ariakit combobox, popover, tooltip and nested menu layers, verified by real option/button interaction and hit-testing, not only inline style strings.
- Nested drawer and focus-modal backdrops/content, plus native and detached-root confirmations above both drawers.
- Mobile navigation 39/40 below modal backdrop/content 49/50 at both 390px and 320px.
- Runtime global token customization applied consistently to sidebars, portaled surfaces and paired backdrops.
- Search at the shared modal layer; real Sonner notifications at the global toast layer, pointer interaction, dismissal without closing the dialog and continued dialog input.

`tests/dashboard/base-ui.spec.ts` adds **8** migration cases covering:

- Keyboard menu navigation, checkbox updates, topmost Escape and trigger focus restoration in LTR and RTL.
- Native Select keyboard selection and Escape without closing its owning drawer.
- Detached imperative confirmation cancellation, preservation of both owning drawers and focus restoration.
- Keyboard focus/dismissal of real Sonner notifications above a modal, followed by real Tab/Shift+Tab focus-trap checks.
- Search action active descendants, one-Escape dismissal, query reset and trigger focus restoration in LTR/RTL, plus keyboard selection after reopening.
- An open search-palette axe scan with labelled groups and actions.

`tests/dashboard/alignment.spec.ts` adds **7** control-alignment cases, served by `/alignment.html`:

- Both field sizes, disabled states, input groups, currency fields, dropdowns and keycaps in all light/dark and LTR/RTL combinations; 1440px, 390px and 320px layouts.
- One-em control line boxes, zero native vertical padding and matching placeholder fonts without changing field heights.
- Native keyboard selection/focus return with an initially empty select and a multilingual selected label; password reveal keeps the same text metrics.
- The actual drawer's `esc` hint uses the shared keycap rule.
- Pixel-level rendered-ink bounds center `esc`, both sizes' input placeholder/typed text, both sizes' dropdown placeholder/multilingual selected labels, and single/chip combobox placeholders within 1.5px. Input placeholder/value centers differ by at most 1px. Dropdown disclosure icons are excluded from ink measurement so a centered arrow cannot mask misaligned text.
- Multiline textareas retain natural leading/top alignment.

The open column-menu/search axe scans exclude only native `data-base-ui-focus-guard` sentinels, which are deliberately aria-hidden tab redirects. Real controls remain in the scan; keyboard trapping and restoration are exercised separately. Native focus guards are not removed or made inaccessible to keyboard navigation.

Every browser case also asserts that no page runtime errors or console errors were observed. Mobile and dark/RTL screenshots were inspected. Failure traces/screenshots are retained under `.arena/playwright-dashboard` when rerunning; `.arena` is generated and not a source deliverable.

## Primary UI fixes exercised by the playground

These are fixes/compositions of the existing primary components, not replacements:

- Shared single-line `ui-control-text` leading and native/flex centering for keyboard hints, input placeholders/values and dropdown triggers. Both public component stylesheets include the rule; original token values/CSS and multiline leading remain unchanged.
- Named sort/filter/column icon buttons.
- Semantic column headers with `aria-sort`; separate column-reorder buttons rather than an interactive header containing another button.
- Native menu-item-checkbox semantics instead of nested interactive checkboxes.
- Non-modal toolbar menus, preserving normal background accessibility and dismissal behavior.
- Keyboard row activation and original-data callbacks consistent with their declared API, in both table-rendering branches.
- Logical table/checkbox alignment and a single shared Base UI direction scope.
- Wrapping pagination controls on narrow containers.
- A single shell main landmark; the skip target uses the primary `SidebarInset` main element.
- Shared semantic application layers, contextual nested/portaled surfaces and isolated local table/grid/editor paint layers.
- Marked toast outside-interaction handling and named dismiss controls that remain usable over an open dialog without dismissing it.

## Provenance and isolation

The audit verifies all **341** upstream component entries, their resolved dispositions and target hashes, **35** support files, and the two excluded enterprise paths. With `--source`, it also verifies the pinned checkout and original source hashes.

A static module walk checks **301 documentation modules** and confirms that the documentation entry does not reach the dashboard entry. The emitted root declaration entry is checked separately for dashboard leakage. Dashboard imports are checked for declared dependencies and prohibited SDK/framework/application imports. These checks supplement, rather than replace, compiler and runtime tests.

## Limits and advisories

- This is a portable component extraction, not a complete Medusa admin application or drop-in API compatibility layer.
- Host servers/adapters, production authentication/authorization, persistence conflict resolution and business workflows require application-specific integration testing.
- Automated axe checks are a representative regression gate, **not full WCAG certification** or a screen-reader audit of every family. Only Chromium was exercised here.
- Native input undo during edit mode remains browser behavior; grid history is scoped separately.
- The production demo deliberately imports many families and emits a bundle-size advisory (about 2.8 MB JS uncompressed). That is not a production bundle-size guarantee for consumers.
- The configured TypeScript 7 toolchain reports an experimental-API build advisory; all listed checks/builds completed successfully.
- The production preview path is validated. An earlier dev optimizer run exceeded sandbox resources; dev-mode optimizer behavior is not claimed as validated.
- No successful whole-monorepo/Studio production build is claimed by this dashboard validation. An additional isolated Studio-gallery production build exceeded sandbox resources after transforming its module graph; that older gallery browser suite was not rerun. The UI/editor package builds, typechecks and unit suites above passed, and the dashboard production browser suite was rerun after the Base UI migration, preset merger and control-alignment correction.

For reproducible commands and host integration contracts, see [DASHBOARD.md](DASHBOARD.md). For upstream replacements and update policy, see [DASHBOARD-MIGRATION.md](DASHBOARD-MIGRATION.md). Retain [NOTICE.md](NOTICE.md) and [licenses/medusa-MIT.txt](licenses/medusa-MIT.txt).
