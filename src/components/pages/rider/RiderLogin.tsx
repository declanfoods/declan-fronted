import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logo from '../../../assets/brandlogo.png';
import { riderApi } from '../../../app/lib/riderApi';

export default function RiderLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const res = await riderApi.signIn({ email, password });
    const d = res.data as any;
    
    // accessToken based on same backend pattern
    const token =
      d?.data?.accessToken ??
      d?.data?.token ??
      d?.accessToken ??
      d?.token ??
      null;

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
    <div className="flex min-h-screen flex-col bg-white px-6 pt-6 sm:items-center sm:justify-center">
      <div className="w-full sm:max-w-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-8 text-ink"
          aria-label="Go back"
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </button>

        <div className="mb-8 flex justify-center">
          <img src={logo} alt="Declan Foods" className="w-48 sm:w-56" />
        </div>

        <h1 className="mb-6 text-2xl font-bold text-ink">Declan Rider Login</h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rider@example.com"
              required
              className="w-full rounded-xl border border-primary px-4 py-3 text-sm text-ink outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border border-primary px-4 py-3 text-sm text-ink outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary/30"
            />
          </div>

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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}