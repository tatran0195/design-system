import { clx, Drawer } from '@cms/ui';
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

type StackedDrawerProps = PropsWithChildren<{
  /**
   * A unique identifier for the modal. This is used to differentiate stacked modals,
   * when multiple stacked modals are registered to the same parent modal.
   */
  id: string;
}>;

/**
 * A stacked modal that can be rendered above a parent modal.
 */
export const Root = ({ id, children }: StackedDrawerProps) => {
  const { register, unregister, getIsOpen, setIsOpen } = useStackedModal();

  useEffect(() => {
    register(id);

    return () => unregister(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, register, unregister]);

  return (
    <Drawer open={getIsOpen(id)} onOpenChange={(open) => setIsOpen(id, open)}>
      {children}
    </Drawer>
  );
};

const Close = Drawer.Close;

const Header = Drawer.Header;

const Body = Drawer.Body;

const Trigger = Drawer.Trigger;

const Footer = Drawer.Footer;

const Title = Drawer.Title;

const Description = Drawer.Description;

export type StackedDrawerContentProps = ComponentPropsWithoutRef<typeof Drawer.Content>;

const Content: ForwardRefExoticComponent<PropsWithoutRef<StackedDrawerContentProps> & RefAttributes<HTMLDivElement>> = forwardRef<
  HTMLDivElement,
  StackedDrawerContentProps
>(({ className, ...props }, ref) => (
  <Drawer.Content
    ref={ref}
    className={clx(className)}
    overlayProps={{
      className: 'bg-transparent',
    }}
    {...props}
  />
));

type StackedDrawerComponent = typeof Root & {
  Close: typeof Drawer.Close;
  Header: typeof Drawer.Header;
  Body: typeof Drawer.Body;
  Content: typeof Content;
  Trigger: typeof Drawer.Trigger;
  Footer: typeof Drawer.Footer;
  Description: typeof Drawer.Description;
  Title: typeof Drawer.Title;
};

export const StackedDrawer: StackedDrawerComponent = Object.assign(Root, {
  Close,
  Header,
  Body,
  Content,
  Trigger,
  Footer,
  Description,
  Title,
});
