import AdminImageUpload from '../../../../components/admin/AdminImageUpload';
import type { RiderOnboardingFields } from '../onboardingForm';

interface RiderPersonalDetailsProps extends RiderOnboardingFields {
  onNext: () => void;
}

export default function RiderPersonalDetails({ form, update, onNext }: RiderPersonalDetailsProps) {
  return (
    <>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
        <p className="mt-1 text-sm text-gray-500">
          Please provide legal details to begin the onboarding process as a rider.
        </p>
      </div>

      <div className="flex justify-center">
        <AdminImageUpload
          value={form.profilePictureUrl}
          onChange={(url) => update('profilePictureUrl', url)}
          compact
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">Full Name</label>
        <input
          value={form.fullname}
          onChange={(e) => update('fullname', e.target.value)}
          placeholder="e.g. Samuel Adekunle"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">Date of Birth</label>
        <input
          type="date"
          value={form.dob}
          onChange={(e) => update('dob', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">Gender</label>
        <select
          value={form.gender}
          onChange={(e) => update('gender', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">Phone Number 1</label>
        <input
          value={form.phoneNumberOne}
          onChange={(e) => update('phoneNumberOne', e.target.value)}
          placeholder="+234 801 234 5678"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">Phone Number 2 (Optional)</label>
        <input
          value={form.phoneNumberTwo}
          onChange={(e) => update('phoneNumberTwo', e.target.value)}
          placeholder="+234 801 234 5678"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">Email Address</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="name@example.com"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">Residential Address</label>
        <textarea
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
          rows={3}
          placeholder="Street name, Building number, Area..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm text-gray-600">State</label>
          <input
            value={form.state}
            onChange={(e) => update('state', e.target.value)}
            placeholder="Select State"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600">LGA</label>
          <input
            value={form.lga}
            onChange={(e) => update('lga', e.target.value)}
            placeholder="Select LGA"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">Nearest Landmark</label>
        <input
          value={form.landmark}
          onChange={(e) => update('landmark', e.target.value)}
          placeholder="e.g. Opposite Central Station"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onNext}
          className="flex-1 rounded-full bg-primary py-3.5 text-sm font-semibold text-white"
        >
          Next
        </button>
      </div>
    </>
  );
}
