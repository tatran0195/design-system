'use client';
import { BellAlert, BellAlertDone } from '@cms/icons';
import { Button, Drawer, Heading, IconButton, Text } from '@cms/ui';
import { type ReactNode, useState } from 'react';
import { useDate } from '../../../hooks/use-date';
export interface DashboardNotification {
  id: string;
  title: string;
  description?: string;
  createdAt?: string | Date;
  read?: boolean;
  content?: ReactNode;
}
export interface NotificationsProps {
  items: DashboardNotification[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onMarkRead?: (ids: string[]) => void | Promise<void>;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  title?: string;
  empty?: ReactNode;
}
export function Notifications({
  items,
  open: controlled,
  onOpenChange,
  onMarkRead,
  onLoadMore,
  hasMore,
  loading,
  title = 'Notifications',
  empty = 'No notifications yet.',
}: NotificationsProps) {
  const [internal, setInternal] = useState(false);
  const [error, setError] = useState(false);
  const { getRelativeDate } = useDate();
  const unread = items.filter((item) => !item.read);
  const open = controlled ?? internal;
  const change = (next: boolean) => {
    setInternal(next);
    onOpenChange?.(next);
    if (next && onMarkRead && unread.length) {
      setError(false);
      Promise.resolve()
        .then(() => onMarkRead(unread.map((item) => item.id)))
        .catch(() => setError(true));
    }
  };
  return (
    <Drawer open={open} onOpenChange={change}>
      <Drawer.Trigger asChild>
        <IconButton variant="transparent" aria-label={unread.length ? `${title}, ${unread.length} unread` : title}>
          {unread.length ? <BellAlertDone /> : <BellAlert />}
        </IconButton>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title asChild>
            <Heading>{title}</Heading>
          </Drawer.Title>
          <Drawer.Description className="sr-only">Recent updates and activity.</Drawer.Description>
        </Drawer.Header>
        <Drawer.Body className="overflow-y-auto px-0">
          {error && (
            <Text role="alert" className="text-ui-fg-error px-6">
              Unable to mark notifications as read.
            </Text>
          )}
          {items.length ? (
            <ul className="divide-ui-border-base divide-y">
              {items.map((item) => (
                <li key={item.id} className="px-6 py-4">
                  <Text weight={item.read ? 'regular' : 'plus'}>
                    {item.title}
                    {!item.read && <span className="sr-only"> (unread)</span>}
                  </Text>
                  {item.description && (
                    <Text size="small" className="text-ui-fg-subtle mt-1">
                      {item.description}
                    </Text>
                  )}
                  {item.content}
                  {item.createdAt && (
                    <Text size="xsmall" className="text-ui-fg-muted mt-2">
                      {getRelativeDate(item.createdAt)}
                    </Text>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div role="status" className="text-ui-fg-subtle p-8 text-center">
              {loading ? 'Loading…' : empty}
            </div>
          )}
          {hasMore && (
            <div className="p-4">
              <Button variant="secondary" onClick={onLoadMore} isLoading={loading}>
                Load more
              </Button>
            </div>
          )}
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
}
