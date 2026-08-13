// src/features/auth/ForgotPassword.tsx
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../auth/AuthLayout';
import AuthInput from '../../auth/AuthInput';
import AuthBranding from '../../auth/AuthBranding';
import { authApi } from '../../../app/lib/authApi';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout headline="Reset your password">
      <AuthBranding />

      {sent ? (
        <div className="mt-10 rounded-2xl border border-primary bg-primary/5 px-6 py-8 text-center">
          <p className="text-lg font-semibold text-primary">Check your inbox!</p>
          <p className="mt-2 text-sm text-ink">
            We've sent a password reset link to{' '}
            <span className="font-semibold">{email}</span>.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block font-semibold text-primary hover:underline"
          >
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
          <p className="text-base text-ink">
            Enter the email address linked to your account and we'll send you a reset link.
          </p>

          <AuthInput
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-primary py-5 text-2xl font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <p className="text-center text-base text-ink">
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}