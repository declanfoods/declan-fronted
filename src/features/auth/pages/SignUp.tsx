import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import AuthBranding from '../components/AuthBranding';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { authApi } from '../api';
import { assertAuthSuccess } from '../response';
import { useToast } from '../../../shared/ui/Toast';

export default function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') ?? '';

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    referralCode,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const updatePhoneNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, '');
    const subscriberNumber = digits.replace(/^234(?=\d{10}$)|^0(?=\d{10}$)/, '').slice(0, 10);
    setForm((current) => ({ ...current, phoneNumber: subscriberNumber }));
  };

  const update = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.phoneNumber.length !== 10) {
      setError('Please enter a valid Nigerian phone number.');
      return;
    }

    setLoading(true);
    try {
      const normalizedPhoneNumber = `+234${form.phoneNumber}`;

      const { data } = await authApi.signUp({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: normalizedPhoneNumber,
        password: form.password,
        ...(form.referralCode ? { referralCode: form.referralCode } : {}),
      });

      assertAuthSuccess(data, 'Sign up failed. Please try again.');
      navigate('/verify-email', { state: { email: form.email } });
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Sign up failed. Please try again.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout headline="Create your account">
      <AuthBranding />

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <AuthInput
          id="firstName"
          name="firstName"
          label="First Name"
          placeholder="First Name"
          value={form.firstName}
          onChange={update('firstName')}
          required />

          <AuthInput
          id="lastName"
          name="lastName"
          label="Last Name"
          placeholder="Last Name"
          value={form.lastName}
          onChange={update('lastName')}
          required />
        </div>

        <AuthInput
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="Email"
          value={form.email}
          onChange={update('email')}
          required
        />

        <AuthInput
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          inputMode="numeric"
          prefix="+234"
          label="WhatsApp Number"
          placeholder="8012345678"
          value={form.phoneNumber}
          onChange={updatePhoneNumber}
          className="min-w-0 flex-1 px-4 py-3 outline-none"
          required
        />

        <AuthInput
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Password"
          value={form.password}
          onChange={update('password')}
          required
        />

        <AuthInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm password"
          placeholder="Confirm password"
          value={form.confirmPassword}
          onChange={update('confirmPassword')}
          required
        />

        <AuthInput
          id="referralCode"
          name="referralCode"
          label="Referral Code (Optional)"
          placeholder="Referral Code (Optional)"
          value={form.referralCode}
          onChange={update('referralCode')}
          readOnly={Boolean(searchParams.get('ref'))}
        />

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
