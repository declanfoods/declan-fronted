import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getApiErrorMessage } from '../../../../app/lib/api-types';
import RiderBackground from '../components/RiderBackground';
import RiderOnboardingReview from '../components/RiderOnboardingReview';
import RiderPersonalDetails from '../components/RiderPersonalDetails';
import { initialOnboardingForm, type RiderOnboardingForm } from '../onboardingForm';
import { useCreateRider } from '../queries';

export default function RiderOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialOnboardingForm);
  const createRider = useCreateRider();
  const [error, setError] = useState('');

  const update = <K extends keyof RiderOnboardingForm>(key: K, value: RiderOnboardingForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const percent = step === 1 ? 33 : step === 2 ? 66 : 100;

  const hasPersonalDetails = [form.fullname, form.email, form.phoneNumberOne, form.address]
    .every((value) => value.trim());

  const nextFromPersonalDetails = () => {
    if (!hasPersonalDetails) {
      setError('Please complete personal information before continuing.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    if (createRider.isPending) return;
    setError('');

    try {
      await createRider.mutateAsync({
        fullname: form.fullname,
        email: form.email,
        phoneNumberOne: form.phoneNumberOne,
        phoneNumberTwo: form.phoneNumberTwo || undefined,
        address: form.address,
        isStudent: form.isStudent,
        profilePictureUrl: form.profilePictureUrl,
        dateOfBirth: form.dob,
        gender: form.gender,
        state: form.state,
        lga: form.lga,
        nearestLandmark: form.landmark,
        emergencyContact: {
          contactName: form.emergencyName,
          phoneNumber: form.emergencyPhone,
          relationship: form.emergencyRelationship,
          address: form.emergencyAddress,
        },
        studentInfo: form.isStudent
          ? {
              institution: form.institution || undefined,
              faculty: form.faculty,
              department: form.department,
              level: form.level,
              matricNumber: form.matricNumber,
              studentIdUrl: form.studentIdUrl,
            }
          : undefined,
      });
      navigate('/admin/riders');
    } catch (error) {
      setError(getApiErrorMessage(error, 'Failed to onboard rider.'));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4">
        <button
          type="button"
          aria-label="Go back"
          disabled={createRider.isPending}
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
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        {step === 1 && (
          <RiderPersonalDetails form={form} update={update} onNext={nextFromPersonalDetails} />
        )}
        {step === 2 && (
          <RiderBackground
            form={form}
            update={update}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <RiderOnboardingReview
            form={form}
            update={update}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            submitting={createRider.isPending}
          />
        )}
      </main>
    </div>
  );
}
