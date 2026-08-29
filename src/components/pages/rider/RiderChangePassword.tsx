import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import RiderTopBar from './RiderTopBar';
import { riderApi } from '../../../app/lib/riderApi';

export default function RiderChangePassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forced = searchParams.get('forced') === '1';

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setnewPasswordConfirmation] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== newPasswordConfirmation) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await riderApi.changePassword({ oldPassword, newPassword, newPasswordConfirmation });
      navigate('/rider/home');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to change password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE]">
      {forced ? (
        <header className="flex items-center gap-3 border-b border-primary/10 bg-[#F3F7EE] px-4 py-4">
          <h1 className="text-lg font-bold text-primary">Set a New Password</h1>
        </header>
      ) : (
        <RiderTopBar title="Change Password" />
      )}

      <main className="flex-1 px-5 pt-4">
        {forced && (
          <div className="mb-5 flex gap-2 rounded-2xl bg-orange-50 p-4">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-orange-500" />
            <p className="text-sm text-orange-700">
              You're signed in with a temporary password. Please set a new password before
              continuing.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {forced ? 'Temporary Password' : 'Current Password'}
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full bg-transparent text-sm text-gray-800 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowOld((v) => !v)}
                aria-label={showOld ? 'Hide password' : 'Show password'}
                className="text-gray-400"
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-transparent text-sm text-gray-800 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
                className="text-gray-400"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPasswordConfirmation}
                onChange={(e) => setnewPasswordConfirmation(e.target.value)}
                required
                className="w-full bg-transparent text-sm text-gray-800 outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-primary py-4 text-base font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </main>
    </div>
  );
}