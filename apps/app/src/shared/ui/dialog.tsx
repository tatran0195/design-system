import { clx, FocusModal } from '@cms/ui';
import { X } from 'lucide-react';
import { type ComponentProps, forwardRef } from 'react';
export const Dialog = FocusModal;
export const DialogTrigger = FocusModal.Trigger;
export const DialogClose = FocusModal.Close;
export function DialogTitle(props: ComponentProps<typeof FocusModal.Title>) {
  return <FocusModal.Title {...props} data-slot="dialog-title" />;
}
export const DialogDescription = FocusModal.Description;
export const DialogContent = forwardRef<HTMLDivElement, ComponentProps<typeof FocusModal.Content> & { showCloseButton?: boolean }>(
  function DialogContent({ children, className, showCloseButton = true, ...props }, ref) {
    return (
      <FocusModal.Content
        {...props}
        data-slot="dialog-content"
        ref={ref}
        className={clx(
          'inset-auto h-auto start-1/2 top-1/2 max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-6 rtl:translate-x-1/2',
          className,
        )}
      >
        {children}
        {showCloseButton && (
          <FocusModal.Close
            className="absolute end-3 top-3 rounded-md p-1 text-ui-fg-muted outline-none hover:bg-ui-bg-subtle focus-visible:shadow-borders-focus"
            aria-label="Close"
          >
            <X className="size-4" />
          </FocusModal.Close>
        )}
      </FocusModal.Content>
    );
  },
);
export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={clx('mb-4 flex flex-col gap-1.5 pe-5 text-start', className)} />;
}
export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={clx('mt-5 flex flex-wrap items-center justify-end gap-2', className)} />;
}
