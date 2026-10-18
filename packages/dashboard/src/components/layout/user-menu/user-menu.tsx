'use client';
import { Avatar, DropdownMenu, Text } from '@cms/ui';
import { type ReactNode, useState } from 'react';
import { useDocumentDirection } from '../../../hooks/use-document-direction';
import { Link } from '../../../routing';
export interface DashboardUser {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string | null;
}
export interface UserMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onSelect?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}
export interface UserMenuProps {
  user: DashboardUser;
  items?: UserMenuItem[];
  onSignOut?: () => void | Promise<void>;
  trigger?: ReactNode;
  label?: string;
}
export function UserMenu({ user, items = [], onSignOut, trigger, label = 'User menu' }: UserMenuProps) {
  const direction = useDocumentDirection();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  return (
    <div>
      <DropdownMenu dir={direction}>
        <DropdownMenu.Trigger asChild>
          {trigger ?? (
            <button
              type="button"
              aria-label={label}
              className="hover:bg-ui-bg-subtle-hover focus-visible:shadow-borders-focus flex w-full items-center gap-2 rounded-md p-2 text-start outline-none"
            >
              <Avatar src={user.avatar ?? undefined} fallback={(user.name || user.email || '?').slice(0, 1).toUpperCase()} size="small" />
              <span className="min-w-0">
                <Text size="small" weight="plus" className="truncate">
                  {user.name || user.email}
                </Text>
                {user.email && (
                  <Text size="xsmall" className="text-ui-fg-subtle truncate">
                    {user.email}
                  </Text>
                )}
              </span>
            </button>
          )}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="start" className="min-w-60">
          {items.map((item) =>
            item.href ? (
              <DropdownMenu.Item key={item.id} disabled={item.disabled} asChild>
                <Link to={item.href}>
                  {item.icon}
                  {item.label}
                </Link>
              </DropdownMenu.Item>
            ) : (
              <DropdownMenu.Item
                key={item.id}
                disabled={item.disabled}
                onSelect={item.onSelect}
                className={item.destructive ? 'text-ui-fg-error' : undefined}
              >
                {item.icon}
                {item.label}
              </DropdownMenu.Item>
            ),
          )}
          {onSignOut && (
            <>
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                disabled={pending}
                onSelect={(event) => {
                  event.preventDefault();
                  if (pending) return;
                  setPending(true);
                  setError(false);
                  Promise.resolve()
                    .then(onSignOut)
                    .catch(() => setError(true))
                    .finally(() => setPending(false));
                }}
              >
                Sign out
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu>
      {error && (
        <Text role="alert" size="small" className="text-ui-fg-error">
          Unable to sign out. Please try again.
        </Text>
      )}
    </div>
  );
}
