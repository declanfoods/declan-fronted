import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { isAuthenticated } from '../../auth/session';
import { markNotificationsRead, useMarkNotificationsRead, useNotifications } from '../queries';

const timeAgo = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const authenticated = isAuthenticated();
  const notificationsQuery = useNotifications(authenticated);
  const markRead = useMarkNotificationsRead();

  const savedNotifications = authenticated ? notificationsQuery.data ?? [] : [];
  const notifications = markRead.isPending
    ? markNotificationsRead(savedNotifications, markRead.variables)
    : savedNotifications;
  const loading = authenticated && notificationsQuery.isPending;

  useEffect(() => {
    if (!open) return;

    const onPointer = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onDismiss = () => setOpen(false);

    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onDismiss);
    window.addEventListener('scroll', onDismiss, true);

    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onDismiss);
      window.removeEventListener('scroll', onDismiss, true);
    };
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/5"
      >
        <Bell size={22} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-[6.5rem] z-50 flex max-h-[calc(100dvh-8rem)] flex-col rounded-2xl border border-gray-100 bg-white shadow-2xl sm:inset-x-auto sm:right-4 sm:w-96">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h3 className="text-base font-bold text-ink">Notifications</h3>
              <p className="text-xs text-ink-soft">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : 'All caught up ✓'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markRead.mutate(undefined)}
                  disabled={markRead.isPending}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-60"
                >
                  <CheckCheck size={12} /> Mark all
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-ink-soft hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {markRead.isError && (
            <p role="alert" className="px-5 pt-3 text-sm text-red-600">
              {getApiErrorMessage(markRead.error, 'Could not mark notifications as read.')}
            </p>
          )}
          {authenticated && notificationsQuery.isError && (
            <div role="status" className="px-5 pt-3 text-sm text-red-600">
              Could not load notifications.{' '}
              <button
                type="button"
                onClick={() => notificationsQuery.refetch()}
                className="font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* List — takes whatever height is left after the header. */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {loading ? (
              <p className="py-10 text-center text-sm text-ink-soft">
                Loading...
              </p>
            ) : notificationsQuery.isError && notifications.length === 0 ? null : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-5xl">🔔</div>
                <p className="mt-3 text-sm font-semibold text-ink-soft">
                  No notifications yet
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  We'll let you know when something happens
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.read && markRead.mutate(n.id)}
                  disabled={markRead.isPending}
                  className={
                    'flex w-full items-start gap-3 border-b border-gray-100 px-5 py-4 text-left transition-colors last:border-0 ' +
                    (n.read
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-primary/5 hover:bg-primary/10')
                  }
                >
                  {/* Icon or image */}
                  {n.imageUrl ? (
                    <img
                      src={n.imageUrl}
                      alt=""
                      className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={
                        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ' +
                        (n.read ? 'bg-gray-100' : 'bg-primary/20')
                      }
                    >
                      <Bell size={16} className="text-primary" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p
                      className={
                        'text-sm ' +
                        (n.read
                          ? 'font-medium text-ink'
                          : 'font-bold text-ink')
                      }
                    >
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="mt-0.5 text-xs text-ink-soft line-clamp-2">
                        {n.body}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] font-medium text-primary">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  {!n.read && (
                    <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
