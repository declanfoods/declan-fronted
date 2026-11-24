import { useNavigate } from 'react-router-dom';
import { LogIn, LogOut } from 'lucide-react';

import AppLayout from '../../../app/layouts/customer/AppLayout';
import PageIntro from '../../../app/layouts/customer/PageIntro';
import SplashLoader from '../../../shared/ui/SplashLoader';

import { userAvatarUrl } from '../api/userApi';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { logout, isAuthenticated } from '../../auth/session';
import ProfileAvatar from '../components/ProfileAvatar';
import ProfileOrders from '../components/ProfileOrders';
import ProfileReferrals from '../components/ProfileReferrals';
import SavedAddresses from '../components/SavedAddresses';

import { useCustomerProfile } from '../queries';

export default function ProfilePage() {
  const navigate = useNavigate();

  const authenticated = isAuthenticated();
  const profileQuery = useCustomerProfile();
  const profile = profileQuery.data;

  const firstName = profile?.profile?.firstName ?? '';
  const lastName = profile?.profile?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || profile?.email || 'User';

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // Loading

  if (authenticated && profileQuery.isPending) {
    return (
      <AppLayout title="My Profile" desktopNavigation className="lg:px-8 lg:pt-8">
        <SplashLoader />
      </AppLayout>
    );
  }

  // Not authenticated

  if (!authenticated) {
    return (
      <AppLayout title="My Profile" desktopNavigation className="lg:px-8 lg:pt-8">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
          <LogIn
            size={40}
            className="text-primary"
          />

          <p className="text-lg font-semibold text-ink">
            Login to view your profile
          </p>

          <p className="text-sm text-ink-soft">
            Sign in to manage your addresses, see
            your order history, and track referrals.
          </p>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Login
          </button>
        </div>
      </AppLayout>
    );
  }

  // Error

  if (!profile) {
    return (
      <AppLayout title="My Profile" desktopNavigation className="lg:px-8 lg:pt-8">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-lg font-semibold text-red-600">
            {getApiErrorMessage(profileQuery.error, 'Failed to load profile.')}
          </p>

          <button
            type="button"
            onClick={() => profileQuery.refetch()}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </AppLayout>
    );
  }

  // Main

  return (
    <AppLayout title="My Profile" desktopNavigation className="lg:px-8 lg:pt-8">
      <div className="relative mx-auto max-w-2xl lg:max-w-[76rem]">
        <div className="mb-8 hidden lg:block"><PageIntro title="My Profile" description="Manage your account and delivery addresses." /></div>

        {/* Decorative blobs */}

        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-6 h-28 w-28 rounded-full bg-blob-tan lg:hidden"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -left-6 bottom-20 h-24 w-24 rounded-full bg-primary/20 lg:hidden"
        />

        <div className="lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start lg:gap-8">
        <section aria-label="Account information" className="lg:rounded-3xl lg:border lg:border-[#e3e9df] lg:bg-[#fafbf7] lg:p-6">

        <ProfileAvatar
          key={profile.id}
          userId={profile.id}
          serverPhotoUrl={userAvatarUrl(profile)}
          fullName={fullName}
          initials={initials}
        />

        {/* Contact cards */}

        <div className="mt-8 flex flex-col gap-4">

          {/* Phone */}

          <div className="rounded-2xl border-2 border-primary bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3 text-primary">
              <span
                className="text-xl"
                aria-hidden
              >
                📱
              </span>

              <span className="text-sm font-bold uppercase tracking-wide">
                Phone Number
              </span>
            </div>

            <p className="mt-2 text-lg font-semibold text-ink">
              {profile?.phoneNumber ?? '—'}
            </p>

            <div className="mt-3 border-t border-muted/60" />
          </div>

          {/* Email */}

          <div className="rounded-2xl border-2 border-primary bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3 text-primary">
              <span
                className="text-xl"
                aria-hidden
              >
                ✉
              </span>

              <span className="text-sm font-bold uppercase tracking-wide">
                Email Address
              </span>
            </div>

            <p className="mt-2 break-all text-lg font-semibold text-ink">
              {profile?.email ?? '—'}
            </p>

            <div className="mt-3 border-t border-muted/60" />
          </div>
        </div>

        </section>
        <div className="min-w-0">
        {/* Orders */}

        <div className="mt-6 flex flex-col gap-3 lg:mt-0">
          <ProfileOrders />
          <ProfileReferrals />
        </div>

        {/* Saved Addresses */}

        <SavedAddresses
          key={profile.id}
          initialAddresses={profile.deliveryAddresses}
          fullName={fullName}
          email={profile.email}
          phone={profile.phoneNumber}
        />

        {/* Logout */}

        <button
          type="button"
          onClick={() => logout()}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-400 bg-white px-5 py-4 text-lg font-semibold text-red-500 shadow-sm transition-colors hover:bg-red-50"
        >
          <LogOut
            size={20}
            strokeWidth={2}
          />
          Logout
        </button>

        </div>
        </div>
      </div>
    </AppLayout>
  );
}
