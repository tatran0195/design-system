import { useT } from '@cms/i18n/react';
import { Select, UiLayer } from '@cms/ui';
import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';

/** Curated fence languages (lowlight `common` grammars + mermaid). The value is
 *  what lands after the ``` fence in Markdown, so it must stay highlightable on
 *  the live site too. */
const CODE_BLOCK_LANGUAGES = [
  'bash',
  'c',
  'cpp',
  'csharp',
  'css',
  'diff',
  'go',
  'graphql',
  'html',
  'java',
  'javascript',
  'json',
  'kotlin',
  'markdown',
  'mermaid',
  'php',
  'python',
  'ruby',
  'rust',
  'shell',
  'sql',
  'swift',
  'typescript',
  'xml',
  'yaml',
] as const;

// Radix Select reserves an empty string for clearing the selection.
const PLAIN_VALUE = '__cms_plain_text__';
const LANGUAGE_PREFIX = 'language:';
const languageValue = (language: string) => `${LANGUAGE_PREFIX}${language}`;

/**
 * Floating language switcher shown while the caret is inside a code block.
 * Sets the codeBlock `language` attr, which drives lowlight highlighting, the
 * chrome's data-language label, and the ```lang fence on Markdown save.
 */
export function CodeBlockMenu({ editor }: { editor: Editor }) {
  const t = useT();
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      active: current.isActive('codeBlock'),
      language: (current.getAttributes('codeBlock').language as string | null | undefined) ?? '',
    }),
  });

  // Preserve a language that came from imported Markdown but is not in the curated list.
  const known = CODE_BLOCK_LANGUAGES.includes(state.language as (typeof CODE_BLOCK_LANGUAGES)[number]);
  const items: Array<{ value: string; label: string }> = [
    { value: PLAIN_VALUE, label: t('editor.codeBlock.plain') },
    ...(state.language && !known ? [{ value: languageValue(state.language), label: state.language }] : []),
    ...CODE_BLOCK_LANGUAGES.map((language) => ({ value: languageValue(language), label: language })),
  ];

  return (
    <UiLayer kind="popover">
      {(layer) => (
        <BubbleMenu
          style={{ zIndex: layer }}
          data-ui-layer="popover"
          editor={editor}
          pluginKey="nibleaf-code-block-menu"
          options={{ placement: 'top-end' }}
          shouldShow={({ editor: current }) => current.isEditable && current.isActive('codeBlock')}
          className="rounded-lg border border-ui-border-base bg-ui-bg-component p-1 shadow-lg"
        >
          <Select
            size="small"
            onValueChange={(next) => {
              editor
                .chain()
                .focus()
                .updateAttributes('codeBlock', { language: next === PLAIN_VALUE ? null : next.slice(LANGUAGE_PREFIX.length) })
                .run();
            }}
            value={state.language ? languageValue(state.language) : PLAIN_VALUE}
          >
            <Select.Trigger
              aria-label={t('editor.codeBlock.language')}
              className="h-7 font-mono text-[12px]"
              dir="ltr"
              title={t('editor.codeBlock.language')}
            >
              <Select.Value />
            </Select.Trigger>
            <Select.Content className="font-mono text-[12px]" dir="ltr">
              {items.map((item) => (
                <Select.Item key={item.value} value={item.value}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </BubbleMenu>
      )}
    </UiLayer>
  );
}
