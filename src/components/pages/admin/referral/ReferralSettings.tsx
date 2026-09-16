import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, UserPlus, ShoppingBag, Settings2, Save, Minus, Plus, Landmark } from 'lucide-react';
import ReferralBottomNav from '../../../admin/ReferralBottomNav';

const codeFormats = ['USER+RANDOM', 'NAME+YEAR', 'GENERIC+UID'];
const linkExpiryOptions = ['Never', '6 Months'];

export default function ReferralSettings() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(true);
  const [signupRewardOn, setSignupRewardOn] = useState(true);
  const [signupAmount, setSignupAmount] = useState(500);
  const [purchaseBonusOn, setPurchaseBonusOn] = useState(true);
  const [bonus, setBonus] = useState('1000');
  const [minPurchase, setMinPurchase] = useState('5000');
  const [qualificationDays, setQualificationDays] = useState('30 Days');
  const [codeFormat, setCodeFormat] = useState('USER+RANDOM');
  const [linkExpiry, setLinkExpiry] = useState('Never');

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center justify-between bg-white px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <h1 className="text-lg font-bold text-primary-dark">Referral &amp; Rewards</h1>
        </div>
        <img
          src="https://i.pravatar.cc/60?img=5"
          alt="Admin"
          className="h-8 w-8 rounded-full object-cover"
        />
      </header>

      <main className="flex-1 space-y-5 px-5 pt-5">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Program Configuration</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage how rewards are calculated and issued to your members.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F7EE] text-primary">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">Enable Referral Program</p>
              <p className="text-xs text-gray-400">Global switch for system</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEnabled((v) => !v)}
            className={`h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                enabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus size={18} className="text-primary" />
              <p className="text-sm font-bold text-gray-900">Signup Reward</p>
            </div>
            <button
              type="button"
              onClick={() => setSignupRewardOn((v) => !v)}
              className={`h-6 w-11 rounded-full transition-colors ${
                signupRewardOn ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                  signupRewardOn ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {signupRewardOn && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs text-gray-500">Reward Amount (₦)</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSignupAmount((v) => Math.max(0, v - 50))}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3F7EE] text-gray-600"
                >
                  <Minus size={16} />
                </button>
                <div className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-center font-semibold text-gray-800">
                  {signupAmount}
                </div>
                <button
                  type="button"
                  onClick={() => setSignupAmount((v) => v + 50)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3F7EE] text-gray-600"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-primary" />
              <p className="text-sm font-bold text-gray-900">Referral Purchase Bonus</p>
            </div>
            <button
              type="button"
              onClick={() => setPurchaseBonusOn((v) => !v)}
              className={`h-6 w-11 rounded-full transition-colors ${
                purchaseBonusOn ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                  purchaseBonusOn ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {purchaseBonusOn && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs text-gray-500">Bonus (₦)</label>
                  <input
                    value={bonus}
                    onChange={(e) => setBonus(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-gray-500">Min Purchase (₦)</label>
                  <input
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-gray-500">Qualification Period (Days)</label>
                <select
                  value={qualificationDays}
                  onChange={(e) => setQualificationDays(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none"
                >
                  {['15 Days', '30 Days', '60 Days'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Settings2 size={18} className="text-primary" />
            <p className="text-sm font-bold text-gray-900">Advanced Logic</p>
          </div>

          <label className="mb-1.5 block text-xs text-gray-500">Referral Code Format</label>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {codeFormats.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setCodeFormat(f)}
                className={`rounded-full py-2.5 text-xs font-bold ${
                  codeFormat === f
                    ? 'bg-primary text-white'
                    : 'border border-gray-200 text-gray-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <label className="mb-1.5 block text-xs text-gray-500">Link Expiry</label>
          <div className="grid grid-cols-2 gap-2">
            {linkExpiryOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setLinkExpiry(opt)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
                  linkExpiry === opt
                    ? 'border-primary text-primary'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                    linkExpiry === opt ? 'border-primary' : 'border-gray-300'
                  }`}
                >
                  {linkExpiry === opt && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/referrals/settings/withdrawal')}
          className="flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Landmark size={16} className="text-primary" />
            Withdrawal Settings
          </span>
          <span className="text-xs font-semibold text-primary">Configure →</span>
        </button>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-white"
        >
          <Save size={16} />
          Save Changes
        </button>
      </main>

      <ReferralBottomNav />
    </div>
  );
}