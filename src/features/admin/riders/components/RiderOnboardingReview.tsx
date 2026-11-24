import { CheckCircle2 } from 'lucide-react';
import AdminImageUpload from '../../../../components/admin/AdminImageUpload';
import type { RiderOnboardingFields } from '../onboardingForm';

interface RiderOnboardingReviewProps extends RiderOnboardingFields {
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

export default function RiderOnboardingReview({ form, update, onBack, onSubmit, submitting }: RiderOnboardingReviewProps) {
  return (
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

      {form.isStudent && (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Student ID</p>
          <AdminImageUpload
            value={form.studentIdUrl}
            onChange={(url) => update('studentIdUrl', url)}
            heightClassName="h-28"
            helperText="Student ID"
          />
        </div>
      )}

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
      </div>

      <button
        type="button"
        disabled={submitting}
        onClick={onSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Complete Onboarding'}
        <CheckCircle2 size={16} />
      </button>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-600"
        >
          Back
        </button>
      </div>
    </>
  );
}
