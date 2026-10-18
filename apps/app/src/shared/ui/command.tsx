import { Autocomplete } from '@base-ui/react/autocomplete';
import { clx, Input } from '@cms/ui';
import { matchSorter } from 'match-sorter';
import { Children, type ComponentProps, createContext, isValidElement, type ReactNode, useContext, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui/dialog';

interface ItemProps extends Omit<ComponentProps<'div'>, 'onSelect'> {
  value?: string;
  keywords?: string[];
  disabled?: boolean;
  onSelect?: (value: string) => void;
}
interface InputProps extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> {
  value?: string;
  onValueChange?: (value: string) => void;
}
const Context = createContext({ query: '', shouldFilter: true });
function text(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) =>
      typeof child === 'string' || typeof child === 'number'
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? text(child.props.children)
          : '',
    )
    .join(' ');
}
function matches(props: ItemProps, query: string) {
  if (!query.trim()) return true;
  return (
    matchSorter([{ value: props.value ?? '', label: text(props.children), keywords: props.keywords ?? [] }], query.trim(), {
      keys: ['value', 'label', 'keywords'],
    }).length > 0
  );
}
function entries(children: ReactNode, query: string, filter: boolean): string[] {
  const result: string[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement<ItemProps>(child)) return;
    if (child.type === CommandItem) {
      if (!filter || matches(child.props, query)) result.push(child.props.value ?? text(child.props.children));
    } else if (child.props.children) result.push(...entries(child.props.children, query, filter));
  });
  return result;
}
function inputProps(children: ReactNode): InputProps | undefined {
  let result: InputProps | undefined;
  Children.forEach(children, (child) => {
    if (!isValidElement<InputProps>(child)) return;
    if (child.type === CommandInput) result = child.props;
    else if (child.props.children) result = inputProps(child.props.children) ?? result;
  });
  return result;
}
export function Command({
  children,
  shouldFilter = true,
  className,
  loop = false,
}: {
  children?: ReactNode;
  shouldFilter?: boolean;
  className?: string;
  loop?: boolean;
}) {
  const [internal, setQuery] = useState('');
  const input = inputProps(children);
  const query = input?.value ?? internal;
  const values = entries(children, query, shouldFilter);
  return (
    <Context.Provider value={{ query, shouldFilter }}>
      <Autocomplete.Root
        inline
        open
        mode="none"
        items={values}
        filter={null}
        autoHighlight="always"
        loopFocus={loop}
        keepHighlight
        value={query}
        onValueChange={(value, details) => {
          if (details.reason !== 'input-change' && details.reason !== 'input-clear') return;
          setQuery(value);
          input?.onValueChange?.(value);
        }}
      >
        <div data-slot="command" className={clx('flex min-h-0 flex-col bg-ui-bg-base text-ui-fg-base', className)}>
          {children}
        </div>
      </Autocomplete.Root>
    </Context.Provider>
  );
}
export function CommandDialog({
  children,
  title = 'Search',
  description = 'Search pages and commands',
  ...props
}: ComponentProps<typeof Dialog> & { title?: string; description?: string }) {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0" showCloseButton={false}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}
export function CommandInput({ onValueChange: _onValueChange, value: _value, className, ...props }: InputProps) {
  return (
    <div className="border-b border-ui-border-base p-3">
      <Autocomplete.Input
        aria-label={props['aria-label'] ?? props.placeholder ?? 'Search'}
        render={<Input {...props} data-slot="command-input" className={className} wrapperClassName="w-full" />}
      />
    </div>
  );
}
export function CommandList({ className, ...props }: ComponentProps<typeof Autocomplete.List>) {
  return <Autocomplete.List {...props} data-slot="command-list" className={clx('max-h-80 overflow-y-auto p-1.5', className)} />;
}
export function CommandEmpty({ className, ...props }: ComponentProps<typeof Autocomplete.Empty>) {
  return <Autocomplete.Empty {...props} data-slot="command-empty" className={clx('p-8 text-center text-sm text-ui-fg-muted', className)} />;
}
export function CommandGroup({ heading, children, className }: ComponentProps<'div'> & { heading?: ReactNode }) {
  const { query, shouldFilter } = useContext(Context);
  if (query && shouldFilter && !entries(children, query, shouldFilter).length) return null;
  return (
    <Autocomplete.Group className={clx('py-1', className)}>
      {heading && <Autocomplete.GroupLabel className="px-2 py-1.5 text-xs font-medium text-ui-fg-muted">{heading}</Autocomplete.GroupLabel>}
      {children}
    </Autocomplete.Group>
  );
}
export function CommandItem({ value, keywords: _keywords, disabled, onSelect, className, ...props }: ItemProps) {
  const { query, shouldFilter } = useContext(Context);
  if (shouldFilter && !matches({ ...props, value, keywords: _keywords }, query)) return null;
  return (
    <Autocomplete.Item
      {...props}
      data-slot="command-item"
      value={value ?? text(props.children)}
      disabled={disabled}
      onClick={() => {
        if (!disabled) onSelect?.(value ?? text(props.children));
      }}
      className={clx(
        'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-ui-bg-subtle-hover data-[disabled]:opacity-50',
        className,
      )}
    />
  );
}
