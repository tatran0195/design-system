import { clx, FocusModal } from '@cms/ui';
import {
  type ComponentPropsWithoutRef,
  type ForwardRefExoticComponent,
  forwardRef,
  type PropsWithChildren,
  type PropsWithoutRef,
  type RefAttributes,
  useEffect,
} from 'react';
import { useStackedModal } from '../stacked-modal-provider';

type StackedFocusModalProps = PropsWithChildren<{
  /**
   * A unique identifier for the modal. This is used to differentiate stacked modals,
   * when multiple stacked modals are registered to the same parent modal.
   */
  id: string;
  /**
   * An optional callback that is called when the modal is opened or closed.
   */
  onOpenChangeCallback?: (open: boolean) => void;
}>;

/**
 * A stacked modal that can be rendered above a parent modal.
 */
export const Root = ({ id, onOpenChangeCallback, children }: StackedFocusModalProps) => {
  const { register, unregister, getIsOpen, setIsOpen } = useStackedModal();

  useEffect(() => {
    register(id);

    return () => unregister(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, register, unregister]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(id, open);
    onOpenChangeCallback?.(open);
  };

  return (
    <FocusModal open={getIsOpen(id)} onOpenChange={handleOpenChange}>
      {children}
    </FocusModal>
  );
};

const Close = FocusModal.Close;

const Header = FocusModal.Header;

const Body = FocusModal.Body;

const Trigger = FocusModal.Trigger;

const Footer = FocusModal.Footer;

const Title = FocusModal.Title;

const Description = FocusModal.Description;

export type StackedFocusModalContentProps = ComponentPropsWithoutRef<typeof FocusModal.Content>;

const Content: ForwardRefExoticComponent<PropsWithoutRef<StackedFocusModalContentProps> & RefAttributes<HTMLDivElement>> = forwardRef<
  HTMLDivElement,
  StackedFocusModalContentProps
>(({ className, ...props }, ref) => (
  <FocusModal.Content
    ref={ref}
    className={clx('!top-6', className)}
    overlayProps={{
      className: 'bg-transparent',
    }}
    {...props}
  />
));

type StackedFocusModalComponent = typeof Root & {
  Close: typeof FocusModal.Close;
  Header: typeof FocusModal.Header;
  Body: typeof FocusModal.Body;
  Content: typeof Content;
  Trigger: typeof FocusModal.Trigger;
  Footer: typeof FocusModal.Footer;
  Description: typeof FocusModal.Description;
  Title: typeof FocusModal.Title;
};

export const StackedFocusModal: StackedFocusModalComponent = Object.assign(Root, {
  Close,
  Header,
  Body,
  Content,
  Trigger,
  Footer,
  Description,
  Title,
});
