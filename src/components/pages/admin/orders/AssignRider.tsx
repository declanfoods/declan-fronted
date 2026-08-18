import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { adminOrderApi, type AdminOrder } from '../../../../app/lib/adminOrderApi';
import {
  adminRiderApi,
  extractRidersList,
  type DeliveryRider,
} from '../../../../app/lib/adminRiderApi';

function formatAmount(amount: unknown) {
  const num = Number(amount);
  return Number.isNaN(num) ? '—' : `₦${num.toLocaleString()}`;
}

export default function AssignRider() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [riders, setRiders] = useState<DeliveryRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([adminOrderApi.getOrderById(id), adminRiderApi.getDeliveryRiders()])
      .then(([orderRes, ridersRes]) => {
        setOrder(orderRes.data.data.order);
        setRiders(extractRidersList(ridersRes.data.data));
      })
      .catch((err) => setError(err.response?.data?.message ?? 'Failed to load riders.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAssign = async (riderId: string) => {
    if (!id) return;
    setAssigningId(riderId);
    setError('');
    try {
      await adminOrderApi.assignRider(id, { riderId });
      navigate(`/admin/orders/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to assign rider.');
    } finally {
      setAssigningId(null);
    }
  };

  const filteredRiders = riders.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.fullname.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Assign Delivery</h1>
        <span className="w-[22px]" />
      </header>

      <div className="px-5 pt-4">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm">
          <Search size={16} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders or riders..."
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {error && (
        <p className="mx-5 mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {loading && <p className="px-5 pt-6 text-sm text-gray-400">Loading...</p>}

      {!loading && order && (
        <div className="mx-5 mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase text-rose-600">
              {order.status === 'PENDING' ? 'Urgent' : order.status.replace('_', ' ')}
            </span>
            <p className="font-bold text-primary">{formatAmount(order.totalAmount)}</p>
          </div>
          <p className="mt-2 font-bold text-gray-900">
            Order {order.orderNumber ?? `#${order.id.slice(0, 8)}`}
          </p>
          {order.createdAt && (
            <p className="text-xs text-gray-400">
              Placed {new Date(order.createdAt).toLocaleString()}
            </p>
          )}

          <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="text-xs font-semibold text-gray-400">PICKUP</p>
                <p className="text-sm text-gray-700">Declan Hub - Central Warehouse</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 text-red-500" />
              <div>
                <p className="text-xs font-semibold text-gray-400">DELIVERY</p>
                <p className="text-sm text-gray-700">
                  Customer address
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <div className="mx-5 mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Available Riders</h2>
            <span className="text-xs text-gray-400">Showing {filteredRiders.length} riders</span>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5">
              <Search size={14} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by name or ID..."
                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
            </div>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500"
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>

          <div className="space-y-2">
            {filteredRiders.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">No riders found.</p>
            )}
            {filteredRiders.map((rider) => (
              <div
                key={rider.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 p-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={rider.profilePictureUrl || `https://i.pravatar.cc/80?u=${rider.id}`}
                    alt={rider.fullname}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{rider.fullname}</p>
                    <p className="text-xs text-gray-400">
                      {rider.phoneNumberOne}
                      {rider.isSuspended && (
                        <span className="ml-2 font-semibold text-red-500">Suspended</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={rider.isSuspended || assigningId === rider.id}
                  onClick={() => handleAssign(rider.id)}
                  className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                >
                  {assigningId === rider.id ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
