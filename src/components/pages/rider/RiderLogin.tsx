import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { riderApi } from '../../../app/lib/riderApi';

export default function RiderLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await riderApi.signIn({ email, password });
      const d = res.data as any;
      const token = d?.data?.accessToken ?? d?.data?.token ?? d?.accessToken ?? d?.token ?? null;

      if (!token) {
        setError('Login failed: no token received.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('role', 'rider');
      navigate('/rider/home');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] px-6 pt-10 sm:items-center sm:justify-center">
      <div className="w-full sm:max-w-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white">
            <Truck size={22} strokeWidth={2} />
          </span>
          <span className="text-xl font-bold text-primary">Declan Rider</span>
        </div>

        <h1 className="mt-8 text-3xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to manage your deliveries.</p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rider@example.com"
                required
                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Password or PIN
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Remember me
            </label>
            <span className="text-sm font-semibold text-primary">Forgot Password?</span>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary py-4 text-base font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm font-semibold text-primary">Need Help?</p>

        <div className="mt-8 flex items-start gap-2 border-t border-gray-200 pt-5 text-xs text-gray-400">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" />
          Your rider account is protected and only authorized riders can access delivery
          information.
        </div>
      </div>
    </div>
  );
}