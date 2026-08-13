import { useEffect, useState } from 'react';
import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import AuthLayout from '../../auth/AuthLayout';
import AuthBranding from '../../auth/AuthBranding';
import { authApi } from '../../../app/lib/authApi';

export default function EmailVerification() {
  const navigate = useNavigate();
  const { userId = '' } = useParams();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') ?? '';

  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        await authApi.verifyEmail({
          userId,
          token,
        });

        navigate('/login', {
          replace: true,
          state: { verified: true },
        });
      } catch (err: any) {
        setError(
          err.response?.data?.message ??
            'Verification failed. Please try again.'
        );
      }
    };

    if (userId && token) {
      verify();
    } else {
      setError('Invalid verification link.');
    }
  }, [navigate, token, userId]);

  return (
    <AuthLayout headline="Verifying your email">
      <AuthBranding />

      {error ? (
        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="text-lg font-semibold text-red-600">
            Verification Failed
          </p>

          <p className="mt-2 text-sm text-red-500">
            {error}
          </p>
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-primary bg-primary/5 px-6 py-8 text-center">
          <p className="text-lg font-semibold text-primary">
            Verifying your email...
          </p>

          <p className="mt-2 text-sm text-ink">
            Please wait while we activate your account.
          </p>
        </div>
      )}
    </AuthLayout>
  );
}