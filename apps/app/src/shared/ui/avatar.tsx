import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import { clx } from '@cms/ui';
import type { ComponentProps } from 'react';
export function Avatar({ className, ...props }: ComponentProps<typeof BaseAvatar.Root>) {
  return (
    <BaseAvatar.Root
      {...props}
      className={clx('relative flex size-8 shrink-0 overflow-hidden rounded-full bg-ui-bg-subtle shadow-borders-base', className)}
    />
  );
}
export const AvatarImage = BaseAvatar.Image;
export function AvatarFallback({ className, ...props }: ComponentProps<typeof BaseAvatar.Fallback>) {
  return (
    <BaseAvatar.Fallback {...props} className={clx('flex size-full items-center justify-center text-xs font-medium text-ui-fg-subtle', className)} />
  );
}
