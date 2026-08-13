import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Landmark, Clock } from 'lucide-react';
import ReferralLayout from './ReferralLayout';

export default function Withdraw() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Withdrawal request submitted (mock — no endpoint yet)');
    navigate('/app/referrals');
  };

  return (
    <ReferralLayout>
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between md:hidden">
          <button onClick={() => navigate(-1)} className="text-primary">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-base font-bold text-primary">Withdraw Funds</h1>
          <span className="w-6" />
        </div>

        <h1 className="mb-6 hidden text-2xl font-bold text-primary md:block">
          Withdraw Funds
        </h1>

        {/* Balance card */}
        <div className="mb-6 rounded-2xl bg-primary p-5 text-white">
          <p className="text-sm">Available for Withdrawal</p>
          <p className="mt-1 text-3xl font-bold">₦40,000</p>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs">
            ⓘ Minimum: ₦40,000
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">
              Amount to Withdraw
            </label>
            <div className="flex items-center rounded-xl border border-gray-300 bg-white px-4 py-3">
              <span className="mr-2 font-bold text-primary">₦</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent outline-none"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">
              Destination Bank
            </label>
            <div className="flex items-center rounded-xl border border-gray-300 bg-white px-4 py-3">
              <Landmark size={18} className="mr-2 text-primary" />
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="flex-1 bg-transparent outline-none"
                required
              >
                <option value="">Select bank</option>
                <option>GTBank</option>
                <option>Access Bank</option>
                <option>UBA</option>
                <option>Zenith Bank</option>
                <option>First Bank</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">
              Account Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              maxLength={10}
              placeholder="10 digits"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">
              Account Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Verified Name"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-primary"
              required
            />
          </div>

          <div className="rounded-2xl bg-primary/10 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Clock size={16} /> Processing Time
            </p>
            <p className="mt-1 text-xs text-primary/80">
              Estimated Arrival: 2-3 business days depending on bank performance
            </p>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-primary py-4 text-base font-bold text-white hover:bg-primary-dark"
          >
            Confirm Withdrawal
          </button>
        </form>
      </div>
    </ReferralLayout>
  );
}