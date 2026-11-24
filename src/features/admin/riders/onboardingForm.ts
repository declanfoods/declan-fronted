export type RiderOnboardingForm = {
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
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  emergencyAddress: string;
};

export const initialOnboardingForm: RiderOnboardingForm = {
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
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
  emergencyAddress: '',
};

export interface RiderOnboardingFields {
  form: RiderOnboardingForm;
  update: <K extends keyof RiderOnboardingForm>(key: K, value: RiderOnboardingForm[K]) => void;
}
