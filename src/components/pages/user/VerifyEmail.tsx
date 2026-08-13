import { Link, useLocation } from 'react-router-dom';
import AuthLayout from '../../auth/AuthLayout';
import AuthBranding from '../../auth/AuthBranding';

export default function VerifyEmail() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? 'your email';

  return (
    <AuthLayout headline="Verify your email">
      <AuthBranding />

      <div className="mt-10 rounded-2xl border border-primary bg-primary/5 px-6 py-8 text-center">
        <p className="text-lg font-semibold text-primary">
          Check your inbox!
        </p>

        <p className="mt-2 text-sm text-ink">
          We've sent a verification link to{' '}
          <span className="font-semibold">{email}</span>.
        </p>

        <p className="mt-4 text-sm text-ink">
          Click the verification link in the email to activate your account.
        </p>

        <Link
          to="/login"
          className="mt-6 inline-block font-semibold text-primary hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
}