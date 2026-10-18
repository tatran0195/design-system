'use client';
import { ArrowUpDown } from '@cms/icons';
import { DropdownMenu, IconButton } from '@cms/ui';
import { useState } from 'react';
import { useDocumentDirection } from '../../../hooks/use-document-direction';
export interface SortState {
  id: string;
  desc: boolean;
}
export interface OrderByProps {
  keys: (string | { value: string; label: string })[];
  value?: SortState | null;
  defaultValue?: SortState | null;
  onChange?: (sort: SortState | null) => void;
  label?: string;
}
export function OrderBy({ keys, value, defaultValue = null, onChange, label = 'Sort records' }: OrderByProps) {
  const [internal, setInternal] = useState(defaultValue);
  const state = value === undefined ? internal : value;
  const direction = useDocumentDirection();
  const change = (next: SortState | null) => {
    setInternal(next);
    onChange?.(next);
  };
  return (
    <DropdownMenu dir={direction}>
      <DropdownMenu.Trigger asChild>
        <IconButton size="small" aria-label={label}>
          <ArrowUpDown />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.RadioGroup value={state?.id ?? ''} onValueChange={(id) => change({ id, desc: state?.desc ?? false })}>
          {keys.map((key) => {
            const option = typeof key === 'string' ? { value: key, label: key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()) } : key;
            return (
              <DropdownMenu.RadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenu.RadioItem>
            );
          })}
        </DropdownMenu.RadioGroup>
        <DropdownMenu.Separator />
        <DropdownMenu.RadioGroup
          value={state?.desc ? 'desc' : 'asc'}
          onValueChange={(direction) => {
            if (state) change({ ...state, desc: direction === 'desc' });
          }}
        >
          <DropdownMenu.RadioItem value="asc" disabled={!state}>
            Ascending
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="desc" disabled={!state}>
            Descending
          </DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
        {state && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onSelect={() => change(null)}>Clear sorting</DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
