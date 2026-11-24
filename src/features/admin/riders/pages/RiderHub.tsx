import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Repeat,
  Triangle,
  History,
  FileText,
  Bell,
  Mail,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  Ban,
  UserX,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { getApiErrorMessage } from '../../../../app/lib/api-types';
import { useAdminRiders, useUpdateRiderSuspension } from '../queries';

export default function RiderHub() {
  const navigate = useNavigate();
  const { id } = useParams();
  const ridersQuery = useAdminRiders(Boolean(id));
  const suspension = useUpdateRiderSuspension();

  const rider = ridersQuery.data?.find((item) => item.id === id);
  const loadError = ridersQuery.isError
    ? getApiErrorMessage(ridersQuery.error, 'Failed to load rider.')
    : '';
  const error = suspension.isError
    ? getApiErrorMessage(suspension.error, 'Failed to update rider status.')
    : loadError;

  const handleSuspendToggle = () => {
    if (!id || !rider || suspension.isPending) return;
    const suspended = !rider.isSuspended;
    const message = suspended ? 'Suspend this rider?' : 'Remove suspension from this rider?';
    if (window.confirm(message)) suspension.mutate({ id, suspended });
  };

  if (id && ridersQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-400">Loading rider...</p>
      </div>
    );
  }

  if (!rider) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <p role="alert" className="text-sm text-red-500">{loadError || 'Rider not found.'}</p>
        {loadError && (
          <button
            type="button"
            onClick={() => ridersQuery.refetch()}
            className="text-sm font-semibold text-primary underline"
          >
            Try again
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate('/admin/riders')}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  const opsRows = [
    { label: 'Assign Delivery', icon: CheckCircle2, onClick: () => navigate('/admin/orders') },
    { label: 'Reassign', icon: Repeat, onClick: () => navigate('/admin/orders') },
    { label: 'View Active', icon: Triangle, right: `${rider.activeOrders ?? 0} Pending` },
    { label: 'History', icon: History },
  ];

  const commsRows = [
    { label: 'Push Notification', icon: Bell },
    { label: 'Email', icon: Mail },
  ];

  const systemRows = [
    { label: 'Activity Logs', icon: ClipboardList },
    { label: 'Performance Report', icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white pb-10">
      <header className="flex items-center gap-3 px-5 pt-6">
        <button type="button" aria-label="Back to riders" onClick={() => navigate('/admin/riders')} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Rider Hub</h1>
      </header>

      <main className="flex-1 space-y-5 px-5 pt-5">
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 p-4 shadow-sm">
          <img
            src={rider.profilePictureUrl || `https://i.pravatar.cc/80?u=${rider.id}`}
            alt={rider.fullname}
            className="h-14 w-14 rounded-full object-cover"
          />
          <div>
            <p className="text-lg font-bold text-gray-900">{rider.fullname}</p>
            <p className="flex items-center gap-1 text-sm text-primary">
              <ShieldCheck size={14} />
              {rider.isStudent ? 'Student Rider' : 'Senior Rider'} ·{' '}
              {rider.isSuspended ? 'Suspended' : 'Active'}
            </p>
          </div>
        </div>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Delivery Operations</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {rider.activeOrders ?? 0} Active
            </span>
          </div>
          <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
            {opsRows.map((row) => {
              const Icon = row.icon;
              return (
                <button
                  key={row.label}
                  type="button"
                  onClick={row.onClick}
                  disabled={!row.onClick}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F7EE] text-primary">
                    <Icon size={16} />
                  </span>
                  <span className="flex-1 text-sm font-medium text-gray-800">{row.label}</span>
                  {row.right && (
                    <span className="text-xs font-semibold text-primary">{row.right}</span>
                  )}
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-gray-900">Financials</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400">Today</p>
              <p className="text-lg font-bold text-gray-900">₦0</p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400">Weekly</p>
              <p className="text-lg font-bold text-gray-900">₦0</p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400">Monthly</p>
              <p className="text-lg font-bold text-gray-900">₦0</p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400">Outstanding</p>
              <p className="text-lg font-bold text-primary">₦0</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-gray-100 px-4 py-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F7EE] text-primary">
              <FileText size={16} />
            </span>
            <span className="flex-1 text-sm font-medium text-gray-800">Payment History</span>
            <ChevronRight size={16} className="text-gray-300" />
          </div>

        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-gray-900">Communication</h2>
          <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
            {commsRows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F7EE] text-primary">
                    <Icon size={16} />
                  </span>
                  <span className="flex-1 text-sm font-medium text-gray-800">{row.label}</span>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-gray-900">System</h2>
          <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
            {systemRows.map((row) => {
              const Icon = row.icon;
              return (
                <button
                  key={row.label}
                  type="button"
                  disabled
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F7EE] text-primary">
                    <Icon size={16} />
                  </span>
                  <span className="flex-1 text-sm font-medium text-gray-800">{row.label}</span>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-gray-900">Account Controls</h2>
          <div className="divide-y divide-gray-100 rounded-2xl border border-red-100">
            <button
              type="button"
              disabled={suspension.isPending}
              onClick={handleSuspendToggle}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left disabled:opacity-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <Ban size={16} />
              </span>
              <span className="flex-1">
                <p className="text-sm font-semibold text-red-500">
                  {rider.isSuspended ? 'Remove Suspension' : 'Suspend'}
                </p>
                <p className="text-[10px] font-semibold uppercase text-red-300">
                  Requires confirmation
                </p>
              </span>
              <ChevronRight size={16} className="text-red-200" />
            </button>
            <button
              type="button"
              disabled
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left opacity-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <UserX size={16} />
              </span>
              <span className="flex-1">
                <p className="text-sm font-semibold text-red-500">Deactivate</p>
                <p className="text-[10px] font-semibold uppercase text-red-300">
                  No endpoint yet
                </p>
              </span>
              <ChevronRight size={16} className="text-red-200" />
            </button>
            <button
              type="button"
              disabled
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left opacity-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <Trash2 size={16} />
              </span>
              <span className="flex-1">
                <p className="text-sm font-semibold text-red-500">Delete</p>
                <p className="text-[10px] font-semibold uppercase text-red-300">
                  No endpoint yet
                </p>
              </span>
              <ChevronRight size={16} className="text-red-200" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
