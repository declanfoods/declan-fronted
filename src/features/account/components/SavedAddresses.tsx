import { useState } from 'react';
import { Edit2, Plus } from 'lucide-react';
import { addressApi, type DeliveryAddress } from '../api/addressApi';
import { refreshCustomerProfile } from '../queries';
import AddressModal from './AddressModal';

interface SavedAddressesProps {
  initialAddresses?: DeliveryAddress[];
  fullName: string;
  email?: string;
  phone?: string;
}

export default function SavedAddresses({
  initialAddresses,
  fullName,
  email,
  phone,
}: SavedAddressesProps) {
  const [addresses, setAddresses] = useState(initialAddresses ?? []);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>();
  const [refreshFailed, setRefreshFailed] = useState(false);

  const refreshAddresses = async () => {
    try {
      const { data } = await addressApi.getAddresses();
      setAddresses(data.data.deliveryAddresses ?? []);
      setRefreshFailed(false);
    } catch {
      setRefreshFailed(true);
    }
  };

  return (
    <div className="mt-6">

      <div className="flex items-center justify-between">

        <span className="flex items-center gap-2 text-base font-semibold text-ink">
          <span aria-hidden>📍</span>
          Saved Addresses
        </span>

        <button
          type="button"
          onClick={() => setEditingAddress(null)}
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          <Plus size={14} />
          Add New
        </button>
      </div>

      {refreshFailed && (
        <p role="status" className="mt-3 text-sm text-red-600">
          Could not refresh saved addresses.{' '}
          <button type="button" className="font-semibold underline" onClick={refreshAddresses}>
            Try again
          </button>
        </p>
      )}

      {addresses.length === 0 ? (
        <div className="mt-3 rounded-2xl bg-muted/60 p-5 text-center">

          <p className="text-sm text-ink-soft">
            No saved addresses yet.
          </p>

          <button
            type="button"
            onClick={() => setEditingAddress(null)}
            className="mt-3 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">

          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="rounded-2xl bg-muted/60 p-5"
            >
              <div className="flex items-start justify-between">

                <div className="flex-1">

                  <p className="text-lg font-bold text-ink">
                    {addr.nameOfCustomer ??
                      fullName}
                  </p>

                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {addr.addressLine ??
                      'No address'}
                  </p>

                  <p className="text-sm text-ink-soft">
                    {addr.state ?? ''},{' '}
                    {addr.country ?? ''}
                  </p>

                  {addr.phoneNumber && (
                    <p className="mt-1 text-xs text-ink-soft">
                      📞 {addr.phoneNumber}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setEditingAddress(addr)}
                  className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark"
                >
                  <Edit2 size={12} />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressModal
        isOpen={editingAddress !== undefined}
        onClose={() => setEditingAddress(undefined)}
        onSaved={async () => {
          void refreshCustomerProfile();
          await refreshAddresses();
        }}
        address={editingAddress}
        defaultEmail={email}
        defaultPhone={phone}
      />
    </div>
  );
}
