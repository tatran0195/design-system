'use client';
import { Avatar, Text } from '@cms/ui';
import type { ReactNode } from 'react';
import { Link } from '../../../routing';
export interface UserLinkProps {
  id?: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  avatar?: string | null;
  href?: string;
  renderLink?: (children: ReactNode) => ReactNode;
}
export function UserLink({ name, first_name, last_name, email, avatar, href, renderLink }: UserLinkProps) {
  const label = name || [first_name, last_name].filter(Boolean).join(' ') || email || 'Unknown user';
  const content = (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar src={avatar ?? undefined} size="2xsmall" fallback={label.slice(0, 1).toUpperCase()} />
      <Text size="small" leading="compact" className="truncate">
        {label}
      </Text>
    </span>
  );
  if (renderLink) return <>{renderLink(content)}</>;
  return href ? (
    <Link to={href} className="hover:text-ui-fg-subtle focus-visible:shadow-borders-focus inline-flex min-w-0 rounded outline-none">
      {content}
    </Link>
  ) : (
    content
  );
}
/** Caller resolves the actor; never infers APIs or routes from ID prefixes. */
export function By({ actor, fallback = null }: { actor?: UserLinkProps | null; fallback?: ReactNode }) {
  return actor ? <UserLink {...actor} /> : <>{fallback}</>;
}
