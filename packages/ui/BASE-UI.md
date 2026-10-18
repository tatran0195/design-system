# Base UI primitives

`@cms/ui` is the primary CMS component package. Its shared controls and floating surfaces use **`@base-ui/react`**, not Radix primitives. Consumers keep importing the existing CMS components and `@cms/dashboard`; there is no additional UI package or theme to install.

## Implementation

The adapters in `src/primitives` compose public Base UI entry points:

- Dialog / AlertDialog → Drawer, FocusModal, Prompt and imperative `usePrompt`.
- Menu / ContextMenu → dropdowns, column menus, checkbox/radio items and nested menus.
- Select, Popover and Tooltip → portaled CMS floating surfaces.
- Checkbox, Switch, Radio, Tabs and Accordion → existing CMS control compositions.
- Avatar, Button, Collapsible, DirectionProvider and `useRender` → remaining shared primitive composition, including `Slot` / `asChild`.

The dashboard action palette uses public Base UI `Autocomplete` in inline/no-filter mode inside the existing CMS FocusModal. Native Base UI handles active descendants, disabled actions, looping navigation and Enter; the existing injected search service still owns matching, groups, loading, limits and cancellable requests. Selecting an action does not overwrite the query while async host callbacks are pending or fail.

Previously ported components continue to use Base UI. Shared CMS names, variants, `ui-*` tokens, string-valued selection callbacks, checkbox mixed state, manual tabs, accordion value shapes, direction scope, refs and common `asChild` composition are retained. The adapters provide CMS `data-state` aliases alongside Base UI's native state attributes. Cancellable CMS content/selection callbacks are bridged to native dismissal rather than implementing another focus or modal stack. These adapters preserve CMS composition contracts; they are not a replacement import path for every raw Radix API.

Tooltips retain a tooltip role and an associated trigger description, including initially open/controlled content. Menu checkboxes retain `aria-checked="mixed"`, a visible mixed-state indicator and boolean change callbacks. Menu/radio/accordion loop and orientation settings map to the appropriate native behavior.

## Layering, dismissal and focus

See [LAYERS.md](LAYERS.md) for the shared policy. Positioners **and** popups receive the owning layer; styling only the popup can leave it trapped inside a lower positioner stacking context. Modal backdrops remain paired with each dialog, including nested dialogs, while nonmodal drawers do not paint a blocking backdrop.

Native Base UI owns focus trapping, focus restoration, keyboard navigation and topmost Escape/outside dismissal. CMS bridges cancellable callbacks and the layer of detached imperative prompts. Do not restore global Escape listeners, blanket `document.body.style.pointerEvents` resets, private vendor imports or a second global modal registry.

Sonner remains the notification renderer. `Toaster` portals to the body at the shared toast layer, marks the toast subtree and opts into pointer interaction. Shared surface callbacks recognize toast interaction without closing the owning modal; native focus management retains its toast/live-region handling. Mount `Toaster` once at the application root.

## Styling and dependencies

Theme CSS and token data are owned by this package too. The merged preset is available through `@cms/ui/theme.css`, lower-level `@cms/ui/tokens.css` and the React-free `@cms/ui/tokens` data entry; see [THEME.md](THEME.md).

Native accordion height animation uses `--accordion-panel-height`; floating dimensions use `--available-height` / `--anchor-width`. Existing CMS open/closed, checked/unchecked/indeterminate and active/inactive selectors are normalized by the adapters. Avoid depending on a vendor's private DOM structure; Select, for example, has separate Positioner, Popup and List elements.

There are **no Radix imports or dependency declarations** in the UI/dashboard packages. The Radix-backed `cmdk` renderer has been removed rather than forked; the resolved workspace lockfile contains neither `cmdk` nor any Radix packages. Both packages declare their direct Base UI dependency, and the lockfile resolves Base UI 1.9.0.

## Regression checks

- `src/primitives/base-ui.spec.tsx`: composition, controls, cancellation, mixed menu state, loop/orientation, initial selection labels, nonmodal drawers and tooltip descriptions.
- `src/primitives/migration.spec.ts`: requires direct Base UI dependencies in UI/dashboard, rejects retired Radix/command imports and dependencies, checks the resolved lockfile, and rejects private Base UI implementation imports.
- `packages/dashboard/src/__tests__/search.test.tsx`: action keyboard/pointer selection, disabled/loop behavior, host keyword filtering, cross-group IDs, pending/rejected actions, Escape/query reset, loading/limits/errors and RTL.
- `src/hooks/use-prompt/use-prompt.spec.tsx` and `src/utils/layers.spec.tsx`: prompt lifecycle and shared/contextual layers.
- Historical dashboard browser coverage also exercised real RTL/LTR menus, select keyboard operation, topmost dismissal, detached confirmation/focus restoration, modal Tab/Shift+Tab trapping, toast keyboard interaction and computed layer/hit-testing. Those fixture files are not present in the current checkout; see `packages/dashboard/DASHBOARD-VALIDATION.md` for scope.

Run package typechecks, builds and unit suites after changing adapters. See `packages/dashboard/DASHBOARD-VALIDATION.md` for historical browser-validation scope and current limits.
