import { Select as BaseSelect } from '@base-ui/react/select';
import { clx, UiLayer } from '@cms/ui';
import { Check, ChevronDown } from 'lucide-react';
import { Children, type ComponentProps, createContext, forwardRef, isValidElement, type ReactNode, useContext, useMemo } from 'react';

const Size = createContext<'base' | 'small'>('base');
function optionLabels(children: ReactNode, result: Record<string, ReactNode> = {}) {
  Children.forEach(children, (child) => {
    if (!isValidElement<{ value?: unknown; children?: ReactNode }>(child)) return;
    if (typeof child.props.value === 'string' || typeof child.props.value === 'number') result[String(child.props.value)] = child.props.children;
    else optionLabels(child.props.children, result);
  });
  return result;
}

/** Public Base UI owns selection, multiple values, focus and keyboard behavior.
 * The app retains the CMS control sizing, semantic tokens and contextual layers. */
export function Select<Value, Multiple extends boolean = false>({
  children,
  items,
  size = 'base',
  ...props
}: BaseSelect.Root.Props<Value, Multiple> & { size?: 'base' | 'small' }) {
  const labels = useMemo(() => items ?? optionLabels(children), [items, children]);
  return (
    <Size.Provider value={size}>
      <BaseSelect.Root<Value, Multiple> {...props} items={labels}>
        {children}
      </BaseSelect.Root>
    </Size.Provider>
  );
}

type TriggerProps = Omit<ComponentProps<typeof BaseSelect.Trigger>, 'className'> & { className?: string; size?: 'default' | 'sm' };
export const SelectTrigger = forwardRef<HTMLButtonElement, TriggerProps>(function SelectTrigger({ children, className, size, ...props }, ref) {
  const rootSize = useContext(Size);
  return (
    <BaseSelect.Trigger
      {...props}
      data-slot="select-trigger"
      ref={ref}
      className={clx(
        'ui-control-text flex w-full items-center justify-between gap-2 rounded-md bg-ui-bg-field px-2 text-ui-fg-base shadow-buttons-neutral outline-none transition-fg hover:bg-ui-bg-field-hover focus-visible:shadow-borders-interactive-with-active data-[popup-open]:shadow-borders-interactive-with-active disabled:!bg-ui-bg-disabled disabled:!text-ui-fg-disabled data-[placeholder]:text-ui-fg-muted',
        size === 'sm' || rootSize === 'small' ? 'h-7 txt-compact-small' : 'h-8 txt-compact-small',
        className,
      )}
    >
      {children}
      <BaseSelect.Icon>
        <ChevronDown className="size-3.5 shrink-0 text-ui-fg-muted" />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
});

export function SelectValue(props: ComponentProps<typeof BaseSelect.Value>) {
  return <BaseSelect.Value {...props} data-slot="select-value" />;
}
export const SelectGroup = BaseSelect.Group;
export const SelectLabel = forwardRef<HTMLDivElement, Omit<ComponentProps<typeof BaseSelect.GroupLabel>, 'className'> & { className?: string }>(
  function SelectLabel({ className, ...props }, ref) {
    return <BaseSelect.GroupLabel {...props} ref={ref} className={clx('px-2 py-1.5 txt-compact-xsmall-plus text-ui-fg-muted', className)} />;
  },
);

type ContentProps = Omit<ComponentProps<typeof BaseSelect.Popup>, 'className' | 'style'> &
  Pick<ComponentProps<typeof BaseSelect.Positioner>, 'side' | 'sideOffset' | 'align' | 'alignOffset'> & {
    className?: string;
    style?: import('react').CSSProperties;
  };
export const SelectContent = forwardRef<HTMLDivElement, ContentProps>(function SelectContent(
  { children, className, side, sideOffset = 4, align = 'start', alignOffset, style, ...props },
  ref,
) {
  return (
    <UiLayer kind="popover" zIndex={style?.zIndex}>
      {(layer) => (
        <BaseSelect.Portal>
          <BaseSelect.Positioner
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
            alignItemWithTrigger={false}
            style={{ zIndex: layer }}
          >
            <BaseSelect.Popup
              {...props}
              data-slot="select-content"
              ref={ref}
              style={style}
              data-ui-layer="popover"
              className={clx(
                'relative min-w-[var(--anchor-width)] overflow-hidden rounded-lg bg-ui-bg-component text-ui-fg-base shadow-elevation-flyout outline-none',
                className,
              )}
            >
              <BaseSelect.List className="max-h-[min(320px,var(--available-height))] overflow-y-auto p-1">{children}</BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      )}
    </UiLayer>
  );
});

export const SelectItem = forwardRef<HTMLDivElement, Omit<ComponentProps<typeof BaseSelect.Item>, 'className'> & { className?: string }>(
  function SelectItem({ children, className, ...props }, ref) {
    return (
      <BaseSelect.Item
        {...props}
        data-slot="select-item"
        ref={ref}
        className={clx(
          'relative flex min-h-8 cursor-default select-none items-center gap-2 rounded-md py-1.5 pe-7 ps-2 txt-compact-small text-ui-fg-base outline-none data-[highlighted]:bg-ui-bg-component-hover data-[disabled]:text-ui-fg-disabled',
          className,
        )}
      >
        <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
        <BaseSelect.ItemIndicator className="absolute end-2 flex items-center">
          <Check className="size-3.5" />
        </BaseSelect.ItemIndicator>
      </BaseSelect.Item>
    );
  },
);
