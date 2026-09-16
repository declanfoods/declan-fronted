import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Phone, Mail, MessageSquare, Copy, Check, MoreVertical, ArrowLeft } from 'lucide-react';
import StatusPill from '../../../admin/StatusPill';
import { findMockUser } from './mockUsers';

function formatNaira(n: number) {
  return `₦${n.toLocaleString()}`;
}

export default function UserProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = id ? findMockUser(id) : undefined;
  const [copied, setCopied] = useState(false);

  const handleCopyReferral = async () => {
    if (!user) return;
    try {
      await navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard permission errors
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <p className="text-sm text-gray-500">User not found.</p>
        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
        >
          Back to Users
        </button>
      </div>
    );
  }

  const details = [
    { icon: Mail, label: 'Email Address', value: user.email },
    { icon: Phone, label: 'Phone Number', value: user.phone },
    { icon: null as null, label: 'Delivery Address', value: user.deliveryAddress },
    { icon: null as null, label: 'Date Joined', value: user.dateJoined },
    { icon: null as null, label: 'Last Login', value: user.lastLogin },
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
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-24 w-24 rounded-full object-cover"
          />
          <h2 className="mt-3 text-xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-400">
            ID: {user.custId.replace('#', '')} <span className="mx-1">•</span>
          </p>
          <div className="mt-1">
            <StatusPill label={user.status} />
          </div>

          <div className="mt-4 flex gap-8">
            <button type="button" className="flex flex-col items-center gap-1">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                <Phone size={18} />
              </span>
              <span className="text-xs text-gray-500">Phone</span>
            </button>
            <button type="button" className="flex flex-col items-center gap-1">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                <Mail size={18} />
              </span>
              <span className="text-xs text-gray-500">Email</span>
            </button>
            <button type="button" className="flex flex-col items-center gap-1">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                <MessageSquare size={18} />
              </span>
              <span className="text-xs text-gray-500">Message</span>
            </button>
          </div>
        </div>

        <section>
          <h3 className="mb-2 text-base font-bold text-gray-900">Financial Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-400">Wallet</p>
              <p className="mt-1 text-lg font-extrabold text-gray-900">
                {formatNaira(user.walletBalance)}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-400">Cashback</p>
              <p className="mt-1 text-lg font-extrabold text-primary">
                {formatNaira(user.cashback)}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-400">Referrals</p>
              <p className="mt-1 text-lg font-extrabold text-gray-900">
                {formatNaira(user.referralEarnings)}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-400">Total Spend</p>
              <p className="mt-1 text-lg font-extrabold text-gray-900">
                {formatNaira(user.lifetimeSpend)}
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
            onClick={() => navigate(`/admin/users/${user.id}/orders`)}
            className="w-full rounded-full border border-gray-200 py-3.5 text-sm font-semibold text-gray-700"
          >
            View Orders
          </button>
          <button
            type="button"
            className="w-full rounded-full border border-red-300 py-3.5 text-sm font-semibold text-red-500"
          >
            🚫 Suspend Account
          </button>
        </div>
      </main>
    </div>
  );
}