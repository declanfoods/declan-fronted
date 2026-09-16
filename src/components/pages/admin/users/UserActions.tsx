import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Trash2,
  Share2,
  Wallet,
  UserX,
  CreditCard,
  Landmark,
  Undo2,
  Phone,
  Mail,
  Bell,
  ChevronRight,
} from 'lucide-react';
import StatusPill from '../../../admin/StatusPill';
import { findMockUser } from './mockUsers';

type ActionRow = {
  label: string;
  icon: typeof Ban;
  danger?: boolean;
  onClick?: () => void;
};

export default function UserActions() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = id ? findMockUser(id) : undefined;

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <p className="text-sm text-gray-500">User not found.</p>
      </div>
    );
  }

  const accountRows: ActionRow[] = [
    { label: 'Suspend Account', icon: Ban },
    { label: 'Activate Account', icon: CheckCircle2 },
    { label: 'Delete Account', icon: Trash2, danger: true },
  ];

  const referralRows: ActionRow[] = [
    { label: 'View Referral Network', icon: Share2 },
    { label: 'View Referral Earnings', icon: Wallet },
    { label: 'Disable Referral Privileges', icon: UserX },
  ];

  const walletRows: ActionRow[] = [
    { label: 'Credit Wallet', icon: CreditCard },
    { label: 'Debit Wallet', icon: Landmark },
    { label: 'Issue Refund', icon: Undo2 },
  ];

  const commsRows: ActionRow[] = [
    { label: 'Call Customer', icon: Phone },
    { label: 'Email Customer', icon: Mail },
    { label: 'Send Notification', icon: Bell },
  ];

  const renderSection = (title: string, rows: ActionRow[]) => (
    <section>
      <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400">{title}</p>
      <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <button
              key={row.label}
              type="button"
              onClick={row.onClick}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
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
              </span>
              <ChevronRight size={16} className={row.danger ? 'text-red-200' : 'text-gray-300'} />
            </button>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="flex min-h-screen flex-col bg-white pb-10">
      <header className="flex items-center gap-3 px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">User Profile</h1>
      </header>

      <main className="flex-1 space-y-5 px-5 pt-5">
        <div className="flex items-center gap-3 rounded-2xl bg-[#F3F7EE] p-4">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-11 w-11 rounded-full object-cover"
          />
          <div>
            <p className="font-bold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-400">ID: {user.custId}</p>
          </div>
          <span className="ml-auto">
            <StatusPill label={user.status} />
          </span>
        </div>

        {renderSection('ACCOUNT', accountRows)}
        {renderSection('REFERRAL', referralRows)}
        {renderSection('WALLET & TRANSACTIONS', walletRows)}
        {renderSection('COMMUNICATION', commsRows)}
      </main>
    </div>
  );
}