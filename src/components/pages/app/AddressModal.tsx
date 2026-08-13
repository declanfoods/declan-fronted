import { useState, useEffect } from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';
import {
  addressApi,
  type DeliveryAddress,
  type AddressPayload,
} from '../../../app/lib/addressApi';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  address?: DeliveryAddress | null;
  defaultEmail?: string;
  defaultPhone?: string;
}

export default function AddressModal({
  isOpen,
  onClose,
  onSaved,
  address,
  defaultEmail = '',
  defaultPhone = '',
}: AddressModalProps) {
  const isEdit = !!address;

  const [form, setForm] = useState<AddressPayload>({
    fullName: '',
    addressLine: '',
    state: '',
    country: 'Nigeria',
    phoneNumber: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (address) {
      setForm({
        fullName: address.nameOfCustomer ?? '',
        addressLine: address.addressLine ?? '',
        state: address.state ?? '',
        country: address.country ?? 'Nigeria',
        phoneNumber: address.phoneNumber ?? defaultPhone,
        email: address.emailAddress ?? defaultEmail,
      });
    } else {
      setForm({
        fullName: '',
        addressLine: '',
        state: '',
        country: 'Nigeria',
        phoneNumber: defaultPhone,
        email: defaultEmail,
      });
    }
    setError('');
    setConfirmDelete(false);
  }, [address, isOpen, defaultEmail, defaultPhone]);

  if (!isOpen) return null;

  const update = (key: keyof AddressPayload, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit && address) {
        await addressApi.updateAddress(address.id, form);
      } else {
        await addressApi.createAddress(form);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!address) return;
    setDeleting(true);
    try {
      await addressApi.deleteAddress(address.id);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to delete address.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">
            {isEdit ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Confirm delete overlay */}
        {confirmDelete ? (
          <div className="rounded-2xl bg-red-50 p-5 text-center">
            <p className="text-base font-semibold text-red-700">
              Delete this address?
            </p>
            <p className="mt-1 text-sm text-red-500">This can't be undone.</p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm font-semibold text-ink hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name" required>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                placeholder="Jane Doe"
                required
                className="input"
              />
            </Field>

            <Field label="Address Line" required>
              <input
                type="text"
                value={form.addressLine}
                onChange={(e) => update('addressLine', e.target.value)}
                placeholder="38 Oke Arula Street"
                required
                className="input"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="State" required>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => update('state', e.target.value)}
                  placeholder="Lagos"
                  required
                  className="input"
                />
              </Field>
              <Field label="Country" required>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => update('country', e.target.value)}
                  placeholder="Nigeria"
                  required
                  className="input"
                />
              </Field>
            </div>

            <Field label="Phone Number" required>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => update('phoneNumber', e.target.value)}
                placeholder="+2348012345678"
                required
                className="input"
              />
            </Field>

            <Field label="Email" required>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com"
                required
                className="input"
              />
            </Field>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-base font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
              >
                {saving && <Loader2 size={18} className="animate-spin" />}
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Address'}
              </button>

              {isEdit && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-red-300 py-3 text-sm font-semibold text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={16} /> Delete Address
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Reusable field styles */}
      <style>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #d1d5db;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus {
          border-color: rgb(var(--primary) / 1);
          box-shadow: 0 0 0 2px rgb(var(--primary) / 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}