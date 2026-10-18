'use client';
import { EllipsisHorizontal } from '@cms/icons';
import { Button, DropdownMenu, Text } from '@cms/ui';
import { useState } from 'react';
import type { SavedView } from '../../../hooks/use-saved-views';
export interface ViewPillsProps {
  views: Pick<SavedView<unknown>, 'id' | 'name'>[];
  activeId?: string | null;
  onSelect: (id: string | null) => void;
  onCreate?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void | Promise<void>;
  defaultLabel?: string;
  disabled?: boolean;
}
export function ViewPills({ views, activeId, onSelect, onCreate, onEdit, onDelete, defaultLabel = 'Default', disabled }: ViewPillsProps) {
  const [error, setError] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  return (
    <div>
      <div role="group" aria-label="Saved views" className="flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant={!activeId ? 'secondary' : 'transparent'}
          size="small"
          aria-pressed={!activeId}
          onClick={() => onSelect(null)}
          disabled={disabled}
        >
          {defaultLabel}
        </Button>
        {views.map((view) => (
          <div key={view.id} className="flex items-center">
            <Button
              type="button"
              size="small"
              variant={activeId === view.id ? 'secondary' : 'transparent'}
              aria-pressed={activeId === view.id}
              disabled={disabled || pending === view.id}
              onClick={() => onSelect(view.id)}
            >
              {view.name}
            </Button>
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Button variant="transparent" size="small" aria-label={`Manage ${view.name}`} disabled={disabled || pending === view.id}>
                    <EllipsisHorizontal />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  {onEdit && <DropdownMenu.Item onSelect={() => onEdit(view.id)}>Edit view</DropdownMenu.Item>}
                  {onDelete && (
                    <DropdownMenu.Item
                      onSelect={() => {
                        setPending(view.id);
                        setError(false);
                        Promise.resolve()
                          .then(() => onDelete(view.id))
                          .catch(() => setError(true))
                          .finally(() => setPending(null));
                      }}
                      className="text-ui-fg-error"
                    >
                      Delete view
                    </DropdownMenu.Item>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu>
            )}
          </div>
        ))}
        {onCreate && (
          <Button type="button" variant="transparent" size="small" onClick={onCreate} disabled={disabled}>
            Save view
          </Button>
        )}
      </div>
      {error && (
        <Text role="alert" size="small" className="text-ui-fg-error">
          Unable to delete this view.
        </Text>
      )}
    </div>
  );
}
