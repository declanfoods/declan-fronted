// src/features/auth/SignUp.tsx
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../auth/AuthLayout';
import AuthInput from '../../auth/AuthInput';
import AuthBranding from '../../auth/AuthBranding';
import { authApi } from '../../../app/lib/authApi';
export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
       await authApi.signUp({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
        ...(form.referralCode ? { referralCode: form.referralCode } : {}),
      });
      // Pass email so verify page can show it
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout headline="Create your account">
      <AuthBranding />

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <AuthInput id="firstName" name="firstName" label="First Name" placeholder="First Name" value={form.firstName} onChange={update('firstName')} required />
          <AuthInput id="lastName" name="lastName" label="Last Name" placeholder="Last Name" value={form.lastName} onChange={update('lastName')} required />
        </div>

        <AuthInput id="email" name="email" type="email" label="Email" placeholder="Email" value={form.email} onChange={update('email')} required />
        <AuthInput id="phoneNumber" name="phoneNumber" type="tel" label="Phone Number" placeholder="08012345678" value={form.phoneNumber} onChange={update('phoneNumber')} required />
        <AuthInput id="password" name="password" type="password" label="Password" placeholder="Password" value={form.password} onChange={update('password')} required />
        <AuthInput id="confirmPassword" name="confirmPassword" type="password" label="Confirm password" placeholder="Confirm password" value={form.confirmPassword} onChange={update('confirmPassword')} required />
        <AuthInput id="referralCode" name="referralCode" label="Referral Code (Optional)" placeholder="Referral Code (Optional)" value={form.referralCode} onChange={update('referralCode')} />

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-full bg-primary py-5 text-2xl font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p className="mt-6 text-center text-base text-ink">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}