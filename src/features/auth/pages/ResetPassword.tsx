import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import AuthBranding from '../components/AuthBranding';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { authApi } from '../api';
import { assertAuthSuccess } from '../response';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userId = '' } = useParams();

  const token = searchParams.get('token') ?? '';

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!userId || !token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.resetPassword({ userId, token, newPassword: form.newPassword });
      assertAuthSuccess(data, 'Reset failed. Please try again.');
      navigate('/login', { state: { passwordReset: true } });
    } catch (error) {
      setError(getApiErrorMessage(error, 'Reset failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout headline="Set new password">
      <AuthBranding />

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
        <AuthInput
          id="newPassword"
          name="newPassword"
          type="password"
          label="New Password"
          placeholder="New Password"
          value={form.newPassword}
          onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
          required
        />
        <AuthInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm New Password"
          placeholder="Confirm New Password"
          value={form.confirmPassword}
          onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          required
        />

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-full bg-primary py-5 text-2xl font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Reset Password'}
        </button>
      </form>
    </AuthLayout>
  );
}
