'use client';
import { Button, Drawer, Heading, Input, Text } from '@cms/ui';
import { useId, useState } from 'react';
export interface SaveViewDialogProps {
  open?: boolean;
  onClose: () => void;
  initialName?: string;
  onSave: (name: string) => void | Promise<void>;
  title?: string;
}
export function SaveViewDialog({ open = true, onClose, initialName = '', onSave, title = 'Save view' }: SaveViewDialogProps) {
  const id = useId();
  const [name, setName] = useState(initialName);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  return (
    <Drawer
      open={open}
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title asChild>
            <Heading>{title}</Heading>
          </Drawer.Title>
          <Drawer.Description className="sr-only">Choose a name for this table configuration.</Drawer.Description>
        </Drawer.Header>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (!name.trim() || pending) return;
            setPending(true);
            setError(false);
            try {
              await onSave(name.trim());
              onClose();
            } catch {
              setError(true);
            } finally {
              setPending(false);
            }
          }}
          className="flex flex-1 flex-col"
        >
          <Drawer.Body>
            <label htmlFor={id} className="mb-2 block text-sm font-medium">
              Name
            </label>
            <Input id={id} value={name} maxLength={100} onChange={(event) => setName(event.target.value)} required disabled={pending} autoFocus />
            {error && (
              <Text role="alert" size="small" className="text-ui-fg-error mt-2">
                Unable to save this view. Please try again.
              </Text>
            )}
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" isLoading={pending} disabled={!name.trim()}>
                Save view
              </Button>
            </div>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  );
}
