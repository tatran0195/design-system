'use client';
import { Button, DropdownMenu } from '@cms/ui';
import type { ViewPillsProps } from './view-pills';
export type ViewSelectorProps = ViewPillsProps;
export function ViewSelector({ views, activeId, onSelect, onCreate, defaultLabel = 'Default', disabled }: ViewSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button size="small" variant="secondary" disabled={disabled}>
          {views.find((view) => view.id === activeId)?.name ?? defaultLabel}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.RadioGroup value={activeId ?? ''} onValueChange={(value) => onSelect(value || null)}>
          <DropdownMenu.RadioItem value="">{defaultLabel}</DropdownMenu.RadioItem>
          {views.map((view) => (
            <DropdownMenu.RadioItem value={view.id} key={view.id}>
              {view.name}
            </DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
        {onCreate && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onSelect={onCreate}>Save view</DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
