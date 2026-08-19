// src/features/auth/Login.tsx
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../auth/AuthLayout';
import AuthInput from '../../auth/AuthInput';
import AuthBranding from '../../auth/AuthBranding';
import { authApi } from '../../../app/lib/authApi';
import { cartApi } from '../../../app/lib/cartApi';
import { guestCart } from '../../../app/lib/guestCart';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const res = await authApi.signIn({
      email: form.email,
      password: form.password,
    });

    const accessToken = res.data.data.accessToken;

    if (!accessToken) {
      setError('Login failed: no token received.');
      return;
    }

    localStorage.setItem('token', accessToken);

    const pendingItems = guestCart.toMergePayload();
    if (pendingItems.length > 0) {
      try {
        await cartApi.mergeCart(pendingItems);
        guestCart.clear();
      } catch {
        // non-fatal — user keeps their existing account cart if merge fails
      }
    }

    navigate('/app');
  } catch (err: any) {
    setError(err.response?.data?.message ?? 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <AuthLayout headline="Welcome back!">
      <AuthBranding />

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
        <AuthInput
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-lg font-semibold text-primary">
              Password
            </label>
            <Link to="/forgot-password" className="text-base font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <AuthInput
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-lg text-ink">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))}
            className="h-5 w-5 cursor-pointer accent-primary"
          />
          Remember me
        </label>

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
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-6 text-center text-base text-ink">
        New here?{' '}
        <Link to="/signup" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}