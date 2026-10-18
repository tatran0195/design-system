'use client';
import { Button, DropdownMenu } from '@cms/ui';
export interface CustomizerMenuProps {
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  onReset?: () => void;
  label?: string;
  disabled?: boolean;
}
export function CustomizerMenu({ editing, onEditingChange, onReset, label = 'Customize layout', disabled }: CustomizerMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" size="small" disabled={disabled}>
          {label}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item onSelect={() => onEditingChange(!editing)}>{editing ? 'Done editing' : 'Edit layout'}</DropdownMenu.Item>
        {onReset && <DropdownMenu.Item onSelect={onReset}>Reset layout</DropdownMenu.Item>}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
export const LayoutCustomizerMenu = CustomizerMenu;
