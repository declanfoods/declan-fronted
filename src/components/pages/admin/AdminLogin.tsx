import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import AuthLayout from '../../auth/AuthLayout';
import AuthInput from '../../auth/AuthInput';
import Logo from '../../ui/Logo';
import { adminApi } from '../../../app/lib/adminApi';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminApi.signIn({
        email: form.email,
        password: form.password,
      });

      const d = res.data as any;
      const token =
        d?.data?.accessToken ?? d?.data?.token ?? d?.accessToken ?? d?.token ?? null;

      if (!token) {
        setError('Login failed: no token received.');
        return;
      }

      localStorage.setItem('adminToken', token);
      localStorage.setItem('role', 'admin');
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout headline="Admin Console">
      <div className="flex flex-col items-center text-center">
        <Logo className="h-14 w-auto" />
        <div className="mt-3 flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary-dark">
          <ShieldCheck size={16} strokeWidth={2} />
          Declan Foods Admin
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
        <AuthInput
          id="email"
          name="email"
          type="email"
          label="Admin Email"
          placeholder="you@declanfoods.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />

        <AuthInput
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
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
          className="mt-2 w-full rounded-full bg-primary py-4 text-base font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-ink-soft">
          Restricted to authorized Declan Foods staff only.
        </p>
      </form>
    </AuthLayout>
  );
}
