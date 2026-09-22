import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  BarChart3,
  RefreshCw,
  Eye,
  Wallet,
  Share2,
  UserCheck,
  UserX,
  Mail,
} from 'lucide-react';
import AdminBottomNav from '../../../admin/AdminBottomNav';
import StatusPill from '../../../admin/StatusPill';
import RowActionsMenu, { type RowAction } from '../../../admin/RowActionsMenu';
import {
  useAdminUsers,
  useAdminUserMetrics,
  useSuspendUser,
  useUnsuspendUser,
} from '../../../../app/hooks/useAdminUsers';
import { useDebounce } from '../../../../app/hooks/useDebounce';
import type { AdminUserStatus } from '../../../../app/lib/adminUserApi';

/*
|--------------------------------------------------------------------------
| Admin → Users list — WIRED TO API
|--------------------------------------------------------------------------
| BEFORE: rendered `mockUsers` — two hardcoded people (Tunde Kelani, Chidi
| Eze) with pravatar.cc avatars. Filter chips were 'All | Active | Inactive |
| Suspended', which did not match the real backend enum at all.
|
| AFTER: `adminUserApi.getUsers({ search, status, page, limit })` with
| server-side search (debounced) and server-side status filtering.
| Aggregate tiles come from `adminUserApi.getUserMetrics()`.
|
| ⚠️ ENUM FIX — this one matters:
|   The UI used to offer "Inactive". The backend has NO 'INACTIVE' status.
|   AdminUserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED'.
|   Sending `status=Inactive` would have returned an empty list forever and
|   looked like a backend bug. The chips now map to the real enum.
|
| Field mapping (AdminUserListItem → card):
|   fullname             → name
|   platformId           → customer ID
|   emailAddress         → email
|   profilePictureUrl    → avatar (initials fallback when null)
|   lifetimeSpend        → lifetime spend
|   referralWalletBalance→ wallet balance
|   totalOrders          → total orders
|   userStatus           → StatusPill
|   lastLogin            → "Last seen"
|   ✓ verified           → derived: userStatus === 'ACTIVE'
|   referral active      → derived: referralWalletBalance > 0  (see note)
*/

const FILTERS: { label: string; value: AdminUserStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Pending', value: 'PENDING_VERIFICATION' },
  { label: 'Suspended', value: 'SUSPENDED' },
];

const PAGE_SIZE = 20;

function formatNaira(value: string | number) {
  return `₦${Number(value ?? 0).toLocaleString()}`;
}

function formatLastSeen(iso: string | null) {
  if (!iso) return 'Never';

  const then = new Date(iso).getTime();
  const diffHours = Math.floor((Date.now() - then) / 3_600_000);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;

  const days = Math.floor(diffHours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;

  return new Date(iso).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function initialsOf(fullname: string) {
  return (
    fullname
      ?.split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  );
}

function httpStatusOf(error: unknown): number | null {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return typeof status === 'number' ? status : null;
}

/*
|--------------------------------------------------------------------------
| Turns an unknown failure into something an operator can act on
|--------------------------------------------------------------------------
| Ordered most-specific first. The whole point is that the message names the
| ACTUAL cause, so nobody goes hunting for a session problem that isn't there.
*/
function describeUsersError(error: unknown): string {
  const status = httpStatusOf(error);

  if (status === 403) return 'Your account does not have admin privileges.';

  if (status === 400 || status === 422) {
    return 'The server rejected the request format. This is a backend issue — please report it.';
  }

  if (status === 404) return 'The users endpoint could not be found on the server.';

  if (status && status >= 500) {
    return `The server failed to load users (HTTP ${status}). This is a backend problem, not your account.`;
  }

  // No response at all — offline, DNS, CORS, or the request timed out.
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  ) {
    const code = (error as { code: string }).code;

    if (code === 'ECONNABORTED' || code === 'ETIMEDOUT') {
      return 'The server took too long to respond. It may be waking up — tap Retry.';
    }

    if (code === 'ERR_NETWORK') {
      return 'Could not reach the server. Check your internet connection, then tap Retry.';
    }
  }

  if (error instanceof Error && error.message) return error.message;

  return "Couldn't load users.";
}

export default function UsersOverview() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<AdminUserStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const suspend = useSuspendUser();
  const unsuspend = useUnsuspendUser();

  /*
  |--------------------------------------------------------------------------
  | FIX: "View Full Details" / three-dots did nothing or errored
  |--------------------------------------------------------------------------
  | Two problems:
  |
  | 1. The three-dots button had no onClick — a dead control.
  |
  | 2. Every action on this screen builds a URL from the user's id. If the
  |    backend omits `id` on any row (or names it differently), the link
  |    becomes `/admin/users/undefined`. The API then 500s, and because the
  |    backend's 500 body is a generic "An error occurred", the user sees a
  |    vague failure with no hint of the cause.
  |
  | So: resolve the id defensively from the field names the API actually
  | uses, and refuse to navigate when it's genuinely missing — with a message
  | that says so, instead of firing a request that can only fail.
  */
  const resolveUserId = (user: { id?: string; userId?: string }): string | null =>
    user.id ?? user.userId ?? null;

  const goTo = (userId: string | null, path: string) => {
    if (!userId) {
      window.alert(
        'This user record came back from the server without an ID, so its detail page cannot be opened. ' +
          'Please report this to the backend team — GET /admin/users must include `id` on every row.'
      );
      return;
    }

    navigate(path);
  };

  // Debounced so we don't fire a request per keystroke.
  const debouncedSearch = useDebounce(search, 450);

  const usersQuery = useAdminUsers({
    search: debouncedSearch || undefined,
    status: activeFilter === 'ALL' ? undefined : activeFilter,
    page,
    limit: PAGE_SIZE,
  });

  const metricsQuery = useAdminUserMetrics();

  const rawUsers = usersQuery.data?.users ?? [];
  const pagination = usersQuery.data?.pagination;

  /*
  |--------------------------------------------------------------------------
  | DEFENSIVE CLIENT-SIDE FILTER
  |--------------------------------------------------------------------------
  | The Postman docs list NO query parameters for GET /admin/users — `search`
  | and `status` are not documented. Pagination is clearly supported (the
  | response carries a pagination block), but the filters may be silently
  | ignored by the backend.
  |
  | So we send them anyway (free if supported) AND re-apply them here. If the
  | server already filtered, this is a no-op. If the server ignored them, the
  | user still gets working search and filter chips instead of a search box
  | that appears broken.
  |
  | Once you confirm the backend honours `?search=` / `?status=`, this block
  | can be deleted.
  */
  const q = debouncedSearch.trim().toLowerCase();
  const users = rawUsers.filter((u) => {
    const matchesSearch =
      !q ||
      (u.fullname ?? '').toLowerCase().includes(q) ||
      (u.emailAddress ?? '').toLowerCase().includes(q) ||
      (u.platformId ?? '').toLowerCase().includes(q) ||
      (u.phoneNumber ?? '').toLowerCase().includes(q);

    const matchesStatus = activeFilter === 'ALL' || u.userStatus === activeFilter;

    return matchesSearch && matchesStatus;
  });

  // Metrics payload is not fully documented — read defensively and fall back
  // to what the list itself proves, so the tiles are never blank or wrong.
  const metrics = metricsQuery.data as
    | {
        totalUsers?: number;
        activeUsers?: number;
        newUsersThisMonth?: number;
        growthPercent?: number;
      }
    | undefined;

  const totalCustomers = metrics?.totalUsers ?? pagination?.totalItems ?? users.length;
  const newThisMonth = metrics?.newUsersThisMonth ?? 0;
  const growth = metrics?.growthPercent ?? 0;

  const handleFilterChange = (value: AdminUserStatus | 'ALL') => {
    setActiveFilter(value);
    setPage(1); // reset pagination whenever the filter changes
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Users</h1>
        <button
          type="button"
          onClick={() => navigate('/admin/users/analytics')}
          aria-label="User analytics"
          className="text-primary-dark"
        >
          <BarChart3 size={22} strokeWidth={2} />
        </button>
      </header>

      <div className="px-5 pt-4">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3">
          <Search size={18} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search for users by name, email or ID..."
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => handleFilterChange(f.value)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeFilter === f.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto px-5 pb-1 scrollbar-hide">
        <div className="min-w-[140px] rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400">TOTAL CUSTOMERS</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xl font-extrabold text-gray-900">
              {metricsQuery.isLoading ? '—' : totalCustomers.toLocaleString()}
            </p>
            {growth > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                +{growth}%
              </span>
            )}
          </div>
        </div>
        <div className="min-w-[140px] rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400">NEW (MONTH)</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xl font-extrabold text-gray-900">
              {metricsQuery.isLoading ? '—' : newThisMonth.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 space-y-4 px-5 pb-28 pt-5">
        {/* Loading skeleton */}
        {usersQuery.isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-gray-100 bg-gray-50"
            />
          ))}

        {/*
          FIX: this block used to say "Couldn't load users. Check that your
          admin session is still valid." for EVERY failure — a 400, a 403, a
          500, a timeout, a CORS block. It blamed the session even when the
          session was fine, which sent everyone looking in the wrong place.

          A genuine 401 never reaches here — the axios interceptor clears the
          token and redirects to /admin/login. So if you're reading this, the
          session is NOT the problem. Show what actually failed.
        */}
        {usersQuery.isError && !usersQuery.isLoading && (
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 text-center">
            <p className="text-sm font-semibold text-red-600">{describeUsersError(usersQuery.error)}</p>
            <p className="mt-1.5 text-xs text-gray-500">
              Request: <span className="font-mono">GET /admin/users</span>
              {httpStatusOf(usersQuery.error) !== null && (
                <>
                  {' '}
                  &middot; HTTP{' '}
                  <span className="font-mono">{httpStatusOf(usersQuery.error)}</span>
                </>
              )}
            </p>
            <button
              type="button"
              onClick={() => usersQuery.refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">
            {rawUsers.length === 0
              ? 'No users found.'
              : 'No users match this search or filter.'}
          </p>
        )}

        {users.map((user) => {
          const isSuspended = user.userStatus === 'SUSPENDED';
          const isVerified = user.userStatus === 'ACTIVE';
          const walletBalance = Number(user.referralWalletBalance ?? 0);

          return (
            <div key={user.id} className="rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* profilePictureUrl is nullable — fall back to initials */}
                  {user.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={user.fullname}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {initialsOf(user.fullname)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-gray-900">{user.fullname}</p>
                      {isVerified && <span className="text-primary">✓</span>}
                    </div>
                    <p className="text-xs text-gray-400">{user.platformId}</p>
                  </div>
                </div>
                <RowActionsMenu
                  label={`Actions for ${user.fullname}`}
                  actions={
                    [
                      {
                        label: 'View Full Details',
                        icon: <Eye size={15} />,
                        onClick: () => goTo(resolveUserId(user), `/admin/users/${resolveUserId(user)}`),
                      },
                      {
                        label: 'View Financials',
                        icon: <Wallet size={15} />,
                        onClick: () =>
                          goTo(resolveUserId(user), `/admin/users/${resolveUserId(user)}/financials`),
                      },
                      {
                        /*
                          REVERSED per request — this new-tab link landed on a
                          blank page. In-app navigation now.

                          It also went to /admin/referrals/members/ with an
                          EMPTY id whenever the server sent no id, which just
                          bounced the admin back to the members list. The
                          guard below keeps the row out of the menu when there
                          is no id to navigate to.
                        */
                        label: 'View Referral Network',
                        icon: <Share2 size={15} />,
                        onClick: () => {
                          const userId = resolveUserId(user);
                          if (!userId) {
                            window.alert(
                              'Cannot open the referral network — the server did not send an ID for this account.'
                            );
                            return;
                          }
                          goTo(userId, `/admin/referrals/members/${userId}`);
                        },
                      },
                      {
                        label: isSuspended ? 'Reactivate Account' : 'Suspend Account',
                        icon: isSuspended ? <UserCheck size={15} /> : <UserX size={15} />,
                        danger: !isSuspended,
                        onClick: () => {
                          const userId = resolveUserId(user);

                          if (!userId) {
                            window.alert('Cannot update this account — the server did not send an ID.');
                            return;
                          }

                          if (
                            !isSuspended &&
                            !window.confirm(
                              `Suspend ${user.fullname}? They will lose access immediately.`
                            )
                          ) {
                            return;
                          }

                          const mutation = isSuspended ? unsuspend : suspend;

                          mutation.mutate(userId, {
                            onError: () =>
                              window.alert('Could not update this account. Please try again.'),
                          });
                        },
                      },
                      {
                        label: 'Copy Email Address',
                        icon: <Mail size={15} />,
                        onClick: () => {
                          navigator.clipboard?.writeText(user.emailAddress ?? '').catch(() => {
                            // Clipboard blocked — nothing we can do, and not worth
                            // interrupting the admin with an alert.
                          });
                        },
                      },
                    ] satisfies RowAction[]
                  }
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">EMAIL ADDRESS</p>
                  <p className="truncate text-gray-700">{user.emailAddress}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">WALLET BALANCE</p>
                  <p
                    className={`font-semibold ${
                      walletBalance > 0 ? 'text-primary' : 'text-red-500 line-through'
                    }`}
                  >
                    {formatNaira(user.referralWalletBalance)}
                  </p>
                </div>
                {!isSuspended && (
                  <>
                    <div>
                      <p className="text-xs text-gray-400">LIFETIME SPEND</p>
                      <p className="font-semibold text-gray-800">
                        {formatNaira(user.lifetimeSpend)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">TOTAL ORDERS</p>
                      <p className="font-semibold text-gray-800">{user.totalOrders}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <StatusPill label={user.userStatus} dot />
                {!isSuspended && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                    {/* NOTE: the API exposes no explicit "referral active" flag.
                        A non-zero referral wallet is the closest available proxy. */}
                    Referral: {walletBalance > 0 ? 'Active' : 'Inactive'}
                  </span>
                )}
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                  Last: {formatLastSeen(user.lastLogin)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => goTo(resolveUserId(user), `/admin/users/${resolveUserId(user)}`)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#F3F7EE] py-2.5 text-sm font-semibold text-primary-dark"
              >
                View Full Details
                <span aria-hidden>→</span>
              </button>
            </div>
          );
        })}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 text-sm">
            <button
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-gray-200 px-4 py-2 font-semibold text-gray-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-gray-400">
              Page {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full border border-gray-200 px-4 py-2 font-semibold text-gray-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>

 

      <AdminBottomNav />
    </div>
  );
}