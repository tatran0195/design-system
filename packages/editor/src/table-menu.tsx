import type { MessageKey } from '@cms/i18n';
import { useT } from '@cms/i18n/react';
import { clx, IconButton, UiLayer } from '@cms/ui';
import type { Editor } from '@tiptap/core';
import { CellSelection } from '@tiptap/pm/tables';
import { useEditorState } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import type { ComponentType, ReactNode } from 'react';
import { ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine, ArrowUpToLine, Columns3, PanelTop, Rows3, Trash2, X } from './icons';

/** A Rows3/Columns3 glyph with a small × badge — reads as "delete row/column". */
function DeleteGlyph({ icon: Icon }: { icon: ComponentType<{ className?: string }> }) {
  return (
    <span className="relative inline-flex">
      <Icon className="size-4" />
      <X className="-end-1.5 -top-1 absolute size-2.5" strokeWidth={3} />
    </span>
  );
}

interface TableAction {
  labelKey: MessageKey;
  content: ReactNode;
  run: () => void;
  enabled: boolean;
  destructive?: boolean;
  separatorBefore?: boolean;
}

/**
 * Floating table controls, shown while the caret (or a cell selection) is inside
 * a table: insert/delete rows and columns, toggle the header row, delete the
 * table. Positioned BELOW the selection so it never fights the text formatting
 * bubble (which floats above and only appears for non-empty text selections).
 */
export function TableBubbleMenu({ editor }: { editor: Editor }) {
  const t = useT();
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      inTable: current.isActive('table'),
      canAddRowBefore: current.can().addRowBefore(),
      canAddRowAfter: current.can().addRowAfter(),
      canAddColBefore: current.can().addColumnBefore(),
      canAddColAfter: current.can().addColumnAfter(),
      canDeleteRow: current.can().deleteRow(),
      canDeleteCol: current.can().deleteColumn(),
      canToggleHeader: current.can().toggleHeaderRow(),
      canDeleteTable: current.can().deleteTable(),
    }),
  });

  const actions: TableAction[] = [
    {
      labelKey: 'editor.table.addRowAbove',
      content: <ArrowUpToLine className="size-4" />,
      run: () => editor.chain().focus().addRowBefore().run(),
      enabled: state.canAddRowBefore,
    },
    {
      labelKey: 'editor.table.addRowBelow',
      content: <ArrowDownToLine className="size-4" />,
      run: () => editor.chain().focus().addRowAfter().run(),
      enabled: state.canAddRowAfter,
    },
    {
      labelKey: 'editor.table.deleteRow',
      content: <DeleteGlyph icon={Rows3} />,
      run: () => editor.chain().focus().deleteRow().run(),
      enabled: state.canDeleteRow,
    },
    {
      labelKey: 'editor.table.addColBefore',
      content: <ArrowLeftToLine className="size-4 rtl:-scale-x-100" />,
      run: () => editor.chain().focus().addColumnBefore().run(),
      enabled: state.canAddColBefore,
      separatorBefore: true,
    },
    {
      labelKey: 'editor.table.addColAfter',
      content: <ArrowRightToLine className="size-4 rtl:-scale-x-100" />,
      run: () => editor.chain().focus().addColumnAfter().run(),
      enabled: state.canAddColAfter,
    },
    {
      labelKey: 'editor.table.deleteCol',
      content: <DeleteGlyph icon={Columns3} />,
      run: () => editor.chain().focus().deleteColumn().run(),
      enabled: state.canDeleteCol,
    },
    {
      labelKey: 'editor.table.toggleHeader',
      content: <PanelTop className="size-4" />,
      run: () => editor.chain().focus().toggleHeaderRow().run(),
      enabled: state.canToggleHeader,
      separatorBefore: true,
    },
    {
      labelKey: 'editor.table.delete',
      content: <Trash2 className="size-4" />,
      run: () => editor.chain().focus().deleteTable().run(),
      enabled: state.canDeleteTable,
      destructive: true,
      separatorBefore: true,
    },
  ];

  return (
    <UiLayer kind="popover">
      {(layer) => (
        <BubbleMenu
          style={{ zIndex: layer }}
          data-ui-layer="popover"
          editor={editor}
          pluginKey="nibleaf-table-menu"
          options={{ placement: 'bottom' }}
          // Only while inside a table, and only when the text bubble is NOT showing:
          // caret (empty selection) or a cell selection. A non-empty text selection
          // inside a cell keeps the formatting bubble usable on its own.
          shouldShow={({ editor: current }) => {
            if (!current.isEditable || !current.isActive('table')) {
              return false;
            }
            const { selection } = current.state;
            return selection.empty || selection instanceof CellSelection;
          }}
          className="flex max-w-[calc(100vw-1.5rem)] flex-wrap items-center gap-0.5 rounded-lg border border-ui-border-base bg-ui-bg-component p-1 shadow-lg"
        >
          {actions.map((action) => {
            const label = t(action.labelKey);
            return (
              <span key={action.labelKey} className="flex items-center gap-0.5">
                {action.separatorBefore ? <span className="mx-0.5 h-5 w-px bg-ui-border-base" /> : null}
                <IconButton
                  aria-label={label}
                  className={clx('size-7 text-ui-fg-subtle', action.destructive && 'hover:bg-ui-tag-red-bg hover:text-ui-fg-error')}
                  disabled={!action.enabled}
                  onClick={action.run}
                  onMouseDown={(event) => event.preventDefault()}
                  size="small"
                  title={label}
                  type="button"
                  variant="transparent"
                >
                  {action.content}
                </IconButton>
              </span>
            );
          })}
        </BubbleMenu>
      )}
    </UiLayer>
  );
}
