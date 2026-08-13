import { useState, useRef,  } from 'react';
import { User, Phone, MapPin, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RiderLayout from './RiderLayout';
import { mockOrders, type RiderOrder, type OrderStatus } from '../../data/orders';
import { formatNaira } from '../../data/products';


const STATUS_LABELS: Record<OrderStatus, string> = {
  assigned: 'Assigned',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  assigned: 'bg-primary text-white',
  picked_up: 'border border-primary text-primary bg-white',
  in_transit: 'bg-accent text-white',
  delivered: 'bg-gray-300 text-gray-700',
};

// ─── Delivery Code Modal ───────────────────────────────────────────────────────
function DeliveryCodeModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 3) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs[i - 1].current?.focus();
    }
  };

  const isFull = digits.every((d) => d !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#D9D9D9]/80 px-6">
      <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl">
        <p className="mb-6 text-center text-sm font-medium text-ink">
          Ask customer for 4-digit Code. Enter it below to confirm delivery
        </p>

        {/* 4 digit inputs */}
        <div className="mb-8 flex items-center justify-center gap-3">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-14 w-14 rounded-xl border border-gray-200 bg-white text-center text-2xl font-bold text-ink shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isFull}
            className="flex-1 rounded-full border border-primary py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-40"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Confirmed Modal ───────────────────────────────────────────────────
function PaymentConfirmedModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#D9D9D9]/80 px-6">
      <div className="relative w-full max-w-xs rounded-2xl bg-white p-8 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} strokeWidth={2} />
        </button>

        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary">
            <CheckCircle size={44} className="text-primary" strokeWidth={1.5} />
          </div>
          <p className="text-base font-semibold text-ink">Payment confirmed</p>
          <button
            type="button"
            onClick={() => navigate('/rider/home')}
            className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order: initial }: { order: RiderOrder }) {
  const [status, setStatus] = useState<OrderStatus>(initial.status);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showConfirmedModal, setShowConfirmedModal] = useState(false);

  const total = initial.items.reduce((s, i) => s + i.price, 0);
  const showDelivery = status !== 'assigned';

  const handleCTA = () => {
    if (status === 'assigned') return setStatus('picked_up');
    if (status === 'picked_up') return setStatus('in_transit');
    if (status === 'in_transit') return setShowCodeModal(true);
    if (status === 'delivered') return setShowConfirmedModal(true);
  };

  const ctaLabel: Record<OrderStatus, string> = {
    assigned: 'Mark as Picked Up',
    picked_up: 'Start Delivery',
    in_transit: 'Enter Delivery Code',
    delivered: 'Confirm Payment',
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <p className="text-sm font-bold text-primary">{initial.id}</p>
          <span
            className={
              'rounded-full px-3 py-1 text-xs font-semibold ' +
              STATUS_COLORS[status]
            }
          >
            {STATUS_LABELS[status]}
          </span>
        </div>

        {/* Customer */}
        <div className="mb-3 space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <User size={16} className="text-primary" strokeWidth={2} />
            {initial.customerName}
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Phone size={16} className="text-primary" strokeWidth={2} />
            {initial.phone}
          </div>
        </div>

        {/* Items */}
        <p className="mb-2 text-sm font-semibold text-ink">Items</p>
        <div className="space-y-1">
          {initial.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-gray-700">
              <span>{item.name}</span>
              <span className="font-medium">{formatNaira(item.price)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-sm font-bold text-ink">
          <span>Total (₦)</span>
          <span className="text-primary">{formatNaira(total)}</span>
        </div>

        {/* Delivery details */}
        {showDelivery && (
          <div className="mt-4 rounded-xl bg-gray-100 p-4 text-sm">
            <div className="mb-2 flex items-center gap-2 font-semibold text-primary">
              <MapPin size={16} strokeWidth={2} />
              Delivery Details
            </div>
            <p className="font-semibold text-primary">{initial.deliveryName}</p>
            <p className="whitespace-pre-line text-gray-700">
              {initial.deliveryAddress}
            </p>
            <p className="text-primary">{initial.deliveryPhone}</p>
            <p className="mt-2 text-primary">
              Delivery Instructions: {initial.deliveryInstructions}
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={handleCTA}
          className="mt-4 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          {ctaLabel[status]}
        </button>
      </div>

      {/* Modals */}
      {showCodeModal && (
        <DeliveryCodeModal
          onConfirm={() => {
            setShowCodeModal(false);
            setStatus('delivered');
          }}
          onCancel={() => setShowCodeModal(false)}
        />
      )}

      {showConfirmedModal && (
        <PaymentConfirmedModal onClose={() => setShowConfirmedModal(false)} />
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RiderDeliveries() {
  return (
    <RiderLayout>
      <h2 className="mb-1 text-xl font-bold text-ink">My Deliveries</h2>
      <p className="mb-6 text-sm text-gray-500">
        Manage your assigned orders and deliveries
      </p>
      <div className="space-y-5">
        {mockOrders.map((order, i) => (
          <OrderCard key={i} order={order} />
        ))}
      </div>
    </RiderLayout>
  );
}