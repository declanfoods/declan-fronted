// src/features/auth/SignUp.tsx
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../auth/AuthLayout';
import AuthInput from '../../auth/AuthInput';
import AuthBranding from '../../auth/AuthBranding';
import { authApi } from '../../../app/lib/authApi';
import { useToast } from '../../ui/Toast';






export default function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref") ?? '';

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    referralCode: referralCode,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  

  const updatePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    let value = e.target.value.replace(/\D/g, '');

    // Allow users to paste 08012345678
    // but remove the leading 0.
    if (value.length === 11 && value.startsWith('0')) {
      value = value.slice(1);
    }

    // Only allow the 10-digit Nigerian subscriber number.
    value = value.slice(0, 10);

    const normalizedPhone = `+234${form.phoneNumber}`;

    if (value.length !== 10 && !/^(\+234)(70|80|81|90|91)\d{8}$/.test(normalizedPhone)) {
      setError('Please enter a valid Nigerian phone number.');
      
    } else {
      setError("")
    }
    
    setForm((f) => ({
      ...f,
      phoneNumber: value,
    }));
  };

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

    if (form.phoneNumber.length !== 10) {
      setError("Invalid nigerian phone number")
    }

    setLoading(true);
    try {
      const normalizedPhoneNumber = "+234" + form.phoneNumber;

       await authApi.signUp({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: normalizedPhoneNumber,
        password: form.password,
        ...(form.referralCode ? { referralCode: form.referralCode } : {}),
      });

      // Pass email so verify page can show it
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err: any) {
      // setError(err.response?.data?.message ?? 'Sign up failed. Please try again.');
      showToast(
      err.response?.data?.message ??
        'Sign up failed. Please try again.',
      'error',
    );
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
          label="Whatsaap Number" 
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