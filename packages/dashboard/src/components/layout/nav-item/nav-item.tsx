'use client';

import { ChevronDownMini } from '@cms/icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger, clx } from '@cms/ui';
import { type ReactNode, useEffect, useState } from 'react';
import { NavLink, useLocation } from '../../../routing';
export interface INavItem {
  id?: string;
  icon?: ReactNode;
  label: string;
  to: string;
  items?: INavItem[];
  disabled?: boolean;
  badge?: ReactNode;
}
export interface NavItemProps extends INavItem {
  className?: string;
  onNavigate?: () => void;
}
const base =
  'text-ui-fg-subtle hover:bg-ui-bg-subtle-hover focus-visible:shadow-borders-focus flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none';
export function NavItem({ label, to, icon, items, disabled, badge, className, onNavigate }: NavItemProps) {
  const { pathname } = useLocation();
  const active = [to, ...(items?.map((item) => item.to) ?? [])].some(
    (path) => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`)),
  );
  const [open, setOpen] = useState(active);
  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);
  const content = (
    <>
      <span className="shrink-0" aria-hidden>
        {icon}
      </span>
      <span className="truncate">{label}</span>
      {badge && <span className="ms-auto">{badge}</span>}
    </>
  );
  return (
    <Collapsible open={open} onOpenChange={setOpen} className={className}>
      <div className="flex items-center gap-1">
        {disabled ? (
          <span className={clx(base, 'text-ui-fg-disabled')} aria-disabled="true">
            {content}
          </span>
        ) : (
          <NavLink
            to={to}
            end={!items?.length}
            onClick={onNavigate}
            className={({ isActive }) => clx(base, isActive && 'bg-ui-bg-base text-ui-fg-base shadow-elevation-card-rest')}
          >
            {content}
          </NavLink>
        )}
        {!!items?.length && (
          <CollapsibleTrigger
            aria-label={`${open ? 'Collapse' : 'Expand'} ${label}`}
            className="text-ui-fg-subtle hover:bg-ui-bg-subtle-hover focus-visible:shadow-borders-focus flex size-8 shrink-0 items-center justify-center rounded outline-none"
          >
            <ChevronDownMini className={clx('transition-transform', open && 'rotate-180')} />
          </CollapsibleTrigger>
        )}
      </div>
      {!!items?.length && (
        <CollapsibleContent>
          <div className="border-ui-border-base ms-4 flex flex-col gap-1 border-s ps-2 pt-1">
            {items.map((item) => (
              <NavItem key={item.id ?? item.to} {...item} onNavigate={onNavigate} />
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
export function Navigation({ items, label = 'Navigation', onNavigate }: { items: INavItem[]; label?: string; onNavigate?: () => void }) {
  return (
    <nav aria-label={label} className="flex flex-col gap-1">
      {items.map((item) => (
        <NavItem key={item.id ?? item.to} {...item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}
