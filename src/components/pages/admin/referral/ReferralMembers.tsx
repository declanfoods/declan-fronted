import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Users, DollarSign, RefreshCw, Share2, Eye, Wallet, Copy } from 'lucide-react';
import ReferralBottomNav from '../../../admin/ReferralBottomNav';
import RowActionsMenu, { type RowAction } from '../../../admin/RowActionsMenu';
import { useAdminReferrals } from '../../../../app/hooks/useAdminReferrals';
import { useDebounce } from '../../../../app/hooks/useDebounce';
import { getApiErrorMessage } from '../../../../app/lib/api-types';

/*
|--------------------------------------------------------------------------
| Admin → Referral Members directory — WIRED TO API
|--------------------------------------------------------------------------
| BEFORE: `mockMembers` — two people, hardcoded "1,284 total network" and
| "₦4.2M total paid" tiles, and a level filter of L1–L4 that the mock data
| only partially satisfied.
|
| AFTER: `adminReferralApi.getReferrals({ level, page, limit })`.
|
| Field mapping (AdminReferralListItem → card):
|   fullname           → name
|   code               → referral code
|   level              → L1/L2/L3 badge (real number from the API)
|   networkSize        → network size
|   commissions        → commission total  (⚠️ string OR number — see below)
|   profilePictureUrl  → avatar (null → initials)
|   createdAt          → joined date
|
| ⚠️ TWO THINGS TO KNOW
|  1. `commissions` comes back as "0.00" (string) on some rows and 0 (number)
|     on others. Everything is passed through Number() before use.
|  2. There is NO "Qualified / Pending Review" field on this endpoint and no
|     `search` query param. The verdict used here is derived from networkSize
|     (networkSize > 0 = "Qualified") and search filters the CURRENT PAGE
|     client-side. If you want true server-side search + a qualification flag,
|     the backend needs to add them.
*/

const LEVELS: { label: string; value: number | undefined }[] = [
  { label: 'All Levels', value: undefined },
  { label: 'L1', value: 1 },
  { label: 'L2', value: 2 },
  { label: 'L3', value: 3 },
  { label: 'L4', value: 4 },
];

const PAGE_SIZE = 20;

export default function ReferralMembers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeLevel, setActiveLevel] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 450);

  const referralsQuery = useAdminReferrals({
    level: activeLevel,
    page,
    limit: PAGE_SIZE,
  });

  const members = referralsQuery.data?.referrals ?? [];
  const pagination = referralsQuery.data?.pagination;

  const filtered = members.filter((m) => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return true;

    return (
      (m.fullname ?? '').toLowerCase().includes(q) ||
      (m.code ?? '').toLowerCase().includes(q)
    );
  });

  const totalNetwork = pagination?.totalItems ?? members.length;
  const totalPaid = members.reduce((sum, m) => sum + Number(m.commissions ?? 0), 0);

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Referral &amp; Rewards</h1>
      </header>

      <main className="flex-1 space-y-4 px-5 pb-28 pt-5">
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3">
          <Search size={18} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search members or codes..."
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {LEVELS.map((l) => (
            <button
              key={l.label}
              type="button"
              onClick={() => {
                setActiveLevel(l.value);
                setPage(1);
              }}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeLevel === l.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-primary p-4 text-white">
            <Users size={18} className="mb-2 text-white/80" />
            <p className="text-xl font-extrabold">
              {referralsQuery.isLoading ? '—' : totalNetwork.toLocaleString()}
            </p>
            <p className="text-xs text-white/80">Total Network</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <DollarSign size={18} className="mb-2 text-rose-500" />
            <p className="text-xl font-extrabold text-gray-900">
              ₦{totalPaid.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">Commissions (this page)</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Member Directory</h2>
        </div>

        {referralsQuery.isError && (
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              {getApiErrorMessage(referralsQuery.error, 'Could not load members.')}
            </p>
            <button
              type="button"
              onClick={() => referralsQuery.refetch()}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {referralsQuery.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        )}

        <div className="space-y-3">
          {!referralsQuery.isLoading && filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">No members found.</p>
          )}

          {filtered.map((m) => {
            const isQualified = (m.networkSize ?? 0) > 0;

            return (
              <div key={m.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {m.profilePictureUrl ? (
                      <img
                        src={m.profilePictureUrl}
                        alt={m.fullname}
                        className="h-12 w-12 rounded-full border-2 border-primary/30 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 text-sm font-bold text-primary">
                        {m.fullname
                          ?.split(' ')
                          .filter(Boolean)
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{m.fullname}</p>
                      <p className="text-xs text-gray-400">CODE: {m.code}</p>
                      <p
                        className={`mt-0.5 flex items-center gap-1 text-xs font-semibold ${
                          isQualified ? 'text-primary' : 'text-red-500'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isQualified ? 'bg-primary' : 'bg-red-500'
                          }`}
                        />
                        {isQualified ? 'Qualified' : 'No Network'}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                    L{m.level}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Network Size</p>
                    <p className="font-bold text-gray-900">{m.networkSize ?? 0} Members</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Commissions</p>
                    <p className="font-bold text-primary">
                      ₦{Number(m.commissions ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/referrals/members/${m.id}`)}
                    className="flex-1 rounded-full bg-gray-100 py-2.5 text-sm font-semibold text-gray-700"
                  >
                    View Network
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/users/${m.id}/financials`)}
                    className="flex-1 rounded-full bg-gray-100 py-2.5 text-sm font-semibold text-gray-700"
                  >
                    View Earnings
                  </button>
                  <RowActionsMenu
                    label={`Actions for ${m.fullname}`}
                    actions={
                      [
                        {
                          /*
                            REVERSED per request — was a new-tab link that
                            landed blank. In-app navigation now, same as the
                            other rows in this menu.
                          */
                          label: 'View Referral Network',
                          icon: <Share2 size={15} />,
                          onClick: () => navigate(`/admin/referrals/members/${m.id}`),
                        },
                        {
                          label: 'View Full Details',
                          icon: <Eye size={15} />,
                          onClick: () => navigate(`/admin/users/${m.id}`),
                        },
                        {
                          label: 'View Earnings',
                          icon: <Wallet size={15} />,
                          onClick: () => navigate(`/admin/users/${m.id}/financials`),
                        },
                        {
                          label: 'Copy Referral Code',
                          icon: <Copy size={15} />,
                          onClick: () => {
                            navigator.clipboard?.writeText(m.code ?? '').catch(() => {
                              // Clipboard blocked — silent by design.
                            });
                          },
                        },
                      ] satisfies RowAction[]
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <button
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full bg-white px-4 py-2 font-semibold text-gray-700 shadow-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-gray-400">
              Page {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full bg-white px-4 py-2 font-semibold text-gray-700 shadow-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>

      <ReferralBottomNav />
    </div>
  );
}
