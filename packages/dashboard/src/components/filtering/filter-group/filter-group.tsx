'use client';
import { XMarkMini } from '@cms/icons';
import { Button, DropdownMenu, IconButton } from '@cms/ui';
import { type ReactNode, useState } from 'react';
export interface FilterGroupItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}
export interface FilterGroupProps {
  filters: FilterGroupItem[];
  activeIds?: string[];
  defaultActiveIds?: string[];
  onActiveIdsChange?: (ids: string[]) => void;
  onRemove?: (id: string) => void;
  onClear?: () => void;
}
export function FilterGroup({ filters, activeIds: controlled, defaultActiveIds = [], onActiveIdsChange, onRemove, onClear }: FilterGroupProps) {
  const [internal, setInternal] = useState(defaultActiveIds);
  const active = controlled ?? internal;
  const available = filters.filter((filter) => !active.includes(filter.id));
  const change = (next: string[]) => {
    setInternal(next);
    onActiveIdsChange?.(next);
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters
        .filter((filter) => active.includes(filter.id))
        .map((filter) => (
          <div key={filter.id} className="border-ui-border-base flex items-center gap-1 rounded-md border px-2 py-1">
            {filter.content}
            <IconButton
              type="button"
              variant="transparent"
              size="2xsmall"
              aria-label={`Remove ${filter.label} filter`}
              onClick={() => {
                change(active.filter((id) => id !== filter.id));
                onRemove?.(filter.id);
              }}
            >
              <XMarkMini />
            </IconButton>
          </div>
        ))}
      {available.length > 0 && (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary" size="small">
              Add filter
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            {available.map((filter) => (
              <DropdownMenu.Item key={filter.id} disabled={filter.disabled} onSelect={() => change([...active, filter.id])}>
                {filter.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
      {active.length > 0 && (
        <Button
          variant="transparent"
          size="small"
          onClick={() => {
            change([]);
            if (onClear) onClear();
            else active.forEach((id) => onRemove?.(id));
          }}
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
