// rider/pages/RiderProfile.tsx
import { User, Mail, MapPin, Phone, Pencil } from 'lucide-react';
import RiderLayout from './RiderLayout';

const profile = {
  name: 'Daniel Alex',
  email: 'danielalex@example.com',
  address: '6, Johnson Street, Surulere, Lagos',
  phone1: '+234 9093742439',
  phone2: '+234 9093742439',
  memberSince: '3/30/2026',
};

export default function RiderProfile() {
  return (
    <RiderLayout>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-ink">My Profile</h2>
          <p className="text-sm text-gray-500">Manage your account information</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          <Pencil size={14} strokeWidth={2} />
          Edit Profile
        </button>
      </div>

      <div className="space-y-4">
        {/* Profile photo card */}
        <div className="rounded-2xl border border-gray-200 px-6 py-6">
          <p className="mb-4 text-sm font-semibold text-primary">Profile Photo</p>
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
              <User size={40} className="text-primary" strokeWidth={1.5} />
            </div>
          </div>
          <hr className="my-4 border-gray-200" />
          <p className="text-xs text-gray-500">Member since</p>
          <p className="text-sm font-semibold text-ink">{profile.memberSince}</p>
        </div>

        {/* Personal info */}
        <div className="rounded-2xl border border-gray-200 px-6 py-6">
          <p className="mb-4 text-sm font-semibold text-primary">Personal Information</p>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <User size={14} strokeWidth={2} />
                Full Name
              </div>
              <p className="mt-1 text-sm font-semibold text-ink">{profile.name}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Mail size={14} strokeWidth={2} />
                Email Address
              </div>
              <p className="mt-1 text-sm font-semibold text-ink">{profile.email}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin size={14} strokeWidth={2} />
                Address
              </div>
              <p className="mt-1 text-sm font-semibold text-ink">{profile.address}</p>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="rounded-2xl border border-gray-200 px-6 py-6">
          <p className="mb-4 text-sm font-semibold text-primary">Contact Information</p>
          <div className="space-y-4">
            {[profile.phone1, profile.phone2].map((phone, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone size={14} strokeWidth={2} />
                  Phone Number {i + 1}
                </div>
                <p className="mt-1 text-sm font-semibold text-ink">{phone}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RiderLayout>
  );
}