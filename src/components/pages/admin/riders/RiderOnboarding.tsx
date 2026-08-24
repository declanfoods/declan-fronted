import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, CheckCircle2 } from 'lucide-react';
import { adminRiderApi } from '../../../../app/lib/adminRiderApi';
import AdminImageUpload from '../../../admin/AdminImageUpload';

type FormState = {
  fullname: string;
  dob: string;
  gender: string;
  phoneNumberOne: string;
  phoneNumberTwo: string;
  email: string;
  address: string;
  state: string;
  lga: string;
  landmark: string;
  isStudent: boolean;
  institution: string;
  faculty: string;
  department: string;
  level: string;
  matricNumber: string;
  studentIdUrl: string;
  profilePictureUrl: string;
  governmentIdUrl: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  emergencyAddress: string;
  activateImmediately: boolean;
};

const initialState: FormState = {
  fullname: '',
  dob: '',
  gender: '',
  phoneNumberOne: '',
  phoneNumberTwo: '',
  email: '',
  address: '',
  state: '',
  lga: '',
  landmark: '',
  isStudent: true,
  institution: '',
  faculty: '',
  department: '',
  level: '',
  matricNumber: '',
  studentIdUrl: '',
  profilePictureUrl: '',
  governmentIdUrl: '',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
  emergencyAddress: '',
  activateImmediately: true,
};

export default function RiderOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const percent = step === 1 ? 33 : step === 2 ? 66 : 100;

  const handleSubmit = async () => {
    setError('');

    if (!form.fullname || !form.email || !form.phoneNumberOne || !form.address) {
      setError('Please complete personal information before submitting.');
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      await adminRiderApi.createDeliveryRider({
        fullname: form.fullname,
        email: form.email,
        phoneNumberOne: form.phoneNumberOne,
        phoneNumberTwo: form.phoneNumberTwo || undefined,
        address: form.address,
        isStudent: form.isStudent,
        profilePictureUrl: form.profilePictureUrl,
        studentInfo: form.isStudent
          ? {
              institution: form.institution,
              faculty: form.faculty,
              department: form.department,
              level: form.level,
              matricNumber: form.matricNumber,
              studentIdUrl: form.studentIdUrl,
            }
          : undefined,
      });
      navigate('/admin/riders');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to onboard rider.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4">
        <button
          type="button"
          onClick={() => (step === 1 ? navigate(-1) : setStep((s) => s - 1))}
          className="text-primary-dark"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Rider Hub</h1>
      </header>

      <main className="flex-1 space-y-5 px-5 pt-5">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-500">STEP {step} OF 3</span>
            <span className="text-primary">{percent}% Complete</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        {step === 1 && (
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
                className="flex-1 rounded-full border border-primary py-3.5 text-sm font-semibold text-primary"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 rounded-full bg-primary py-3.5 text-sm font-semibold text-white"
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Rider Information</h2>
              <p className="mt-1 text-sm text-gray-500">Tell us about your background.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => update('isStudent', true)}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-5 text-sm font-semibold ${
                  form.isStudent ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500'
                }`}
              >
                🎓 Student Rider
              </button>
              <button
                type="button"
                onClick={() => update('isStudent', false)}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-5 text-sm font-semibold ${
                  !form.isStudent ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500'
                }`}
              >
                💼 Non-Student
              </button>
            </div>

            {form.isStudent && (
              <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
                <div>
                  <label className="mb-1 block text-sm text-gray-600">Institution</label>
                  <input
                    value={form.institution}
                    onChange={(e) => update('institution', e.target.value)}
                    placeholder="University of Lagos"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Faculty</label>
                    <input
                      value={form.faculty}
                      onChange={(e) => update('faculty', e.target.value)}
                      placeholder="Engineering"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Department</label>
                    <input
                      value={form.department}
                      onChange={(e) => update('department', e.target.value)}
                      placeholder="Systems Eng."
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Level</label>
                    <select
                      value={form.level}
                      onChange={(e) => update('level', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary"
                    >
                      <option value="">Select Level</option>
                      {['100', '200', '300', '400', '500'].map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl} Level
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Matric No.</label>
                    <input
                      value={form.matricNumber}
                      onChange={(e) => update('matricNumber', e.target.value)}
                      placeholder="1708090XX"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-600">Student ID Verification</label>
                  <AdminImageUpload
                    value={form.studentIdUrl}
                    onChange={(url) => update('studentIdUrl', url)}
                    heightClassName="h-32"
                    helperText="Upload Student ID"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-full border border-gray-200 py-3.5 text-sm font-semibold text-gray-600"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white"
              >
                Next Step
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Verification &amp; Review</h2>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                Condensed Summary
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#F3F7EE] p-3">
                  <p className="text-xs text-gray-400">Rider Name</p>
                  <p className="text-sm font-bold text-gray-900">{form.fullname || '—'}</p>
                </div>
                <div className="rounded-xl bg-[#F3F7EE] p-3">
                  <p className="text-xs text-gray-400">Category</p>
                  <p className="text-sm font-bold text-gray-900">
                    {form.isStudent ? 'Student Rider' : 'Non-Student'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-gray-700">Document Uploads</p>
              <div className="grid grid-cols-2 gap-3">
                <AdminImageUpload
                  value={form.governmentIdUrl}
                  onChange={(url) => update('governmentIdUrl', url)}
                  heightClassName="h-28"
                  helperText="Government ID"
                />
                {form.isStudent && (
                  <AdminImageUpload
                    value={form.studentIdUrl}
                    onChange={(url) => update('studentIdUrl', url)}
                    heightClassName="h-28"
                    helperText="Student ID"
                  />
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Government ID isn&apos;t part of the create-rider payload yet — this uploads to
                storage but isn&apos;t sent to the backend until that field exists.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-semibold text-gray-700">Emergency Contact</p>
              <div className="space-y-3">
                <input
                  value={form.emergencyName}
                  onChange={(e) => update('emergencyName', e.target.value)}
                  placeholder="Contact Name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={form.emergencyRelationship}
                    onChange={(e) => update('emergencyRelationship', e.target.value)}
                    placeholder="Relationship"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
                  />
                  <input
                    value={form.emergencyPhone}
                    onChange={(e) => update('emergencyPhone', e.target.value)}
                    placeholder="Phone"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
                  />
                </div>
                <textarea
                  value={form.emergencyAddress}
                  onChange={(e) => update('emergencyAddress', e.target.value)}
                  placeholder="Address"
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Same as above — no emergency-contact field in the API yet, so this stays local
                for now.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-primary/10 p-4">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-primary" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Activate Rider Immediately</p>
                  <p className="text-xs text-gray-400">Profile goes live upon completion</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => update('activateImmediately', !form.activateImmediately)}
                className={`h-6 w-11 rounded-full transition-colors ${
                  form.activateImmediately ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                    form.activateImmediately ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Complete Onboarding'}
              <CheckCircle2 size={16} />
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-600"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-600"
              >
                Back
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
