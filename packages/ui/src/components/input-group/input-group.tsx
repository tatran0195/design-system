'use client';

import { cva, type VariantProps } from 'cva';
import * as React from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Textarea } from '@/components/textarea';
import { clx } from '@/utils/clx';

/**
 * Migrated from the nibleaf design system, restyled with cms `ui-*` tokens and
 * adapted to the primary cms Input/Textarea/Button primitives.
 */
const InputGroupDensityContext = React.createContext<'default' | 'compact'>('default');

function InputGroup({ className, density = 'default', ...props }: React.ComponentProps<'div'> & { density?: 'default' | 'compact' }) {
  return (
    <InputGroupDensityContext.Provider value={density}>
      <div
        data-slot="input-group"
        data-density={density}
        role="group"
        className={clx(
          'group/input-group shadow-borders-base relative flex h-(--input-group-height) w-full min-w-0 items-center rounded-md bg-ui-bg-field outline-none transition-[color,box-shadow] [--input-group-height:2rem] data-[density=compact]:[--input-group-height:1.75rem] hover:bg-ui-bg-field-hover has-[[data-slot=input-group-control]:focus-visible]:!shadow-borders-interactive-with-active has-[[data-slot][aria-invalid=true]]:!shadow-borders-error has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto has-[>[data-align=inline-end]]:[&_input]:pe-1.5 has-[>[data-align=inline-start]]:[&_input]:ps-1.5',
          className,
        )}
        {...props}
      />
    </InputGroupDensityContext.Provider>
  );
}

const inputGroupAddonVariants = cva({
  base: "txt-compact-small text-ui-fg-muted flex h-auto cursor-text select-none items-center justify-center gap-2 py-0 font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-sm [&>svg:not([class*='size-'])]:size-4",
  variants: {
    align: {
      'inline-start': 'order-first ps-2 has-[>button]:-ms-1 has-[>kbd]:ms-[-0.15rem]',
      'inline-end': 'order-last pe-2 has-[>button]:-me-1 has-[>kbd]:me-[-0.15rem]',
      'block-start': 'order-first w-full justify-start px-2.5 pt-2 group-has-[input]/input-group:pt-2 [&.border-b]:pb-2',
      'block-end': 'order-last w-full justify-start px-2.5 pb-2 group-has-[input]/input-group:pb-2 [&.border-t]:pt-2',
    },
  },
  defaultVariants: {
    align: 'inline-start',
  },
});

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={clx(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        e.currentTarget.parentElement?.querySelector<HTMLElement>('input, textarea')?.focus();
      }}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva({
  base: 'txt-compact-small flex items-center gap-2 !shadow-none focus-visible:!shadow-borders-interactive-with-focus',
  variants: {
    size: {
      xs: "h-6 gap-1 rounded-sm px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
      sm: 'h-[calc(var(--input-group-height)-2px)] min-h-0',
      'icon-xs': 'size-6 rounded-sm p-0 has-[>svg]:p-0',
      'icon-sm': 'size-[calc(var(--input-group-height)-2px)] p-0 has-[>svg]:p-0',
    },
  },
  defaultVariants: {
    size: 'xs',
  },
});

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size' | 'type'> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: 'button' | 'submit' | 'reset';
  }) {
  return (
    <Button type={type} data-size={size} variant={variant} size="small" className={clx(inputGroupButtonVariants({ size }), className)} {...props} />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={clx(
        "txt-compact-small text-ui-fg-muted flex items-center gap-2 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({ className, wrapperClassName, size, ...props }: React.ComponentProps<typeof Input>) {
  const density = React.useContext(InputGroupDensityContext);
  return (
    <Input
      data-slot="input-group-control"
      size={size ?? (density === 'compact' ? 'small' : 'base')}
      wrapperClassName={clx('h-(--input-group-height) min-w-0 flex-1 self-stretch', wrapperClassName)}
      className={clx(
        'h-full min-h-0 min-w-0 flex-1 rounded-none !bg-transparent !shadow-none ring-0 focus-visible:!shadow-none aria-[invalid=true]:!shadow-none data-[density=compact]:h-full data-[density=compact]:min-h-0',
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={clx(
        'flex-1 resize-none rounded-none !bg-transparent py-2 !shadow-none ring-0 focus-visible:!shadow-none aria-[invalid=true]:!shadow-none',
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea };
