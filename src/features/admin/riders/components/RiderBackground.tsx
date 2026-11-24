import AdminImageUpload from '../../components/AdminImageUpload';
import type { RiderOnboardingFields } from '../onboardingForm';

interface RiderBackgroundProps extends RiderOnboardingFields {
  onBack: () => void;
  onNext: () => void;
}

export default function RiderBackground({ form, update, onBack, onNext }: RiderBackgroundProps) {
  return (
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
          onClick={onBack}
          className="flex-1 rounded-full border border-gray-200 py-3.5 text-sm font-semibold text-gray-600"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white"
        >
          Next Step
        </button>
      </div>
    </>
  );
}
