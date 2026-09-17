import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Phone,
  Mail,
  MessageSquare,
  Copy,
  Check,
  MoreVertical,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import StatusPill from '../../../admin/StatusPill';
import { useAdminUser, useSuspendUser, useUnsuspendUser } from '../../../../app/hooks/useAdminUsers';
import { getApiErrorMessage } from '../../../../app/lib/api-types';
import {
  whatsappLink,
  defaultCustomerMessage,
} from '../../../../app/lib/whatsapp';

/*
|--------------------------------------------------------------------------
| Admin → User Profile — WIRED TO API
|--------------------------------------------------------------------------
| BEFORE: `findMockUser(id)` — which searched a 2-item mock array, so every
| real user ID resolved to `undefined` and the screen always rendered
| "User not found." It could not work in production by construction.
|
| AFTER: `adminUserApi.getUserById(id)` with loading / error / not-found
| states, and the Suspend / Unsuspend button is actually wired to
| `PATCH /admin/users/:id/suspended` and `.../unsuspend`.
|
| Field mapping (AdminUserDetail → screen):
|   fullname                              → name
|   profilePictureUrl                     → avatar (null → initials)
|   userStatus                            → StatusPill
|   referralCode                          → copyable code
|   financialOverview.referralWalleBalance→ Wallet      (⚠️ sic: backend typo)
|   financialOverview.cashback            → Cashback
|   financialOverview.numberOfReferrals   → Referrals
|   financialOverview.totalSpend          → Total Spend
|   financialOverview.orderCount          → Orders
*/

function formatNaira(value: string | number | undefined) {
  return `₦${Number(value ?? 0).toLocaleString()}`;
}

export default function UserProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  const userQuery = useAdminUser(id);
  const suspend = useSuspendUser();
  const unsuspend = useUnsuspendUser();

  const user = userQuery.data;

  /*
    WhatsApp deep link for the action row above. Null when the account has no
    dialable number — the button renders disabled rather than opening a dead
    chat.
  */
  const whatsappUrl = whatsappLink(
    user?.phoneNumber,
    defaultCustomerMessage(user?.fullname)
  );

  const handleCopyReferral = async () => {
    if (!user?.referralCode) return;

    try {
      await navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard permission denied.
    }
  };

  const handleToggleSuspend = () => {
    if (!id || !user) return;

    const isSuspended = user.userStatus === 'SUSPENDED';

    if (!isSuspended && !window.confirm(`Suspend ${user.fullname}? They will lose access immediately.`)) {
      return;
    }

    const mutation = isSuspended ? unsuspend : suspend;

    mutation.mutate(id, {
      onError: (error) => window.alert(getApiErrorMessage(error, 'Could not update this account.')),
    });
  };

  if (userQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F3F7EE] px-5 pt-6">
        <div className="h-24 w-24 animate-pulse self-center rounded-full bg-gray-200" />
        <div className="mt-4 h-6 w-40 animate-pulse self-center rounded bg-gray-200" />
        <div className="mt-8 h-40 animate-pulse rounded-2xl bg-gray-200" />
      </div>
    );
  }

  if (userQuery.isError || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <p className="text-sm text-gray-500">
          {userQuery.isError
            ? getApiErrorMessage(userQuery.error, 'Could not load this user.')
            : 'User not found.'}
        </p>

        {/*
          FIX: the error used to be a single vague line. If the backend fails,
          its body is often a generic "An error occurred", which tells an admin
          nothing and tells a developer even less. The route is only reachable
          with a real id, so a failure here is almost always the request itself
          — surface which one failed and with what status.
        */}
        {userQuery.isError && (
          <p className="max-w-sm text-center text-xs text-gray-400">
            Request: <span className="font-mono">GET /admin/users/{id ?? '(no id in URL)'}</span>
            {typeof (userQuery.error as { response?: { status?: number } })?.response?.status ===
              'number' && (
              <>
                {' '}
                &middot; HTTP{' '}
                <span className="font-mono">
                  {(userQuery.error as { response?: { status?: number } }).response?.status}
                </span>
              </>
            )}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => userQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700"
          >
            <RefreshCw size={14} /> Retry
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const isSuspended = user.userStatus === 'SUSPENDED';
  const financials = user.financialOverview;

  const details = [
    { icon: Mail, label: 'Email Address', value: user.email },
    { icon: Phone, label: 'Phone Number', value: user.phoneNumber },
    { icon: null as null, label: 'Delivery Address', value: user.deliveryAddress ?? '—' },
    {
      icon: null as null,
      label: 'Date Joined',
      value: new Date(user.joinedAt).toLocaleDateString('en-NG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    },
    {
      icon: null as null,
      label: 'Last Login',
      value: user.lastLogin
        ? new Date(user.lastLogin).toLocaleString('en-NG', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Never',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center justify-between bg-white px-5 pt-6 pb-4">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Declan Foods</h1>
        <button
          type="button"
          onClick={() => navigate(`/admin/users/${user.id}/actions`)}
          aria-label="More actions"
          className="text-primary-dark"
        >
          <MoreVertical size={22} strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 space-y-5 px-5 pt-5">
        <div className="flex flex-col items-center">
          {user.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={user.fullname}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {user.fullname
                ?.split(' ')
                .filter(Boolean)
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || '?'}
            </div>
          )}

          <h2 className="mt-3 text-xl font-bold text-gray-900">{user.fullname}</h2>
          {/* FIX: `user.id.slice` crashed the whole screen when the API
              omitted `id` — a blank page with no explanation. */}
          <p className="text-sm text-gray-400">
            {user.id ? `ID: ${user.id.slice(0, 8)}` : 'ID: —'}
          </p>
          <div className="mt-1">
            <StatusPill label={user.userStatus} />
          </div>

          {/* Phone / Email now actually do something */}
          <div className="mt-4 flex gap-8">
            <a
              href={`tel:${user.phoneNumber}`}
              className="flex flex-col items-center gap-1"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                <Phone size={18} />
              </span>
              <span className="text-xs text-gray-500">Phone</span>
            </a>
            <a
              href={`mailto:${user.email}`}
              className="flex flex-col items-center gap-1"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                <Mail size={18} />
              </span>
              <span className="text-xs text-gray-500">Email</span>
            </a>
            {/*
              FIX: this was an inert <button> with no handler at all — tapping
              it did nothing, which is what "Admin message customer is broken"
              meant. It now opens WhatsApp to the customer's number.

              WhatsApp (not an in-app notification) because the notify endpoint
              doesn't exist on the backend — see app/lib/whatsapp.ts. The
              button is disabled, with a tooltip, when the number is missing
              or unusable, instead of silently doing nothing.
            */}
            <a
              href={whatsappUrl ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!whatsappUrl) e.preventDefault();
              }}
              aria-disabled={!whatsappUrl}
              title={
                whatsappUrl
                  ? `Message ${user.fullname ?? 'customer'} on WhatsApp`
                  : 'No usable phone number on this account'
              }
              className={`flex flex-col items-center gap-1 ${
                whatsappUrl ? '' : 'cursor-not-allowed opacity-40'
              }`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                <MessageSquare size={18} />
              </span>
              <span className="text-xs text-gray-500">Message</span>
            </a>
          </div>
        </div>

        <section>
          <h3 className="mb-2 text-base font-bold text-gray-900">Financial Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-400">Wallet</p>
              <p className="mt-1 text-lg font-extrabold text-gray-900">
                {/* ⚠️ `referralWalleBalance` — the typo is in the real API
                    response, not here. Do NOT "fix" it in the type without
                    confirming the backend first. */}
                {formatNaira(financials?.referralWalleBalance)}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-400">Cashback</p>
              <p className="mt-1 text-lg font-extrabold text-primary">
                {formatNaira(financials?.cashback)}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-400">Referrals</p>
              <p className="mt-1 text-lg font-extrabold text-gray-900">
                {financials?.numberOfReferrals ?? 0}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-400">Total Spend</p>
              <p className="mt-1 text-lg font-extrabold text-gray-900">
                {formatNaira(financials?.totalSpend)}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-base font-bold text-gray-900">Customer Details</h3>
          <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
            {details.map((d) => {
              const Icon = d.icon;

              return (
                <div key={d.label} className="flex items-center gap-3 px-4 py-3.5">
                  {Icon && <Icon size={16} className="text-gray-400" />}
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">{d.label}</p>
                    <p className="text-sm font-medium text-gray-800">{d.value}</p>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex-1">
                <p className="text-xs text-gray-400">Referral Code</p>
                <p className="text-sm font-bold text-primary">{user.referralCode}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyReferral}
                aria-label="Copy referral code"
                className="text-gray-400"
              >
                {copied ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </section>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate(`/admin/users/${user.id}/financials`)}
            className="w-full rounded-full border border-gray-200 py-3.5 text-sm font-semibold text-gray-700"
          >
            View Orders &amp; Transactions
          </button>

          <button
            type="button"
            onClick={handleToggleSuspend}
            disabled={suspend.isPending || unsuspend.isPending}
            className={
              'w-full rounded-full py-3.5 text-sm font-semibold disabled:opacity-60 ' +
              (isSuspended
                ? 'border border-primary text-primary'
                : 'border border-red-300 text-red-500')
            }
          >
            {suspend.isPending || unsuspend.isPending
              ? 'Updating…'
              : isSuspended
                ? '✓ Reactivate Account'
                : '🚫 Suspend Account'}
          </button>
        </div>
      </main>
    </div>
  );
}