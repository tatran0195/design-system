import { XMark } from '@cms/icons';
import { Button, FocusModal as Dialog, Heading, IconButton, Input, Kbd, Text } from '@cms/ui';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from '../../../i18n';

const useDataGridShortcuts = () => {
  const { t } = useTranslation();

  const shortcuts = useMemo(
    () => [
      {
        label: t('dataGrid.shortcuts.commands.undo'),
        keys: {
          Mac: ['⌘', 'Z'],
          Windows: ['Ctrl', 'Z'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.redo'),
        keys: {
          Mac: ['⇧', '⌘', 'Z'],
          Windows: ['Shift', 'Ctrl', 'Z'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.copy'),
        keys: {
          Mac: ['⌘', 'C'],
          Windows: ['Ctrl', 'C'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.paste'),
        keys: {
          Mac: ['⌘', 'V'],
          Windows: ['Ctrl', 'V'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.edit'),
        keys: {
          Mac: ['↵'],
          Windows: ['Enter'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.delete'),
        keys: {
          Mac: ['⌫'],
          Windows: ['Backspace'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.clear'),
        keys: {
          Mac: ['Space'],
          Windows: ['Space'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.moveUp'),
        keys: {
          Mac: ['↑'],
          Windows: ['↑'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.moveDown'),
        keys: {
          Mac: ['↓'],
          Windows: ['↓'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.moveLeft'),
        keys: {
          Mac: ['←'],
          Windows: ['←'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.moveRight'),
        keys: {
          Mac: ['→'],
          Windows: ['→'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.moveTop'),
        keys: {
          Mac: ['⌘', '↑'],
          Windows: ['Ctrl', '↑'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.moveBottom'),
        keys: {
          Mac: ['⌘', '↓'],
          Windows: ['Ctrl', '↓'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.selectDown'),
        keys: {
          Mac: ['⇧', '↓'],
          Windows: ['Shift', '↓'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.selectUp'),
        keys: {
          Mac: ['⇧', '↑'],
          Windows: ['Shift', '↑'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.selectColumnDown'),
        keys: {
          Mac: ['⇧', '⌘', '↓'],
          Windows: ['Shift', 'Ctrl', '↓'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.selectColumnUp'),
        keys: {
          Mac: ['⇧', '⌘', '↑'],
          Windows: ['Shift', 'Ctrl', '↑'],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.focusToolbar'),
        keys: {
          Mac: ['⌃', '⌥', ','],
          Windows: ['Ctrl', 'Alt', ','],
        },
      },
      {
        label: t('dataGrid.shortcuts.commands.focusCancel'),
        keys: {
          Mac: ['⌃', '⌥', '.'],
          Windows: ['Ctrl', 'Alt', '.'],
        },
      },
    ],
    [t],
  );

  return shortcuts;
};

type DataGridKeyboardShortcutModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const DataGridKeyboardShortcutModal = ({ open, onOpenChange }: DataGridKeyboardShortcutModalProps) => {
  const { t } = useTranslation();
  const [searchValue, onSearchValueChange] = useState('');
  const shortcuts = useDataGridShortcuts();
  const searchRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(
    () => shortcuts.filter((shortcut) => shortcut.label.toLowerCase().includes(searchValue.toLowerCase())),
    [searchValue, shortcuts],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <Button size="small" variant="secondary">
          {t('dataGrid.shortcuts.label')}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content
        initialFocus={searchRef}
        className="bg-ui-bg-subtle shadow-elevation-modal fixed right-auto bottom-auto border-0 left-[50%] top-[50%] flex h-full max-h-[612px] w-full max-w-[560px] translate-x-[-50%] translate-y-[-50%] flex-col divide-y overflow-hidden rounded-lg outline-none"
      >
        <div className="flex flex-col gap-y-3 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Dialog.Title asChild>
                <Heading>{t('app.menus.user.shortcuts')}</Heading>
              </Dialog.Title>
              <Dialog.Description className="sr-only" />
            </div>
            <div className="flex items-center gap-x-2">
              <Kbd>esc</Kbd>
              <Dialog.Close asChild>
                <IconButton variant="transparent" size="small" aria-label={t('actions.close')}>
                  <XMark />
                </IconButton>
              </Dialog.Close>
            </div>
          </div>
          <div>
            <Input
              ref={searchRef}
              aria-label={t('general.search')}
              type="search"
              value={searchValue}
              autoFocus
              onChange={(e) => onSearchValueChange(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col divide-y overflow-y-auto">
          {searchResults.map((shortcut, index) => (
            <div key={index} className="text-ui-fg-subtle flex items-center justify-between px-6 py-3">
              <Text size="small">{shortcut.label}</Text>
              <div className="flex items-center gap-x-1">
                {shortcut.keys.Mac?.map((key, index) => (
                  <div className="flex items-center gap-x-1" key={index}>
                    <Kbd>{key}</Kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
