import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogOut, ChevronRight } from 'lucide-react';
import RiderLayout from './RiderLayout';
import { riderApi, type RiderProfile as RiderProfileData } from '../../../app/lib/riderApi';
import { logout } from '../../../app/lib/auth';
export default function RiderProfile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/rider/login');
  };

  const [profile, setProfile] = useState<RiderProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    riderApi
      .getProfile()
      .then((res) => {
        console.log('RIDER PROFILE API RESPONSE:', res.data);

        const rider = res.data.data.rider;

        if (!rider) {
          throw new Error('Rider profile was not found in the response.');
        }

        setProfile(rider);
      })
      .catch((err) => {
        console.error('Failed to load rider profile:', err);

        setError(
          err.response?.data?.message ??
            err.message ??
            'Failed to load rider profile.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <RiderLayout>
        <div className="py-10 text-center text-sm text-gray-400">
          Loading profile...
        </div>
      </RiderLayout>
    );
  }

  if (error) {
    return (
      <RiderLayout>
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      </RiderLayout>
    );
  }

  if (!profile) {
    return (
      <RiderLayout>
        <div className="py-10 text-center text-sm text-gray-400">
          No profile information available.
        </div>
      </RiderLayout>
    );
  }

  const initials = (profile.fullname || 'Rider')
    .trim()
    .split(/\s+/)
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <RiderLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">My Profile</h2>

        {/* Profile Header */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col items-center text-center">
            {profile.profilePictureUrl ? (
              <img
                src={profile.profilePictureUrl}
                alt={profile.fullname || 'Rider'}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {initials}
              </div>
            )}

            <h3 className="mt-3 text-lg font-bold text-gray-900">
              {profile.fullname || 'Rider'}
            </h3>

            <p className="text-sm text-gray-500">
              {profile.email || 'No email'}
            </p>

            {profile.isStudent && (
              <span className="mt-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Student Rider
              </span>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-gray-900">
            Personal Information
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400">Full Name</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {profile.fullname || '—'}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Email Address</p>
              <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                {profile.email || '—'}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Phone Number</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {profile.phoneNumberOne || '—'}
              </p>
            </div>

            {profile.phoneNumberTwo && (
              <div>
                <p className="text-xs text-gray-400">Alternative Phone</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {profile.phoneNumberTwo}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-400">Address</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {profile.address || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Student Information */}
        {profile.isStudent && profile.studentInformation && (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-gray-900">
              Student Information
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400">Level</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {profile.studentInformation.level || '—'}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Department</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {profile.studentInformation.department || '—'}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Matric Number</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {profile.studentInformation.matricNumber || '—'}
                </p>
              </div>
    
            </div>
          </div>
            )}

        {/* Account Actions */}
        <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
          <button
            type="button"
            onClick={() => navigate('/rider/change-password')}
            className="flex w-full items-center gap-3 px-5 py-4 text-left"
          >
            <Lock size={16} className="text-gray-400" />
            <span className="flex-1 text-sm font-medium text-gray-800">
              Change Password
            </span>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-5 py-4 text-left text-red-500"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

      </div>
    </RiderLayout>
  );
}