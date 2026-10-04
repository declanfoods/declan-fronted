import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  Package,
  UtensilsCrossed,
  ClipboardList,
  CreditCard,
  Banknote,
  X,
  User,
} from 'lucide-react';
import { adminOrderApi, type AdminOrderStatus } from '../../../../app/lib/adminOrderApi';
import { AdminProductPickerSheet, type OrderLine } from '../../../admin/AdminProductPickerSheet';

// ─────────────────────────────────────────────────────────────────────────────
// Mock data — swap for real API calls when ready
// ─────────────────────────────────────────────────────────────────────────────

type MockProduct = {
  id: string;
  type: 'PRODUCT' | 'FOODPACK';
  name: string;
  price: number;
  category: string;
  quantity: number;
};

const MOCK_PRODUCTS: MockProduct[] = [
  { id: 'p1', type: 'PRODUCT', name: 'Jollof Rice (Large)', price: 4500, category: 'Food', quantity: 20 },
  { id: 'p2', type: 'PRODUCT', name: 'Chicken Suya (500g)', price: 3200, category: 'Protein', quantity: 15 },
  { id: 'p3', type: 'PRODUCT', name: 'Fresh Tilapia Fish', price: 2800, category: 'Seafood', quantity: 8 },
  { id: 'p4', type: 'PRODUCT', name: 'Palm Oil (1L)', price: 1500, category: 'Pantry', quantity: 50 },
  { id: 'p5', type: 'PRODUCT', name: 'Egusi (1kg)', price: 2200, category: 'Pantry', quantity: 30 },
  { id: 'p6', type: 'PRODUCT', name: 'Plantain Chips (200g)', price: 800, category: 'Snacks', quantity: 100 },
  { id: 'f1', type: 'FOODPACK', name: 'Family Dinner Pack', price: 12500, category: 'Food Pack', quantity: 10 },
  { id: 'f2', type: 'FOODPACK', name: 'Weekend Protein Bundle', price: 9800, category: 'Food Pack', quantity: 5 },
  { id: 'f3', type: 'FOODPACK', name: 'Healthy Starter Pack', price: 7200, category: 'Food Pack', quantity: 12 },
];

const ORDER_STATUSES: AdminOrderStatus[] = [
  'PENDING',
  'PROCESSING',
  'ASSIGNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'CODE_EXCHANGED',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
];

const STATUS_LABEL: Record<AdminOrderStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  ASSIGNED: 'Assigned',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  CODE_EXCHANGED: 'Code Exchanged',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_COLORS: Record<AdminOrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-violet-100 text-violet-700',
  PICKED_UP: 'bg-cyan-100 text-cyan-700',
  IN_TRANSIT: 'bg-orange-100 text-orange-700',
  CODE_EXCHANGED: 'bg-teal-100 text-teal-700',
  DELIVERED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-primary/20 text-primary',
  CANCELLED: 'bg-red-100 text-red-600',
};

type PaymentMethod = 'CASH' | 'TRANSFER';

const PAYMENT_METHODS: { key: PaymentMethod; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    key: 'CASH',
    label: 'Cash',
    sub: 'Customer paid with physical cash',
    icon: <Banknote size={18} />,
  },
  {
    key: 'TRANSFER',
    label: 'Bank Transfer',
    sub: 'Customer transferred to store account',
    icon: <CreditCard size={18} />,
  },
];



function fmt(n: number) {
  return `₦${n.toLocaleString()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <p className="text-sm font-bold text-gray-800">{title}</p>
    </div>
  );
}

export function QtyControl({
  value,
  onInc,
  onDec,
}: {
  value: number;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDec}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 text-primary hover:bg-primary/10"
      >
        <Minus size={12} />
      </button>
      <span className="w-5 text-center text-sm font-bold text-gray-900">{value}</span>
      <button
        type="button"
        onClick={onInc}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/80"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Picker Sheet
// ─────────────────────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────────────────────
// Status Picker Sheet
// ─────────────────────────────────────────────────────────────────────────────

export function StatusPickerSheet({
  current,
  onSelect,
  onClose,
}: {
  current: AdminOrderStatus;
  onSelect: (s: AdminOrderStatus) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mt-auto max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white pb-8">
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>
        <div className="px-5 py-4">
          <p className="text-base font-bold text-gray-900">Set Order Status</p>
          <p className="text-xs text-gray-400">Choose the initial status for this walk-in order</p>
        </div>
        <div className="space-y-2 px-5">
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onSelect(s);
                onClose();
              }}
              className={`flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3 transition-colors ${
                current === s ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/30'
              }`}
            >
              <span className="text-sm font-semibold text-gray-800">{STATUS_LABEL[s]}</span>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[s]}`}>
                  {STATUS_LABEL[s]}
                </span>
                {current === s && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function CreateManualOrder() {
  const navigate = useNavigate();

  // Items
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  // Status
  const [status, setStatus] = useState<AdminOrderStatus>('COMPLETED');
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);

  // Customer details (optional)
  const [customerExpanded, setCustomerExpanded] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Notes
  const [note, setNote] = useState('');

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ── helpers ──────────────────────────────────────────────────────────────

  function toggleLine(incoming: OrderLine) {
    setLines((prev) => {
      const exists = prev.find((l) => l.id === incoming.id);
      if (exists) return prev.filter((l) => l.id !== incoming.id);
      return [...prev, incoming];
    });
  }

  function setQty(id: string, delta: number) {
    setLines((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, quantity: Math.max(1, Math.min(l.maxQty, l.quantity + delta)) }
          : l,
      ),
    );
  }

  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  const subtotal   = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const totalUnits = lines.reduce((s, l) => s + l.quantity, 0);
  const canSubmit  = lines.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Add at least one item to create a walk-in order.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      console.log()
      await adminOrderApi.createWalkInOrder({
        items: lines.map((l) => ({
          id:       l.id,
          itemType: l.itemType,
          quantity: l.quantity,
        })),
        paymentMethod,
        orderStatus: status,
        note:        note.trim() || undefined,
        customer:
          customerName.trim() || customerPhone.trim()
            ? {
                fullname:    customerName.trim()  || undefined,
                phoneNumber: customerPhone.trim() || undefined,
              }
            : undefined,
      });

      navigate('/admin/orders');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasCustomerData = customerName.trim() || customerPhone.trim();

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-36">

      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-primary-dark"
          aria-label="Go back"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Walk-in Order</h1>
        <span className="w-[22px]" />
      </header>

      {/* Context strip */}
      <div className="mx-5 mt-4 flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-3">
        <span className="text-lg">🏪</span>
        <p className="text-xs font-medium text-primary">
          Select products or foodpacks customers have bought, select a payment method and pick an order status.
        </p>
      </div>

      <main className="flex-1 space-y-4 px-5 pt-4">

        {/* ── Order Items ── */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <SectionHeader icon={<Package size={14} />} title="Items" />
            {lines.length > 0 && (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white"
              >
                <Plus size={13} /> Add More
              </button>
            )}
          </div>

          {lines.length === 0 ? (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed
                         border-primary/30 py-8 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Package size={22} className="text-primary" />
              </div>
              <p className="text-sm font-semibold text-primary">Tap to add products or food packs</p>
              <p className="text-xs text-gray-400">Browse the catalogue and select items</p>
            </button>
          ) : (
            <div className="space-y-3">
              {lines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    {line.itemType === 'FOODPACK' ? (
                      <UtensilsCrossed size={16} className="text-primary" />
                    ) : (
                      <Package size={16} className="text-primary" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">{line.name}</p>
                    <p className="text-xs text-gray-400">{fmt(line.price)} each</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <QtyControl
                      value={line.quantity}
                      onInc={() => setQty(line.id, +1)}
                      onDec={() => setQty(line.id, -1)}
                    />
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-red-400 hover:bg-red-50"
                      aria-label={`Remove ${line.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Subtotal */}
              <div className="flex items-center justify-between rounded-xl bg-[#F3F7EE] px-4 py-3">
                <span className="text-sm font-semibold text-gray-500">
                  {totalUnits} unit{totalUnits !== 1 ? 's' : ''}
                </span>
                <span className="text-base font-extrabold text-primary">{fmt(subtotal)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Customer Details (optional) ── */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() => setCustomerExpanded((v) => !v)}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <SectionHeader icon={<User size={14} />} title="Customer Details" />
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-400">
                Optional
              </span>
              {hasCustomerData && !customerExpanded && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${customerExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {customerExpanded && (
            <div className="mt-3 space-y-3">
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-800
                           placeholder:text-gray-400 outline-none focus:border-primary
                           focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-800
                           placeholder:text-gray-400 outline-none focus:border-primary
                           focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-gray-400">
                Leave blank to record this as an anonymous walk-in.
              </p>
            </div>
          )}
        </div>

        {/* ── Payment Method ── */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <SectionHeader icon={<CreditCard size={14} />} title="Payment Method" />
          <div className="space-y-2">
            {PAYMENT_METHODS.map((method) => {
              const selected = paymentMethod === method.key;
              return (
                <button
                  key={method.key}
                  type="button"
                  onClick={() => setPaymentMethod(method.key)}
                  className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-100 hover:border-primary/30'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      selected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {method.icon}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{method.label}</p>
                    <p className="text-xs text-gray-400">{method.sub}</p>
                  </div>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      selected ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Order Status ── */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <SectionHeader icon={<ClipboardList size={14} />} title="Order Status" />
          <button
            type="button"
            onClick={() => setStatusPickerOpen(true)}
            className="flex w-full items-center justify-between rounded-xl border-2 border-primary/20
                       bg-primary/5 px-4 py-3 text-left"
          >
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[status]}`}>
                {STATUS_LABEL[status]}
              </span>
              <span className="text-sm text-gray-600">Initial order state</span>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          <p className="mt-2 text-xs text-gray-400">
            Walk-in orders typically start as Completed. Adjust if the order is still being prepared.
          </p>
        </div>

        {/* ── Admin Note ── */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <SectionHeader icon={<ClipboardList size={14} />} title="Note" />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. Customer requested extra packaging, paid with old notes (optional)"
            className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-800
                       placeholder:text-gray-400 outline-none focus:border-primary
                       focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

      </main>

      {/* ── Fixed bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-100 bg-white p-4">
        {lines.length > 0 && (
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-xs text-gray-500">
              {lines.length} type{lines.length !== 1 ? 's' : ''} ·{' '}
              {totalUnits} unit{totalUnits !== 1 ? 's' : ''} ·{' '}
              <span className="font-semibold text-gray-700">
                {paymentMethod === 'CASH' ? 'Cash' : 'Transfer'}
              </span>
              {hasCustomerData && (
                <>
                  {' · '}
                  <span className="font-semibold text-gray-700">
                    {customerName.trim() || customerPhone.trim()}
                  </span>
                </>
              )}
            </span>
            <span className="text-base font-extrabold text-primary">{fmt(subtotal)}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 rounded-full border-2 border-gray-200 py-3 text-sm font-semibold
                       text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-white
                       disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Record Order'}
          </button>
        </div>
      </div>

      {/* ── Sheets ── */}
      {pickerOpen && (
        <AdminProductPickerSheet
          lines={lines}
          onToggle={toggleLine}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {statusPickerOpen && (
        <StatusPickerSheet
          current={status}
          onSelect={setStatus}
          onClose={() => setStatusPickerOpen(false)}
        />
      )}
    </div>
  );
}