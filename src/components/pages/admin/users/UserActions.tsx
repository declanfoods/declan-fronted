import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Trash2,
  Share2,
  Wallet,
  UserX,
  Phone,
  Mail,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import StatusPill from '../../../admin/StatusPill';
import {
  useAdminUser,
  useSuspendUser,
  useUnsuspendUser,
  useVerifyUser,
} from '../../../../app/hooks/useAdminUsers';
import { getApiErrorMessage } from '../../../../app/lib/api-types';

/*
|--------------------------------------------------------------------------
| Admin → User Actions  (titled "User Profile" on screen)
|--------------------------------------------------------------------------
| CHANGES IN THIS PASS (requested):
|
|  1. REMOVED the entire "WALLET & TRANSACTIONS" section
|     (Credit Wallet / Debit Wallet / Issue Refund). Those three endpoints
|     don't exist on the backend anyway — see the audit.
|
|  2. REMOVED the "Send Notification" row from COMMUNICATION.
|     `POST /admin/users/:id/notify` does not exist.
|
|  3. "View Referral Network" now opens in a NEW TAB (target="_blank").
|     It renders a real <a href> instead of a client-side navigate(), so the
|     admin keeps this screen and can compare side by side. rel="noopener
|     noreferrer" is required: without it the new tab gets a handle on
|     window.opener and can redirect this page.
|
| REMAINING ROWS
|   ✅ Suspend / Reactivate  → PATCH /admin/users/:id/suspended | /unsuspend
|   ✅ Verify Account        → PATCH /admin/users/:id/verify   (only if PENDING)
|   ✅ View Referral Network → /admin/referrals/members/:id    (NEW TAB)
|   ✅ View Referral Earnings → /admin/users/:id/financials
|   ✅ Call / Email          → tel: / mailto:
|   ⛔ Delete Account              → no DELETE /admin/users/:id
|   ⛔ Disable Referral Privileges → no PATCH endpoint
*/

type ActionRow = {
  label: string;
  icon: typeof Ban;
  danger?: boolean;
  onClick?: () => void;
  /** When set the row renders as an <a href> instead of a <button>. */
  href?: string;
  /** Open the href in a new browser tab. */
  newTab?: boolean;
  /** Set when the action has no backend endpoint yet. Renders greyed + badged. */
  unavailable?: boolean;
};

export default function UserActions() {
  const navigate = useNavigate();
  const { id } = useParams();

  const userQuery = useAdminUser(id);
  const suspend = useSuspendUser();
  const unsuspend = useUnsuspendUser();
  const verify = useVerifyUser();

  const user = userQuery.data;

  if (userQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F3F7EE] px-5 pt-6">
        <div className="h-16 animate-pulse rounded-2xl bg-gray-200" />
        <div className="mt-5 h-64 animate-pulse rounded-2xl bg-gray-200" />
      </div>
    );
  }

  if (userQuery.isError || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F3F7EE] px-5">
        <p className="text-sm text-gray-500">
          {userQuery.isError
            ? getApiErrorMessage(userQuery.error, 'Could not load this user.')
            : 'User not found.'}
        </p>
        <button
          type="button"
          onClick={() => userQuery.refetch()}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const isSuspended = user.userStatus === 'SUSPENDED';
  const isPending = user.userStatus === 'PENDING_VERIFICATION';
  const isBusy = suspend.isPending || unsuspend.isPending || verify.isPending;

  const run = (
    mutation: ReturnType<typeof useSuspendUser>,
    successMessage: string
  ) => {
    if (!id) return;

    mutation.mutate(id, {
      onSuccess: () => window.alert(successMessage),
      onError: (error) =>
        window.alert(getApiErrorMessage(error, 'That action could not be completed.')),
    });
  };

  const accountRows: ActionRow[] = [
    {
      label: isSuspended ? 'Reactivate Account' : 'Suspend Account',
      icon: isSuspended ? CheckCircle2 : Ban,
      danger: !isSuspended,
      onClick: () => {
        if (!id) return;

        if (!isSuspended && !window.confirm(`Suspend ${user.fullname}?`)) return;

        run(
          isSuspended ? unsuspend : suspend,
          isSuspended ? 'Account reactivated.' : 'Account suspended.'
        );
      },
    },
    ...(isPending
      ? [
          {
            label: 'Verify Account',
            icon: CheckCircle2,
            onClick: () => run(verify, 'Account verified.'),
          },
        ]
      : []),
    { label: 'Delete Account', icon: Trash2, danger: true, unavailable: true },
  ];

  const referralRows: ActionRow[] = [
    {
      label: 'View Referral Network',
      icon: Share2,
      // Opens in a new tab so the admin keeps this profile screen open.
      href: `/admin/referrals/members/${user.id}`,
      newTab: true,
    },
    {
      label: 'View Referral Earnings',
      icon: Wallet,
      onClick: () => navigate(`/admin/users/${user.id}/financials`),
    },
    { label: 'Disable Referral Privileges', icon: UserX, unavailable: true },
  ];

  // NOTE: "WALLET & TRANSACTIONS" section removed on request.
  // (Credit Wallet / Debit Wallet / Issue Refund — no backend endpoints.)

  const commsRows: ActionRow[] = [
    {
      label: 'Call Customer',
      icon: Phone,
      href: `tel:${user.phoneNumber}`,
    },
    {
      label: 'Email Customer',
      icon: Mail,
      href: `mailto:${user.email}`,
    },
    // NOTE: "Send Notification" removed on request.
    // (POST /admin/users/:id/notify does not exist.)
  ];

  const renderSection = (title: string, rows: ActionRow[]) => (
    <section>
      <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400">{title}</p>
      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm">
        {rows.map((row) => {
          const Icon = row.icon;
          const disabled = row.unavailable || isBusy;

          const inner = (
            <>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  row.danger ? 'bg-red-50 text-red-500' : 'bg-[#F3F7EE] text-primary'
                }`}
              >
                <Icon size={16} />
              </span>
              <span
                className={`flex-1 text-sm font-medium ${
                  row.danger ? 'text-red-500' : 'text-gray-800'
                }`}
              >
                {row.label}
                {row.unavailable && (
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400">
                    SOON
                  </span>
                )}
              </span>
              {row.newTab ? (
                <ExternalLink size={15} className="text-gray-300" />
              ) : (
                <ChevronRight
                  size={16}
                  className={row.danger ? 'text-red-200' : 'text-gray-300'}
                />
              )}
            </>
          );

          const sharedClass = `flex w-full items-center gap-3 px-4 py-3.5 text-left ${
            disabled ? 'cursor-not-allowed opacity-45' : ''
          }`;

          // Renders a real anchor for links (so target="_blank" works),
          // a button for in-page actions.
          if (row.href && !disabled) {
            return (
              <a
                key={row.label}
                href={row.href}
                {...(row.newTab
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className={sharedClass}
              >
                {inner}
              </a>
            );
          }

          return (
            <button
              key={row.label}
              type="button"
              disabled={disabled}
              onClick={row.onClick}
              title={row.unavailable ? 'No backend endpoint yet' : undefined}
              className={sharedClass}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">User Profile</h1>
      </header>

      <main className="flex-1 space-y-5 px-5 pt-5">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          {user.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={user.fullname}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {user.fullname
                ?.split(' ')
                .filter(Boolean)
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-bold text-gray-900">{user.fullname}</p>
            <p className="truncate text-xs text-gray-400">ID: {user.id.slice(0, 8)}</p>
          </div>
          <span className="ml-auto shrink-0">
            <StatusPill label={user.userStatus} />
          </span>
        </div>

        {renderSection('ACCOUNT', accountRows)}
        {renderSection('REFERRAL', referralRows)}
        {renderSection('COMMUNICATION', commsRows)}
      </main>
    </div>
  );
}
