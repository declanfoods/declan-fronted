import type { ReferralCodeData } from './api';

/** The name-bearing part of GET /api/v1/users/profile-overview. */
export interface ProfileNameSource {
  fullname?: string | null;
  email?: string | null;
  profile?: { firstName?: string | null; lastName?: string | null } | null;
}

export interface DisplayNameSources {
  /** GET /api/v1/users/profile-overview — the one that has a real name. */
  profileOverview?: ProfileNameSource | null;
  /** GET /api/v1/referrals/code — fallback; `profile` is usually null here. */
  referralCode?: ReferralCodeData | null;
}

function nameFromProfile(profile?: ProfileNameSource | null): string {
  const first = profile?.profile?.firstName?.trim();
  const last = profile?.profile?.lastName?.trim();

  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (last) return last;
  if (profile?.fullname?.trim()) return profile.fullname.trim();

  return '';
}

function nameFromReferralCode(code?: ReferralCodeData | null): string {
  const first = code?.user?.profile?.firstName?.trim();
  const last = code?.user?.profile?.lastName?.trim();

  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (last) return last;

  return '';
}

export function deriveDisplayName(sources?: DisplayNameSources | null): string {
  const fromProfile = nameFromProfile(sources?.profileOverview);
  if (fromProfile) return fromProfile;

  const fromCode = nameFromReferralCode(sources?.referralCode);
  if (fromCode) return fromCode;

  const local = (
    sources?.profileOverview?.email ?? sources?.referralCode?.user?.email
  )
    ?.split('@')[0]
    ?.trim();
  if (local) return local.charAt(0).toUpperCase() + local.slice(1);

  return '';
}

export function deriveFirstName(sources?: DisplayNameSources | null): string {
  const full = nameFromProfile(sources?.profileOverview) || nameFromReferralCode(sources?.referralCode);
  if (full) return full.split(' ')[0];

  const local = (
    sources?.profileOverview?.email ?? sources?.referralCode?.user?.email
  )
    ?.split('@')[0]
    ?.trim();
  if (local) return local.charAt(0).toUpperCase() + local.slice(1);

  return 'there';
}
