# Theme and design tokens

`@cms/ui` owns the CMS components, theme, design-token data and shared layer policy. The former `@cms/ui-preset` workspace package has been merged into it; no compatibility package or second theme system is required.

## Application stylesheet

The existing theme entry is unchanged:

```css
@import "@cms/ui/theme.css";
@source "../node_modules/@cms/ui/dist/**/*.{mjs,js}";
```

Adjust the `@source` path to your stylesheet. `theme.css` includes Tailwind v4, shared `layers.css`, the base token stylesheet and the additional CMS/documentation token aliases. Existing `ui-*` utilities, light/dark selectors, scoped themes, Base UI accordion animations and z-index tokens are retained. Import the theme once per application stylesheet.

`@cms/ui/styles.css` remains the existing package-source development stylesheet with its source scan and root defaults. It now reads the same local token file instead of resolving another workspace package; its behavior has not otherwise changed.

For a lower-level composition that deliberately does not need the full CMS theme, use:

```css
@import "tailwindcss";
@import "@cms/ui/tokens.css";
```

`tokens.css` supplies the original base palette, effects, typography utilities and light/dark variables. It does **not** replace the full `theme.css` entry: import `@cms/ui/layers.css` as well if composing application overlays manually, or prefer `theme.css` for CMS components.

## Single-line control alignment

`Kbd`, `Input`, `Select.Trigger`, native currency fields and the reusable dashboard combobox share the `ui-control-text` rule. Its one-em line box avoids inheriting the 20px compact text leading inside smaller chrome. Fixed-height native inputs use zero vertical padding; dropdown triggers and keycaps center their content with flex alignment. Placeholders inherit the input font, so empty and populated fields use the same metrics. The standard field heights remain 32px / 28px and keycaps remain 20px.

The rule is loaded after the legacy typography from both `theme.css` and `styles.css`; standalone data and `tokens.css` are unchanged. Multiline textareas and prose deliberately retain their normal leading and top alignment. Hosts that intentionally need different control leading may set `--ui-control-line-height` on the relevant scope.

## React-free TypeScript entry

```ts
import {
  FONT_FAMILY_SANS,
  FONT_FAMILY_MONO,
  colors,
  effects,
  typography,
  theme,
} from '@cms/ui/tokens';

const foreground = colors.light['--fg-base'];
const darkForeground = colors.dark['--fg-base'];
```

This is a separately built ESM/declaration entry containing only data. Importing it does not load React, Base UI, components, browser globals or CSS. It retains the former preset's six named exports and their values. Font constants describe font stacks; they do not download or embed font files. The JavaScript maps retain the legacy token metadata; the runtime CSS also retains its existing contrast/accessibility overrides. This merge does not regenerate one from the other or change either set of values.

`theme` retains the legacy `extend`-shaped theme mapping for tooling that uses it. Tailwind v4 applications should normally consume the CSS entry rather than introduce a JavaScript preset.

## Migration

| Former import / dependency | Use now |
| --- | --- |
| `@cms/ui-preset` TypeScript exports | `@cms/ui/tokens` |
| `@cms/ui-preset/theme.css` base tokens only | `@cms/ui/tokens.css` |
| Existing `@cms/ui/theme.css` | Keep unchanged; it includes the tokens locally |
| Separate preset workspace dependency | Remove; keep `@cms/ui` |

Component imports remain at `@cms/ui`; they are not re-exported from the token entry. Tailwind is now a direct dependency of the combined package. CSS remains marked as side-effectful so consumers do not accidentally tree-shake styles.

The migrated CMS token data and stylesheet retain their original MIT license. Nibleaf-derived UI components retain the separate notices in [NOTICE.md](NOTICE.md). See [LAYERS.md](LAYERS.md) for portal/layer integration and [BASE-UI.md](BASE-UI.md) for primitive migration.
