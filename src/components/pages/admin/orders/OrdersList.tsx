import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Search, Plus, Bike, Store } from 'lucide-react';
import AdminBottomNav from '../../../admin/AdminBottomNav';
import StatusPill from '../../../admin/StatusPill';
import OrderActionsSheet from './OrderActionsSheet';

type Order = {
  id: string;
  customer: string;
  avatar: string;
  amount: string;
  paymentStatus: 'PAID' | 'UNPAID';
  items: number;
  status: 'Preparing' | 'Pending' | 'Ready for Pickup';
  time: string;
  rider?: string;
  pickupLocation?: string;
  unassigned?: boolean;
};

const orders: Order[] = [
  {
    id: '#DF-9021',
    customer: 'Tunde Kelani',
    avatar: 'https://i.pravatar.cc/80?img=13',
    amount: '₦12,500',
    paymentStatus: 'PAID',
    items: 5,
    status: 'Preparing',
    time: '10:45 AM',
    rider: 'Bolanle J.',
  },
  {
    id: '#DF-9022',
    customer: 'Chioma Uzor',
    avatar: 'https://i.pravatar.cc/80?img=32',
    amount: '₦8,200',
    paymentStatus: 'UNPAID',
    items: 3,
    status: 'Pending',
    time: '11:15 AM',
    unassigned: true,
  },
  {
    id: '#DF-8955',
    customer: 'Abiodun S.',
    avatar: 'https://i.pravatar.cc/80?img=45',
    amount: '₦25,400',
    paymentStatus: 'PAID',
    items: 12,
    status: 'Ready for Pickup',
    time: '09:30 AM',
    pickupLocation: 'Lagos Central H...',
  },
];

const filters = ['All', 'Pending', 'Confirmed', 'Preparing'];

export default function OrdersList() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [actionsOrder, setActionsOrder] = useState<Order | null>(null);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#F3F7EE]">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Orders</h1>
        <button type="button" className="text-primary-dark">
          <MoreVertical size={22} strokeWidth={2} />
        </button>
      </header>

      <div className="px-5 pt-4">
        <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
          <Search size={18} className="text-gray-400" />
          <input
            placeholder="Search order ID, customer..."
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeFilter === f ? 'bg-primary text-white' : 'bg-white text-gray-500'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <main className="flex-1 space-y-3 px-5 pb-28 pt-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <button
                type="button"
                onClick={() => navigate(`/admin/orders/${order.id.replace('#', '')}`)}
                className="flex items-center gap-3 text-left"
              >
                <img
                  src={order.avatar}
                  alt={order.customer}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-gray-900">{order.customer}</p>
                  <p className="text-xs text-gray-400">{order.id}</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActionsOrder(order)}
                aria-label="Order actions"
                className="text-gray-400"
              >
                <MoreVertical size={18} />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Amount</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900">{order.amount}</p>
                  <StatusPill label={order.paymentStatus} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Items</p>
                <p className="font-bold text-gray-900">{order.items} Items</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <StatusPill label={order.status} dot />
              <p className="text-xs text-gray-400">{order.time}</p>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              {order.rider && (
                <>
                  <Bike size={14} className="text-gray-400" />
                  Rider: {order.rider}
                </>
              )}
              {order.unassigned && (
                <>
                  <Bike size={14} className="text-gray-300" />
                  Unassigned
                </>
              )}
              {order.pickupLocation && (
                <>
                  <Store size={14} className="text-gray-400" />
                  {order.pickupLocation}
                </>
              )}
            </div>
          </div>
        ))}
      </main>

      <button
        type="button"
        className="fixed bottom-24 right-5 z-20 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg"
      >
        <Plus size={16} strokeWidth={2.5} />
        Create Manual Order
      </button>

      <AdminBottomNav />

      {actionsOrder && (
        <OrderActionsSheet
          orderId={actionsOrder.id}
          onClose={() => setActionsOrder(null)}
          onNavigate={(path) => {
            setActionsOrder(null);
            navigate(path);
          }}
        />
      )}
    </div>
  );
}
