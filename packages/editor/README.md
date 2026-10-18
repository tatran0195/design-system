# @cms/editor

The core Markdown-controlled TipTap editor and extensions, extracted from
Nibleaf and adapted to the primary `@cms/ui` components and theme. Dashboard
features such as site settings, branch switching, AI assistance, page-tree
management, and the comments panel remain in the consuming app.

## Styling

Import the theme and editor CSS once from the application's main stylesheet.
Tailwind must scan the UI/editor classes, including when using built packages:

```css
@import "tailwindcss";
@import "@cms/ui/theme.css";
@import "@cms/editor/tiptap.css";

/* Adjust paths relative to this stylesheet. */
@source "../node_modules/@cms/ui/dist";
@source "../node_modules/@cms/editor/dist";
```

Do not also import `@cms/ui/styles.css` when your stylesheet already imports
Tailwind and the UI theme. The editor does not inject global CSS as a JavaScript
side effect. Its scoped CSS uses the raw cms theme tokens so nested light/dark
scopes work correctly.

## React

```tsx
import { useState } from 'react';
import { TiptapEditor, MarkdownSourceEditor } from '@cms/editor';

export function DocumentEditor() {
  const [markdown, setMarkdown] = useState('## Hello\n\nStart writing.');
  return (
    <div className="h-[600px]">
      <TiptapEditor
        label="Document body"
        value={markdown}
        onChange={setMarkdown}
        variant="wysiwyg"
        lang="en"
      />
    </div>
  );
}
```

- `variant="wysiwyg"` supplies a persistent toolbar and scrolling document
  canvas. `variant="visual"` supplies block controls instead.
- `editable={false}` disables rich-text mutation controls and locks editable
  MDX attributes. `commentMode` also locks attributes while retaining text
  selection for review.
- `MarkdownSourceEditor` uses the same controlled `value`/`onChange` contract;
  use `readOnly` to lock its source and formatting controls. Source is always
  LTR, even when `dir="rtl"` describes the prose.
- Supply `onUpload(file)` to upload images; it resolves to a hosted URL or
  `null`. Upload implementation and credentials remain app-owned.
- The wrapper accepts `titleSlot`, `dir`, `lang`, typography `style`, comment
  markers, and a selection-comment callback. `label` supplies the accessible
  name of the rich-text surface.

`buildEditorExtensions`, `getMarkdown`, `seedMarkdown`, the callout/MDX/comment
extensions, draft helpers, and slash-command helpers are exported for consumers
that build their own editor shell. Unsupported MDX source is preserved rather
than silently discarded. Slash labels/search/scaffolds follow the supported
`@cms/i18n` catalog; unsupported page languages fall back to the default catalog
without preventing RTL content editing.

## Development

Build `@cms/ui` before typechecking/building the editor, since it resolves the
UI package's built declarations. Then run:

```sh
bun run typecheck
bun run test
bun run build
```

See `NOTICE.md` for upstream AGPL-3.0-only attribution and the icon notices.
