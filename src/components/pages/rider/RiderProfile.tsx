import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  GraduationCap,
  Pencil,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Truck,
  CheckCircle2,
  Star,
} from 'lucide-react';
import RiderTopBar from './RiderTopBar';
import { riderApi, extractRiderProfile, type RiderProfile as RiderProfileType } from '../../../app/lib/riderApi';
import { logout } from '../../../app/lib/auth';

export default function RiderProfile() {
  const navigate = useNavigate();
  const [rider, setRider] = useState<RiderProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    riderApi
      .getProfile()
      .then((res) => setRider(extractRiderProfile(res.data.data)))
      .catch((err) => setError(err.response?.data?.message ?? 'Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/rider/login');
  };

  const studentInfo = rider?.studentInformation as
    | { institution?: string; faculty?: string; department?: string; matricNumber?: string }
    | null
    | undefined;

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <RiderTopBar title="Declan Rider" />

      <main className="flex-1 px-5 pt-4">
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-10 text-center text-sm text-gray-400">Loading profile...</p>
        ) : rider ? (
          <>
            <div className="flex flex-col items-center rounded-2xl bg-white p-6 shadow-sm">
              <img
                src={rider.profilePictureUrl || `https://i.pravatar.cc/120?u=${rider.id}`}
                alt={rider.fullname}
                className="h-24 w-24 rounded-full object-cover"
              />
              <h2 className="mt-4 text-xl font-bold text-gray-900">{rider.fullname}</h2>
              <p className="text-sm text-gray-400">Rider ID: {rider.id.slice(0, 8).toUpperCase()}</p>
              <div className="mt-2 flex gap-2">
                <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white">
                  <CheckCircle2 size={12} />
                  Verified
                </span>
                <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Online
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <Truck size={18} className="mx-auto text-primary" />
                <p className="mt-1 text-lg font-extrabold text-gray-900">
                  {(rider.totalDeliveries as number | undefined) ?? '—'}
                </p>
                <p className="text-[10px] text-gray-400">Deliveries</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <CheckCircle2 size={18} className="mx-auto text-primary" />
                <p className="mt-1 text-lg font-extrabold text-gray-900">
                  {(rider.completionRate as number | undefined) ?? '—'}%
                </p>
                <p className="text-[10px] text-gray-400">Completion</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <Star size={18} className="mx-auto text-amber-400" />
                <p className="mt-1 text-lg font-extrabold text-gray-900">
                  {(rider.rating as number | undefined) ?? '—'}
                </p>
                <p className="text-[10px] text-gray-400">Rating</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <User size={16} />
                <h3 className="text-sm font-bold">PERSONAL INFO</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone</span>
                  <span className="font-medium text-gray-800">{rider.phoneNumberOne}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="font-medium text-gray-800">{rider.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Address</span>
                  <span className="max-w-[60%] text-right font-medium text-gray-800">
                    {rider.address}
                  </span>
                </div>
              </div>
            </div>

            {rider.isStudent && (
              <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <GraduationCap size={16} />
                  <h3 className="text-sm font-bold">RIDER INFO</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type</span>
                    <span className="font-medium text-gray-800">Student</span>
                  </div>
                  {studentInfo?.institution && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Institution</span>
                      <span className="font-medium text-gray-800">{studentInfo.institution}</span>
                    </div>
                  )}
                  {studentInfo?.faculty && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Faculty</span>
                      <span className="font-medium text-gray-800">{studentInfo.faculty}</span>
                    </div>
                  )}
                  {studentInfo?.department && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dept</span>
                      <span className="font-medium text-gray-800">{studentInfo.department}</span>
                    </div>
                  )}
                  {studentInfo?.matricNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Matric No.</span>
                      <span className="font-medium text-gray-800">{studentInfo.matricNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-4 text-left"
              >
                <Pencil size={16} className="text-gray-400" />
                <span className="flex-1 text-sm font-medium text-gray-800">Edit Profile</span>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-4 text-left"
              >
                <Lock size={16} className="text-gray-400" />
                <span className="flex-1 text-sm font-medium text-gray-800">
                  Change Password/PIN
                </span>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-4 text-left"
              >
                <HelpCircle size={16} className="text-gray-400" />
                <span className="flex-1 text-sm font-medium text-gray-800">Help & Support</span>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-4 text-left text-red-500"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}