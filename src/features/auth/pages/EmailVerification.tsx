import { useEffect, useRef, useState } from 'react';
import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import AuthBranding from '../components/AuthBranding';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { authApi } from '../api';
import { assertAuthSuccess } from '../response';

export default function EmailVerification() {
  const navigate = useNavigate();
  const { userId = '' } = useParams();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') ?? '';

  const [error, setError] = useState('');
  const currentRequest = useRef<{
    userId: string;
    token: string;
    promise: ReturnType<typeof authApi.verifyEmail>;
  } | null>(null);

  useEffect(() => {
    if (!userId || !token) return;

    let active = true;
    setError('');
    if (currentRequest.current?.userId !== userId || currentRequest.current?.token !== token) {
      currentRequest.current = { userId, token, promise: authApi.verifyEmail({ userId, token }) };
    }

    const verify = async () => {
      try {
        const response = await currentRequest.current?.promise;
        if (!active || !response) return;

        assertAuthSuccess(response.data, 'Verification failed. Please try again.');
        navigate('/login', { replace: true, state: { verified: true } });
      } catch (error) {
        if (active) setError(getApiErrorMessage(error, 'Verification failed. Please try again.'));
      }
    };

    void verify();
    return () => {
      active = false;
    };
  }, [navigate, token, userId]);

  const verificationError = !userId || !token ? 'Invalid verification link.' : error;

  return (
    <AuthLayout headline="Verifying your email">
      <AuthBranding />

      {verificationError ? (
        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="text-lg font-semibold text-red-600">
            Verification Failed
          </p>

          <p className="mt-2 text-sm text-red-500">
            {verificationError}
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
