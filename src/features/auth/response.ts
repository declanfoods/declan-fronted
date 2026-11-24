interface AuthResult {
  success?: boolean;
  message?: string;
}

interface SignInDetails {
  accessToken?: string;
  token?: string;
  mustChangePassword?: boolean;
  isTemporaryPassword?: boolean;
}

export interface SignInResponse extends AuthResult, SignInDetails {
  data?: SignInDetails;
}

export function assertAuthSuccess(payload: AuthResult, fallback: string) {
  if (payload?.success === false) throw new Error(payload.message || fallback);
}

export function readSignInResult(payload: SignInResponse) {
  assertAuthSuccess(payload, 'Login failed. Please try again.');
  const details = payload?.data;
  const token = [details?.accessToken, details?.token, payload?.accessToken, payload?.token]
    .find((value) => typeof value === 'string' && value.trim());

  if (!token) throw new Error('Login failed: no token received.');

  return {
    token,
    mustChangePassword: details?.mustChangePassword ?? details?.isTemporaryPassword ??
      payload?.mustChangePassword ?? payload?.isTemporaryPassword ?? false,
  };
}
