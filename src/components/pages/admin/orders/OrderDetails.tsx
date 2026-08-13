import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical, User, MapPin, Phone, UtensilsCrossed, HeadphonesIcon, XCircle, Check } from 'lucide-react';

const items = [
  { name: 'Large African Yam', meta: 'Qty: 2 • ₦3,500 each', price: '₦7,000', img: '🍠' },
  { name: 'Fresh Tomatoes (Big Basket)', meta: 'Qty: 1 • ₦4,000 each', price: '₦4,000', img: '🍅' },
  { name: 'Vegetable Oil (2L)', meta: 'Qty: 1 • ₦1,500 each', price: '₦1,500', img: '🛢️' },
];

const stages = ['Placed', 'Preparing', 'Transit', 'Arrived'];

export default function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-28">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Order Details</h1>
        <button type="button" className="text-primary-dark">
          <MoreVertical size={22} strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 space-y-4 px-5 pt-5">
        <div className="rounded-2xl bg-primary p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <UtensilsCrossed size={16} />
              </span>
              <div>
                <p className="text-xs text-white/80">CURRENT STATE</p>
                <p className="font-bold">Preparing</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/80">Est. Delivery</p>
              <p className="font-bold">12:45 PM</p>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-between px-2">
          <div className="absolute left-6 right-6 top-3 h-0.5 bg-gray-200" />
          {stages.map((stage, idx) => (
            <div key={stage} className="relative z-10 flex flex-col items-center gap-1.5">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                  idx < 2
                    ? 'border-primary bg-primary text-white'
                    : idx === 1
                    ? 'border-primary bg-white text-primary'
                    : 'border-gray-200 bg-white text-gray-300'
                }`}
              >
                {idx === 0 ? <Check size={12} /> : idx === 1 ? <span className="h-2 w-2 rounded-full bg-primary" /> : ''}
              </span>
              <span className={`text-xs font-medium ${idx <= 1 ? 'text-primary' : 'text-gray-300'}`}>
                {stage}
              </span>
            </div>
          ))}
        </div>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-gray-400">CUSTOMER</p>
            <User size={16} className="text-gray-300" />
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
              TK
            </span>
            <div>
              <p className="font-bold text-gray-900">Tunde Kelani</p>
              <p className="text-sm text-gray-500">+234 802 123 4567</p>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#F3F7EE] p-3 text-sm text-gray-600">
            <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
            Block 4, Unilag Hall, Akoka, Yaba, Lagos.
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-gray-400">ASSIGNED RIDER</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/80?img=13"
                alt="Bolanle J."
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-gray-900">Bolanle J.</p>
                <p className="text-xs text-gray-400">★ 4.8 · 240+ deliveries</p>
              </div>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F7EE] text-primary"
            >
              <Phone size={16} />
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Ordered Items</h2>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
              {items.length} Items
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.name} className="flex items-center gap-3 py-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F7EE] text-xl">
                  {item.img}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.meta}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{item.price}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-gray-900">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold text-gray-800">₦12,500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span className="font-semibold text-gray-800">₦500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Discount</span>
              <span className="font-semibold text-primary">-₦500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Wallet Balance Used</span>
              <span className="font-semibold text-gray-800">₦0.00</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-primary">₦12,500</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-[#F3F7EE] p-3">
            <div>
              <p className="text-xs text-gray-400">Payment Method</p>
              <p className="text-sm font-semibold text-gray-800">Cash on Delivery</p>
            </div>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
              PENDING
            </span>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-gray-900">Order Timeline</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <UtensilsCrossed size={14} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">Preparing Order</p>
                  <span className="text-xs text-gray-400">11:15 AM</span>
                </div>
                <p className="text-xs text-gray-500">The kitchen team is currently packing your items at the hub.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <Check size={14} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">Order Confirmed</p>
                  <span className="text-xs text-gray-400">10:55 AM</span>
                </div>
                <p className="text-xs text-gray-500">Order received and system validated.</p>
              </div>
            </div>
            <div className="flex gap-3 opacity-50">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                <Check size={14} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-700">Order Placed</p>
                  <span className="text-xs text-gray-400">10:52 AM</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col items-center gap-4 pb-2 pt-2">
          <button type="button" className="flex items-center gap-2 text-sm font-semibold text-primary">
            <HeadphonesIcon size={16} />
            Contact Customer Support
          </button>
          <button type="button" className="flex items-center gap-2 text-sm font-semibold text-red-500">
            <XCircle size={16} />
            Cancel Order
          </button>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 flex gap-3 border-t border-gray-100 bg-white p-4">
        <button
          type="button"
          onClick={() => navigate(`/admin/orders/${id}/assign-rider`)}
          className="flex-1 rounded-full border-2 border-primary py-3 text-sm font-semibold text-primary"
        >
          Assign Rider
        </button>
        <button
          type="button"
          onClick={() => navigate(`/admin/orders/${id}/update-status`)}
          className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-white"
        >
          Update Status
        </button>
      </div>
    </div>
  );
}
