import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, MoreVertical, ArrowRight, Bell } from 'lucide-react';
import { adminOrderApi, type AdminOrder, type AdminOrderStatus } from '../../../../app/lib/adminOrderApi';

// The real order lifecycle (per Declan Foods ops):
// 1. PENDING       -> admin marks as PROCESSING (only admin-triggered step)
// 2. PROCESSING    -> admin assigns a rider -> ASSIGNED
// 3. ASSIGNED      -> rider picks up the order -> PICKED_UP -> IN_TRANSIT (automatic, rider app)
// 4. IN_TRANSIT    -> rider exchanges code at customer's door -> CODE_EXCHANGED (automatic, rider app)
// 5. CODE_EXCHANGED-> customer pays, rider confirms -> DELIVERED (automatic, rider app)
// 6. DELIVERED     -> COMPLETED
// Everything past "Processing" happens on the rider's device, not here.
const stages: { key: AdminOrderStatus; label: string; auto?: boolean }[] = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'PROCESSING', label: 'Confirmed / Processing' },
  { key: 'ASSIGNED', label: 'Rider Assigned' },
  { key: 'PICKED_UP', label: 'Picked Up', auto: true },
  { key: 'IN_TRANSIT', label: 'In Transit', auto: true },
  { key: 'CODE_EXCHANGED', label: 'Code Exchanged', auto: true },
  { key: 'DELIVERED', label: 'Delivered', auto: true },
  { key: 'COMPLETED', label: 'Completed' },
];

export default function UpdateStatus() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [notify, setNotify] = useState(true);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminOrderApi.getOrderById(id);
      setOrder(res.data.data.order);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const currentIndex = stages.findIndex((s) => s.key === order?.status);

  const handleMarkProcessing = async () => {
    if (!id) return;
    setUpdating(true);
    setError('');
    try {
      await adminOrderApi.markAsProcessing(id);
      navigate(`/admin/orders/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F7EE]">
        <p className="text-sm text-gray-400">Loading order...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-28">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <X size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Update Status</h1>
        <button type="button" className="text-primary-dark">
          <MoreVertical size={22} strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 space-y-4 px-5 pt-5">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-400">ORDER REFERENCE</p>
            <p className="text-lg font-bold text-gray-900">
              {order?.orderNumber ?? `#${id?.slice(0, 8)}`}
            </p>
          </div>
          <span className="rounded-full bg-[#F3F7EE] px-3 py-1 text-xs font-semibold text-primary-dark">
            Priority Handling
          </span>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          {stages.map((stage, idx) => {
            const done = currentIndex >= 0 && idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const upcoming = currentIndex >= 0 ? idx > currentIndex : true;

            return (
              <div key={stage.key}>
                <div className="flex items-center gap-3 py-2">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      done
                        ? 'bg-primary text-white'
                        : isCurrent
                        ? 'border-2 border-primary bg-white'
                        : 'bg-gray-100 text-gray-300'
                    }`}
                  >
                    {done ? '✓' : isCurrent ? <span className="h-2.5 w-2.5 rounded-full bg-primary" /> : ''}
                  </span>
                  <div className="flex flex-1 items-center justify-between">
                    <p
                      className={`text-sm font-bold ${
                        done || isCurrent ? 'text-primary' : 'text-gray-300'
                      }`}
                    >
                      {stage.label}
                    </p>
                    <p className="text-xs text-gray-400">
                      {done ? 'Completed' : isCurrent ? 'In progress' : upcoming ? 'Upcoming' : ''}
                    </p>
                  </div>
                </div>

                {isCurrent && stage.key === 'PENDING' && (
                  <div className="ml-10 mb-3 mt-1">
                    <button
                      type="button"
                      disabled={updating}
                      onClick={handleMarkProcessing}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {updating ? 'Updating...' : 'Move to Processing'}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {isCurrent && stage.key === 'PROCESSING' && (
                  <div className="ml-10 mb-3 mt-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/orders/${id}/assign-rider`)}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white"
                    >
                      Assign a Rider
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {isCurrent && stage.auto && (
                  <p className="ml-10 mb-3 mt-1 text-xs text-gray-400">
                    This step updates automatically from the rider&apos;s app — no admin action
                    needed.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-gray-400" />
            <p className="text-sm font-semibold text-gray-800">Notify Customer</p>
          </div>
          <button
            type="button"
            onClick={() => setNotify((v) => !v)}
            className={`h-6 w-11 rounded-full transition-colors ${notify ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                notify ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </main>
    </div>
  );
}
