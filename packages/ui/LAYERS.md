# Shared UI layers

`@cms/ui` owns the application stacking policy. `theme.css` and `styles.css` both include `layers.css` (Tailwind v4). Theme variables and design tokens are owned by this package too; see [THEME.md](THEME.md) for CSS and React-free token entry points.

| Semantic utility / CSS variable suffix | Root value | Use |
| --- | ---: | --- |
| `ui-base` | 0 | Normal content |
| `ui-sticky` | 10 | Sticky table/grid headers, inside an isolated component |
| `ui-sidebar` | 20 | Desktop navigation |
| `ui-popover` | 30 | Menus, selects, command bars, comboboxes, floating editor controls and drag ghosts |
| `ui-tooltip` | 35 | Tooltips |
| `ui-navigation` | 40 | Mobile navigation sheet |
| `ui-skip-link` | 45 | Focused skip-to-content link |
| `ui-modal` | 50 | Drawer, focus modal and search palette |
| `ui-prompt` | 70 | Confirmation dialogs |
| `ui-toast` | 1000 | Notifications |

For example, `z-ui-sidebar` uses `--z-index-ui-sidebar`. Backdrops are **one below their own surface**, not at the same layer: root navigation 39/40, modal 49/50, prompt 69/70. Both the desktop sidebar and the mobile navigation stay below modal backdrops.

## Context and portals

A flat scale is not enough: a select inside a drawer must appear above that drawer, while an unrelated background select stays below it. The exported `UiLayer` render-prop provider and `useUiLayer` hook preserve the owning surface across React portals:

- Popovers: `max(root token, owner + --ui-layer-popover-offset)` (2).
- Tooltips: `max(root token, owner + --ui-layer-tooltip-offset)` (3).
- Nested navigation/modals/prompts: `max(root token, owner + --ui-layer-stack-step)` (20).
- Toasts use the global toast token, not the owner's layer.

Thus a root drawer is 50, its popup is 52, a nested drawer is 70, and the nested drawer's confirmation is 90. The confirmation's backdrop is 89, **above** the drawer it blocks. Submenus advance relative to their parent menu too.

```tsx
import { UiLayer } from '@cms/ui';
import { createPortal } from 'react-dom';

// For a custom floating surface. Do not wrap the native Portal's DOM children
// in a cloning/asChild abstraction; retain its native refs and presence logic.
<UiLayer kind="popover">
  {(layer) => createPortal(
    <div style={{ position: 'fixed', zIndex: layer }}>Custom popup</div>,
    document.body,
  )}
</UiLayer>
```

Toaster notifications portal to `document.body` at the global toast layer and opt into pointer interaction. Shared Base UI surface callbacks recognize the marked toast subtree, so interacting with or dismissing a toast does not dismiss an open dialog. Native focus management retains its toast/live-region handling; Tab and Shift+Tab remain trapped when focus is in the modal. Mount `Toaster` once at the shared application root. Primary components apply layers automatically. Their explicit `style.zIndex` overrides are preserved and become the inherited layer for their descendants. Prefer the policy to per-page `z-50`/`z-[9999]` patches. The internal mobile sheet also preserves Base UI's state-dependent style callbacks. Both native Positioner and Popup receive their contextual layer; modal backdrops remain paired at each level, while nonmodal drawers have no blocking backdrop. See [BASE-UI.md](BASE-UI.md) for primitive migration and compatibility notes.

A separate `createRoot` does **not** inherit context. `usePrompt` bridges the layer from its hook location into the detached confirmation root; call the hook inside the owning surface. Tiptap's slash-command renderer similarly receives the editor's current popup layer instead of hardcoding 50. Bubble-menu children retain the same context for their own selects.

## Sticky/local painting

Bulk-editor scrolling roots and primary data tables are isolated stacking contexts. Headers remain `position: sticky; top: 0` at `z-ui-sticky`, above pinned cells, active inputs, range selection and drag indicators. Local paint-order values (0–3, focus outlines, resize handles) are not application layers and must not escape their component. Keep the header inside its actual scroll container.

## Customization

Override `--z-index-ui-*` and the three `--ui-layer-*-offset`/`--ui-layer-stack-step` variables in global application CSS **after** the theme. Keep the ordering and sufficient gaps for nested flyouts. Define portal-facing variables globally, not only on a page-local DOM wrapper. Arbitrary ancestor transforms, opacity, containment and isolation create independent CSS stacking contexts; a z-index cannot escape those. Application overlays should portal to a suitable shared root, as the primary primitives do.

Current regression coverage lives in `src/utils/layers.spec.tsx`. Earlier dashboard browser coverage included computed ordering, pointer hit-testing, nested confirmations/menus, mobile navigation, RTL and scrolled bulk-grid headers; those fixtures are not present in the current checkout. See `packages/dashboard/DASHBOARD-VALIDATION.md` for the historical scope.
