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
} from 'lucide-react';
import type { AdminOrderStatus } from '../../../../app/lib/adminOrderApi';

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

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type OrderLine = {
  product: MockProduct;
  qty: number;
};

type Tab = 'PRODUCT' | 'FOODPACK';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

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

function QtyControl({
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

function ProductPickerSheet({
  lines,
  onToggle,
  onClose,
}: {
  lines: OrderLine[];
  onToggle: (product: MockProduct) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>('PRODUCT');
  const [search, setSearch] = useState('');

  const visible = MOCK_PRODUCTS.filter(
    (p) =>
      p.type === tab &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase())),
  );

  const selectedIds = new Set(lines.map((l) => l.product.id));

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mt-auto flex max-h-[85vh] flex-col rounded-t-3xl bg-white">
        {/* Handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-base font-bold text-gray-900">Add Items</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab toggle */}
        <div className="mx-5 mb-3 flex rounded-full bg-gray-100 p-1">
          {(['PRODUCT', 'FOODPACK'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors ${
                tab === t ? 'bg-primary text-white shadow-sm' : 'text-gray-500'
              }`}
            >
              {t === 'PRODUCT' ? <Package size={13} /> : <UtensilsCrossed size={13} />}
              {t === 'PRODUCT' ? 'Products' : 'Food Packs'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mx-5 mb-3 flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2.5">
          <Search size={15} className="shrink-0 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'PRODUCT' ? 'Search products...' : 'Search food packs...'}
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {visible.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">No items found.</p>
          )}
          <div className="space-y-2">
            {visible.map((product) => {
              const selected = selectedIds.has(product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onToggle(product)}
                  className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors ${
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-100 bg-white hover:border-primary/30'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      selected ? 'bg-primary/10' : 'bg-gray-100'
                    }`}
                  >
                    {product.type === 'FOODPACK' ? (
                      <UtensilsCrossed size={18} className={selected ? 'text-primary' : 'text-gray-400'} />
                    ) : (
                      <Package size={18} className={selected ? 'text-primary' : 'text-gray-400'} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400">
                      {product.category} · {product.quantity} in stock
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-bold text-primary">{fmt(product.price)}</p>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        selected ? 'border-primary bg-primary' : 'border-gray-300'
                      }`}
                    >
                      {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Picker Sheet
// ─────────────────────────────────────────────────────────────────────────────

function StatusPickerSheet({
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

export default function ManualOrder() {
  const navigate = useNavigate();

  // Items
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  // Status
  const [status, setStatus] = useState<AdminOrderStatus>('COMPLETED');
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);

  // Notes
  const [note, setNote] = useState('');

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ── helpers ──────────────────────────────────────────────────────────────

  function toggleProduct(product: MockProduct) {
    setLines((prev) => {
      const exists = prev.find((l) => l.product.id === product.id);
      if (exists) return prev.filter((l) => l.product.id !== product.id);
      return [...prev, { product, qty: 1 }];
    });
  }

  function setQty(productId: string, delta: number) {
    setLines((prev) =>
      prev.map((l) =>
        l.product.id === productId
          ? { ...l, qty: Math.max(1, Math.min(l.product.quantity, l.qty + delta)) }
          : l,
      ),
    );
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  }

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const totalUnits = lines.reduce((s, l) => s + l.qty, 0);

  const canSubmit = lines.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Add at least one item to create a walk-in order.');
      return;
    }
    setError('');
    setSubmitting(true);

    // TODO: wire to adminOrderApi.createManualOrder(payload)
    // payload shape:
    // {
    //   items: lines.map(l => ({ itemId: l.product.id, quantity: l.qty, type: l.product.type })),
    //   paymentMethod,
    //   orderStatus: status,
    //   note: note || undefined,
    // }
    await new Promise((r) => setTimeout(r, 1000));

    setSubmitting(false);
    navigate('/admin/orders');
  };

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
                  key={line.product.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    {line.product.type === 'FOODPACK' ? (
                      <UtensilsCrossed size={16} className="text-primary" />
                    ) : (
                      <Package size={16} className="text-primary" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">{line.product.name}</p>
                    <p className="text-xs text-gray-400">{fmt(line.product.price)} each</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <QtyControl
                      value={line.qty}
                      onInc={() => setQty(line.product.id, +1)}
                      onDec={() => setQty(line.product.id, -1)}
                    />
                    <button
                      type="button"
                      onClick={() => removeLine(line.product.id)}
                      className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-red-400 hover:bg-red-50"
                      aria-label={`Remove ${line.product.name}`}
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
              {lines.length} product type{lines.length !== 1 ? 's' : ''} ·{' '}
              {totalUnits} unit{totalUnits !== 1 ? 's' : ''} ·{' '}
              <span className="font-semibold text-gray-700">{paymentMethod === 'CASH' ? 'Cash' : 'Transfer'}</span>
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
        <ProductPickerSheet
          lines={lines}
          onToggle={toggleProduct}
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