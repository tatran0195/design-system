'use client';
import { ChevronDownMini } from '@cms/icons';
import { Button, DropdownMenu, Prompt, Text } from '@cms/ui';
import { useRef, useState } from 'react';
import { useDocumentDirection } from '../../../hooks/use-document-direction';
export interface SaveViewDropdownProps {
  isDefaultView: boolean;
  currentViewId?: string | null;
  currentViewName?: string | null;
  onSaveAsDefault?: () => void | Promise<void>;
  onUpdateExisting?: () => void | Promise<void>;
  onSaveAsNew?: () => void | Promise<void>;
  disabled?: boolean;
  label?: string;
  onError?: (error: unknown) => void;
}
/** Host-owned writes. Confirmation stays in the caller's theme/direction/provider tree. */
export function SaveViewDropdown({
  isDefaultView,
  currentViewName,
  onSaveAsDefault,
  onUpdateExisting,
  onSaveAsNew,
  disabled,
  label = 'Save view',
  onError,
}: SaveViewDropdownProps) {
  const direction = useDocumentDirection();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState(false);
  const update = isDefaultView ? onSaveAsDefault : onUpdateExisting;
  const run = async (callback?: () => void | Promise<void>) => {
    if (!callback || busy.current) return;
    busy.current = true;
    setPending(true);
    setError(false);
    try {
      await callback();
      setConfirming(false);
    } catch (error) {
      setError(true);
      onError?.(error);
    } finally {
      busy.current = false;
      setPending(false);
    }
  };
  const title = isDefaultView ? 'Update default view' : `Update ${currentViewName || 'saved view'}`;
  return (
    <div>
      <DropdownMenu dir={direction}>
        <DropdownMenu.Trigger asChild>
          <Button type="button" size="small" variant="secondary" disabled={disabled || pending || (!update && !onSaveAsNew)}>
            {label}
            <ChevronDownMini />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          {update && (
            <DropdownMenu.Item
              onSelect={() => {
                setError(false);
                setConfirming(true);
              }}
            >
              {title}
            </DropdownMenu.Item>
          )}
          {onSaveAsNew && <DropdownMenu.Item onSelect={() => void run(onSaveAsNew)}>Save as new view</DropdownMenu.Item>}
        </DropdownMenu.Content>
      </DropdownMenu>
      <Prompt
        open={confirming}
        onOpenChange={(open) => {
          if (!busy.current) setConfirming(open);
        }}
        variant="confirmation"
      >
        <Prompt.Content dir={direction}>
          <Prompt.Header>
            <Prompt.Title>{title}</Prompt.Title>
            <Prompt.Description>Replace this view with the current table configuration?</Prompt.Description>
          </Prompt.Header>
          {error && (
            <Text role="alert" size="small" className="text-ui-fg-error px-6">
              Unable to save this view. Please try again.
            </Text>
          )}
          <Prompt.Footer>
            <Prompt.Cancel type="button" disabled={pending}>
              Cancel
            </Prompt.Cancel>
            <Prompt.Action
              type="button"
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                void run(update);
              }}
            >
              {pending ? 'Saving…' : 'Update view'}
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
      {error && !confirming && (
        <Text role="alert" size="small" className="text-ui-fg-error">
          Unable to save this view. Please try again.
        </Text>
      )}
    </div>
  );
}
