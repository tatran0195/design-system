/** @vitest-environment jsdom */
/**
 * Page-switch safety for the Markdown-controlled TipTap editor: an empty `value`
 * must always clear the document, and re-seeding must never bounce the previous
 * document back through `onChange` (that is how a new page inherited the
 * previous page's body in production).
 */
import { Editor } from '@tiptap/core';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@cms/i18n/react', () => ({ useT: () => (key: string) => key, useLocale: () => ({ locale: 'en', t: (key: string) => key }) }));

import { buildEditorExtensions, getMarkdown, seedMarkdown, TiptapEditor } from './tiptap-editor';

vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);

const roots: Array<{ root: ReturnType<typeof createRoot>; container: HTMLElement }> = [];

/** Floating menus (bubble menu, drag handle) rely on browser APIs jsdom lacks. */
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(async () => {
  for (const { root, container } of roots.splice(0)) {
    await act(async () => root.unmount());
    container.remove();
  }
});

/** Seeding is deferred to a microtask — let it settle inside `act`. */
const settle = () =>
  act(async () => {
    await Promise.resolve();
  });

const mount = async (element: React.ReactElement) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  await act(async () => root.render(element));
  // Seeding is deferred to a microtask — let it settle.
  await settle();
  return { root, container, prose: () => container.querySelector('.ProseMirror') };
};

describe('seedMarkdown', () => {
  it('clears the document for an empty source', () => {
    const editor = new Editor({ element: document.createElement('div'), extensions: buildEditorExtensions() });
    try {
      seedMarkdown(editor, '# Previous page\n\nBody text.');
      expect(getMarkdown(editor)).toContain('Previous page');
      seedMarkdown(editor, '');
      expect(getMarkdown(editor)).toBe('');
      expect(editor.state.doc.textContent).toBe('');
      seedMarkdown(editor, '   \n');
      expect(getMarkdown(editor)).toBe('');
    } finally {
      editor.destroy();
    }
  });

  it('does not emit an update while seeding', () => {
    const editor = new Editor({ element: document.createElement('div'), extensions: buildEditorExtensions() });
    const onUpdate = vi.fn();
    editor.on('update', onUpdate);
    try {
      seedMarkdown(editor, 'Hello');
      seedMarkdown(editor, '');
      expect(onUpdate).not.toHaveBeenCalled();
    } finally {
      editor.destroy();
    }
  });
});

describe('TiptapEditor', () => {
  it('renders rich text as a document workspace with an accessible cms toolbar', async () => {
    const onChange = vi.fn();
    const { container, prose } = await mount(
      <TiptapEditor
        dir="rtl"
        lang="ar"
        onChange={onChange}
        titleSlot={<input aria-label="Document title" defaultValue="عنوان المستند" />}
        value="English text داخل مستند عربي"
        variant="wysiwyg"
      />,
    );

    const editor = container.querySelector('[data-editor-variant="wysiwyg"]');
    const page = container.querySelector('.pl-document-page');
    expect(editor?.getAttribute('lang')).toBe('ar');
    expect(container.querySelector('[role="toolbar"]')).not.toBeNull();
    expect(page?.querySelector('[aria-label="Document title"]')).not.toBeNull();
    expect(page?.contains(prose())).toBe(true);
    expect(prose()?.getAttribute('dir')).toBe('rtl');
    expect(prose()?.querySelector('p')?.getAttribute('dir')).toBe('auto');
  });

  it('mounts with the given markdown', async () => {
    const onChange = vi.fn();
    const { prose } = await mount(<TiptapEditor value="Hello from page A" onChange={onChange} />);
    expect(prose()?.textContent).toContain('Hello from page A');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clears the document when the value becomes empty and never echoes the old body', async () => {
    const onChange = vi.fn();
    const { root, prose } = await mount(<TiptapEditor value="Hello from page A" onChange={onChange} />);
    expect(prose()?.textContent).toContain('Hello from page A');

    await act(async () => root.render(<TiptapEditor value="" onChange={onChange} />));
    await settle();

    expect(prose()?.textContent).toBe('');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('re-seeds to a different page body without emitting onChange', async () => {
    const onChange = vi.fn();
    const { root, prose } = await mount(<TiptapEditor value="Page A" onChange={onChange} />);

    await act(async () => root.render(<TiptapEditor value="صفحة ب" onChange={onChange} />));
    await settle();

    expect(prose()?.textContent).toBe('صفحة ب');
    expect(prose()?.textContent).not.toContain('Page A');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('a fresh instance (keyed remount) never sees the previous document', async () => {
    const onChange = vi.fn();
    const { root, prose } = await mount(<TiptapEditor key="page-a" value="Page A body" onChange={onChange} />);
    expect(prose()?.textContent).toContain('Page A body');

    await act(async () => root.render(<TiptapEditor key="page-b" value="" onChange={onChange} />));
    await settle();

    expect(prose()?.textContent).toBe('');
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('read-only editor safety', () => {
  const value = '<Card title="Protected title" href="/docs">Body text</Card>';

  it('hides editing controls and locks MDX attributes for a read-only document', async () => {
    const { container, prose } = await mount(
      <TiptapEditor value={value} onChange={vi.fn()} editable={false} variant="wysiwyg" label="Read-only document" />,
    );
    expect(container.querySelector('[role="toolbar"]')).toBeNull();
    expect(prose()).toHaveAttribute('role', 'textbox');
    expect(prose()).toHaveAttribute('aria-readonly', 'true');
    expect(prose()).toHaveAttribute('contenteditable', 'false');
    const fields = container.querySelectorAll<HTMLInputElement>('.pl-card input');
    expect(fields.length).toBeGreaterThan(0);
    for (const field of fields) expect(field.readOnly).toBe(true);
  });

  it('updates existing node-view fields when switching to review mode', async () => {
    const onChange = vi.fn();
    const { root, container, prose } = await mount(<TiptapEditor value={value} onChange={onChange} variant="wysiwyg" />);
    const title = container.querySelector<HTMLInputElement>('.pl-card-title-input');
    expect(title?.readOnly).toBe(false);
    await act(async () => root.render(<TiptapEditor value={value} onChange={onChange} variant="wysiwyg" commentMode />));
    await settle();
    expect(container.querySelector('[role="toolbar"]')).toBeNull();
    expect(prose()).toHaveAttribute('aria-readonly', 'true');
    expect(title?.readOnly).toBe(true);
  });
});

const imagePaste = () => {
  const event = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', {
    value: { files: [new File(['image'], 'test.png', { type: 'image/png' })], getData: () => '', types: ['Files'] },
  });
  return event;
};

it('does not upload pasted files from a read-only document', async () => {
  const onUpload = vi.fn();
  const { prose } = await mount(<TiptapEditor value="Protected" onChange={vi.fn()} onUpload={onUpload} editable={false} />);
  const event = imagePaste();
  await act(async () => {
    prose()?.dispatchEvent(event);
  });
  expect(onUpload).not.toHaveBeenCalled();
  expect(event.defaultPrevented).toBe(true);
});

it('does not insert a late upload into a newly seeded document', async () => {
  let resolveUpload!: (url: string | null) => void;
  const onUpload = vi.fn(
    () =>
      new Promise<string | null>((resolve) => {
        resolveUpload = resolve;
      }),
  );
  const onChange = vi.fn();
  const { root, prose } = await mount(<TiptapEditor value="Page A" onChange={onChange} onUpload={onUpload} />);
  await act(async () => {
    prose()?.dispatchEvent(imagePaste());
  });
  expect(onUpload).toHaveBeenCalledTimes(1);
  await act(async () => root.render(<TiptapEditor value="Page B" onChange={onChange} onUpload={onUpload} />));
  await settle();
  await act(async () => {
    resolveUpload('https://example.com/image.png');
  });
  expect(prose()).toHaveTextContent('Page B');
  expect(prose()?.querySelector('img')).toBeNull();
});
