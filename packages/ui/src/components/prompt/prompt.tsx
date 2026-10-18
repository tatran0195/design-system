'use client';

import * as React from 'react';
import { Button } from '@/components/button';
import { Heading } from '@/components/heading';
import { AlertDialog as AlertDialogPrimitive } from '@/primitives/dialog';
import { clx } from '@/utils/clx';
import { UiLayer, uiLayerBackdrop } from '@/utils/layers';

type PromptVariant = 'danger' | 'confirmation';

const PromptContext = React.createContext<{ variant: PromptVariant }>({
  variant: 'danger',
});

const usePromptContext = () => {
  const context = React.useContext(PromptContext);
  if (!context) {
    throw new Error('usePromptContext must be used within a PromptProvider');
  }
  return context;
};

type PromptProviderProps = React.PropsWithChildren<{
  variant: PromptVariant;
}>;

const PromptProvider = ({ variant, children }: PromptProviderProps) => (
  <PromptContext.Provider value={{ variant }}>{children}</PromptContext.Provider>
);

/**
 * This component is based on the [Base UI Alert Dialog](https://base-ui.com/react/components/alert-dialog) primitives.
 */
const Root = ({
  /**
   * The variant of the prompt.
   */
  variant = 'danger',
  ...props
}: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root> & {
  variant?: PromptVariant;
}) => (
  <PromptProvider variant={variant}>
    <AlertDialogPrimitive.Root {...props} />
  </PromptProvider>
);
Root.displayName = 'Prompt';

const Trigger = AlertDialogPrimitive.Trigger;
Trigger.displayName = 'Prompt.Trigger';

const Portal = (props: AlertDialogPrimitive.AlertDialogPortalProps) => <AlertDialogPrimitive.AlertDialogPortal {...props} />;
Portal.displayName = 'Prompt.Portal';

const Overlay = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={clx(
      'bg-ui-bg-overlay fixed inset-0 z-ui-prompt-backdrop',
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
Overlay.displayName = 'Prompt.Overlay';

const Title = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Title>,
  Omit<React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>, 'asChild'>
>(({ className, children, ...props }, ref) => (
  <AlertDialogPrimitive.Title ref={ref} className={clx(className)} {...props} asChild>
    <Heading level="h2" className="text-ui-fg-base">
      {children}
    </Heading>
  </AlertDialogPrimitive.Title>
));
Title.displayName = 'Prompt.Title';

const Content = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <UiLayer kind="prompt" zIndex={props.style?.zIndex}>
    {(layer) => (
      <Portal>
        <Overlay style={{ zIndex: uiLayerBackdrop(layer) }} data-ui-layer="prompt-backdrop" />
        <AlertDialogPrimitive.Content
          ref={ref}
          className={clx(
            'bg-ui-bg-base shadow-elevation-flyout fixed left-[50%] top-[50%] flex w-full max-w-[400px] translate-x-[-50%] translate-y-[-50%] flex-col rounded-lg border focus-visible:outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-200',
            className,
          )}
          {...props}
          style={{ ...props.style, zIndex: layer }}
          data-ui-layer="prompt"
        />
      </Portal>
    )}
  </UiLayer>
));
Content.displayName = 'Prompt.Content';

const Description = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description ref={ref} className={clx('text-ui-fg-subtle txt-compact-medium', className)} {...props} />
));
Description.displayName = 'Prompt.Description';

const Action = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Action>,
  Omit<React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>, 'asChild'>
>(({ className, children, type, ...props }, ref) => {
  const { variant } = usePromptContext();

  return (
    <AlertDialogPrimitive.Action ref={ref} className={className} {...props} asChild>
      <Button size="small" type={type} variant={variant === 'danger' ? 'danger' : 'primary'}>
        {children}
      </Button>
    </AlertDialogPrimitive.Action>
  );
});
Action.displayName = 'Prompt.Action';

const Cancel = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Cancel>,
  Omit<React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>, 'asChild'>
>(({ className, children, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel ref={ref} className={clx(className)} {...props} asChild>
    <Button size="small" variant="secondary">
      {children}
    </Button>
  </AlertDialogPrimitive.Cancel>
));
Cancel.displayName = 'Prompt.Cancel';

/**
 * This component is based on the `div` element and supports all of its props
 */
const Header = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clx('flex flex-col gap-y-1 px-6 pt-6', className)} {...props} />
);
Header.displayName = 'Prompt.Header';

/**
 * This component is based on the `div` element and supports all of its props
 */
const Footer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clx('flex items-center justify-end gap-x-2 p-6', className)} {...props} />
);
Footer.displayName = 'Prompt.Footer';

const Prompt = Object.assign(Root, {
  Trigger,
  Content,
  Title,
  Description,
  Action,
  Cancel,
  Header,
  Footer,
});

export { Prompt };
